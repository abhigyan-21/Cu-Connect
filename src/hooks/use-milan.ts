"use client";

import { useEffect, useCallback, useReducer, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./use-toast";
import Peer, { MediaConnection } from "peerjs";

interface RemotePeer {
  id: string;
  connection: MediaConnection;
  stream?: MediaStream;
}

export interface MediaDeviceState {
  audioInputs: MediaDeviceInfo[];
  videoInputs: MediaDeviceInfo[];
  audioOutputs: MediaDeviceInfo[];
}

export interface MilanState {
  localStream: MediaStream | null;
  remotePeers: Record<string, RemotePeer>;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  devices: MediaDeviceState;
}

type MilanAction =
  | { type: "SET_LOCAL_STREAM"; stream: MediaStream | null }
  | { type: "ADD_REMOTE_PEER"; peer: RemotePeer }
  | { type: "REMOVE_REMOTE_PEER"; peerId: string }
  | { type: "SET_REMOTE_STREAM"; peerId: string; stream: MediaStream }
  | { type: "SET_AUDIO_ENABLED"; enabled: boolean }
  | { type: "SET_VIDEO_ENABLED"; enabled: boolean }
  | { type: "SET_SCREEN_SHARING"; enabled: boolean }
  | { type: "SET_DEVICES"; devices: MediaDeviceState }
  | { type: "RESET_STATE" };

const initialState: MilanState = {
  localStream: null,
  remotePeers: {},
  isAudioEnabled: true,
  isVideoEnabled: true,
  isScreenSharing: false,
  devices: { audioInputs: [], videoInputs: [], audioOutputs: [] },
};

function milanReducer(state: MilanState, action: MilanAction): MilanState {
  switch (action.type) {
    case "SET_LOCAL_STREAM":
      return { ...state, localStream: action.stream };
    case "ADD_REMOTE_PEER":
      return {
        ...state,
        remotePeers: { ...state.remotePeers, [action.peer.id]: action.peer },
      };
    case "REMOVE_REMOTE_PEER":
      const newPeers = { ...state.remotePeers };
      delete newPeers[action.peerId];
      return { ...state, remotePeers: newPeers };
    case "SET_REMOTE_STREAM":
        if (state.remotePeers[action.peerId]) {
            const updatedPeers = { ...state.remotePeers };
            updatedPeers[action.peerId].stream = action.stream;
            return { ...state, remotePeers: updatedPeers };
        }
        return state;
    case "SET_AUDIO_ENABLED":
      return { ...state, isAudioEnabled: action.enabled };
    case "SET_VIDEO_ENABLED":
      return { ...state, isVideoEnabled: action.enabled };
    case "SET_SCREEN_SHARING":
      return { ...state, isScreenSharing: action.enabled };
    case "SET_DEVICES":
      return { ...state, devices: action.devices };
    case "RESET_STATE":
        return initialState;
    default:
      return state;
  }
}

export function useMilan(roomId: string) {
  const [state, dispatch] = useReducer(milanReducer, initialState);
  const router = useRouter();
  const { toast } = useToast();
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const peersRef = useRef<Map<string, MediaConnection>>(new Map());

  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter((d) => d.kind === "audioinput");
      const videoInputs = devices.filter((d) => d.kind === "videoinput");
      const audioOutputs = devices.filter((d) => d.kind === "audiooutput");
      dispatch({ type: "SET_DEVICES", devices: { audioInputs, videoInputs, audioOutputs } });
    } catch (error) {
      console.error("Error enumerating devices:", error);
      toast({ title: "Could not list devices", description: "Please check your browser permissions.", variant: "destructive" });
    }
  }, [toast]);

  const getMedia = useCallback(async (constraints?: MediaStreamConstraints) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        constraints || { video: true, audio: true }
      );
      cameraStreamRef.current = stream;
      dispatch({ type: "SET_LOCAL_STREAM", stream });
      await getDevices();
    } catch (error) {
      console.error("Error accessing media devices.", error);
      toast({ title: "Media Access Denied", description: "Please allow access to your camera and microphone.", variant: "destructive" });
      router.push("/");
    }
  }, [getDevices, toast, router]);

  useEffect(() => {
    getMedia();
    return () => {
        state.localStream?.getTracks().forEach(track => track.stop());
        cameraStreamRef.current?.getTracks().forEach(track => track.stop());
        peerRef.current?.destroy();
        dispatch({ type: 'RESET_STATE' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize PeerJS and handle connections
  useEffect(() => {
    if (!state.localStream) return;

    // Initialize PeerJS with room-based peer ID
    const peer = new Peer(`${roomId}-${Math.random().toString(36).substr(2, 9)}`, {
      host: '0.peerjs.com',
      port: 443,
      path: '/',
      secure: true,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    });

    peer.on('open', (id) => {
      console.log('My peer ID:', id);
      toast({ 
        title: "Connected!", 
        description: "You're now in the room. Share the room ID with others to join.",
      });

      // Broadcast presence to other peers in the room
      broadcastToRoom(peer, roomId, id);
    });

    peer.on('call', (call) => {
      console.log('Receiving call from:', call.peer);
      
      // Answer the call with our stream
      call.answer(state.localStream!);
      
      call.on('stream', (remoteStream) => {
        console.log('Received remote stream from:', call.peer);
        
        dispatch({
          type: 'ADD_REMOTE_PEER',
          peer: {
            id: call.peer,
            connection: call,
            stream: remoteStream,
          },
        });
        
        peersRef.current.set(call.peer, call);
      });

      call.on('close', () => {
        console.log('Call closed with:', call.peer);
        dispatch({ type: 'REMOVE_REMOTE_PEER', peerId: call.peer });
        peersRef.current.delete(call.peer);
      });

      call.on('error', (err) => {
        console.error('Call error:', err);
        dispatch({ type: 'REMOVE_REMOTE_PEER', peerId: call.peer });
        peersRef.current.delete(call.peer);
      });
    });

    peer.on('connection', (conn) => {
      conn.on('data', (data: any) => {
        if (data.type === 'join-room' && data.roomId === roomId) {
          // New peer joined, call them
          console.log('New peer joined room:', data.peerId);
          callPeer(peer, data.peerId, state.localStream!);
        }
      });
    });

    peer.on('error', (err) => {
      console.error('PeerJS error:', err);
      if (err.type === 'peer-unavailable') {
        // Peer disconnected, remove them
        const peerId = err.message.split(' ').pop();
        if (peerId) {
          dispatch({ type: 'REMOVE_REMOTE_PEER', peerId });
          peersRef.current.delete(peerId);
        }
      }
    });

    peerRef.current = peer;

    return () => {
      peer.destroy();
    };
  }, [state.localStream, roomId, toast]);

  // Helper function to call a peer
  const callPeer = (peer: Peer, remotePeerId: string, stream: MediaStream) => {
    if (peersRef.current.has(remotePeerId)) {
      console.log('Already connected to:', remotePeerId);
      return;
    }

    console.log('Calling peer:', remotePeerId);
    const call = peer.call(remotePeerId, stream);

    call.on('stream', (remoteStream) => {
      console.log('Received stream from:', remotePeerId);
      
      dispatch({
        type: 'ADD_REMOTE_PEER',
        peer: {
          id: remotePeerId,
          connection: call,
          stream: remoteStream,
        },
      });
      
      peersRef.current.set(remotePeerId, call);
    });

    call.on('close', () => {
      console.log('Call closed with:', remotePeerId);
      dispatch({ type: 'REMOVE_REMOTE_PEER', peerId: remotePeerId });
      peersRef.current.delete(remotePeerId);
    });

    call.on('error', (err) => {
      console.error('Call error with', remotePeerId, ':', err);
      dispatch({ type: 'REMOVE_REMOTE_PEER', peerId: remotePeerId });
      peersRef.current.delete(remotePeerId);
    });
  };

  // Helper function to broadcast presence to room
  const broadcastToRoom = (peer: Peer, roomId: string, myPeerId: string) => {
    // In a production app, you'd use a proper room management system
    // For now, we'll use a simple approach with peer IDs containing the room ID
    console.log('Broadcasting presence to room:', roomId);
    
    // Try to connect to potential peers in the room
    // This is a simplified approach - in production, use a proper signaling server
    const roomPrefix = `${roomId}-`;
    
    // Store our peer ID in localStorage for other tabs/users to discover
    const roomPeers = JSON.parse(localStorage.getItem(`room-${roomId}`) || '[]');
    if (!roomPeers.includes(myPeerId)) {
      roomPeers.push(myPeerId);
      localStorage.setItem(`room-${roomId}`, JSON.stringify(roomPeers));
    }

    // Try to connect to existing peers
    roomPeers.forEach((peerId: string) => {
      if (peerId !== myPeerId && state.localStream) {
        setTimeout(() => {
          callPeer(peer, peerId, state.localStream!);
        }, 1000);
      }
    });

    // Listen for storage changes (other tabs/users joining)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `room-${roomId}` && e.newValue) {
        const newPeers = JSON.parse(e.newValue);
        newPeers.forEach((peerId: string) => {
          if (peerId !== myPeerId && !peersRef.current.has(peerId) && state.localStream) {
            callPeer(peer, peerId, state.localStream!);
          }
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      // Clean up our peer ID from localStorage
      const peers = JSON.parse(localStorage.getItem(`room-${roomId}`) || '[]');
      const filtered = peers.filter((id: string) => id !== myPeerId);
      localStorage.setItem(`room-${roomId}`, JSON.stringify(filtered));
    };
  };

  const replaceTrack = (track: MediaStreamTrack) => {
    if (state.localStream) {
      // Replace track in all peer connections
      peersRef.current.forEach((call) => {
        const sender = call.peerConnection
          .getSenders()
          .find((s) => s.track?.kind === track.kind);
        if (sender) {
          sender.replaceTrack(track);
        }
      });

      const newStream = new MediaStream([track, ...state.localStream.getAudioTracks()]);
      dispatch({ type: 'SET_LOCAL_STREAM', stream: newStream });
    }
  }

  const toggleScreenShare = useCallback(async () => {
    if (state.isScreenSharing) {
      // Stop screen share and revert to camera
      state.localStream?.getTracks().forEach(track => track.stop());
      if (cameraStreamRef.current) {
        const videoTrack = cameraStreamRef.current.getVideoTracks()[0];
        replaceTrack(videoTrack);
        dispatch({ type: 'SET_VIDEO_ENABLED', enabled: true });
      } else {
        // Fallback if camera stream is lost
        await getMedia({ video: true, audio: true });
      }
      dispatch({ type: "SET_SCREEN_SHARING", enabled: false });
      return;
    }

    // Start screen share
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      
      // When user stops sharing via browser UI
      screenTrack.onended = () => {
        if(cameraStreamRef.current){
          const videoTrack = cameraStreamRef.current.getVideoTracks()[0];
          replaceTrack(videoTrack);
          dispatch({ type: "SET_SCREEN_SHARING", enabled: false });
          dispatch({ type: 'SET_VIDEO_ENABLED', enabled: true });
        }
      };

      replaceTrack(screenTrack);
      dispatch({ type: "SET_SCREEN_SHARING", enabled: true });
      dispatch({ type: 'SET_VIDEO_ENABLED', enabled: false }); // Disable video toggle
    } catch (error) {
      console.error("Error starting screen share:", error);
      toast({ title: "Screen Share Failed", description: "Could not start screen sharing.", variant: "destructive" });
    }
  }, [state.isScreenSharing, state.localStream, getMedia, toast]);


  const toggleAudio = useCallback(() => {
    if (state.localStream) {
      const audioTracks = state.localStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !state.isAudioEnabled;
      });
      dispatch({ type: "SET_AUDIO_ENABLED", enabled: !state.isAudioEnabled });
    }
  }, [state.localStream, state.isAudioEnabled]);

  const toggleVideo = useCallback(() => {
    if (state.isScreenSharing) return;
    if (state.localStream) {
      const videoTracks = state.localStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !state.isVideoEnabled;
      });
      dispatch({ type: "SET_VIDEO_ENABLED", enabled: !state.isVideoEnabled });
    }
  }, [state.localStream, state.isVideoEnabled, state.isScreenSharing]);

  const changeDevice = useCallback(async (kind: MediaDeviceKind, deviceId: string) => {
    if (state.isScreenSharing) {
        toast({ title: "Cannot change device", description: "Please stop screen sharing before changing devices.", variant: "destructive" });
        return;
    }
    const constraints = kind === 'audioinput' 
        ? { audio: { deviceId: { exact: deviceId } }, video: true }
        : { audio: true, video: { deviceId: { exact: deviceId } } };
    
    state.localStream?.getTracks().forEach(track => track.stop());
    await getMedia(constraints as MediaStreamConstraints);
    toast({ title: "Device changed", description: "Your media device has been updated." });
  }, [state.localStream, getMedia, toast, state.isScreenSharing]);

  const leaveRoom = useCallback(() => {
    state.localStream?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current?.getTracks().forEach(track => track.stop());
    
    // Close all peer connections
    peersRef.current.forEach((call) => call.close());
    peersRef.current.clear();
    
    // Clean up from room
    if (peerRef.current) {
      const myPeerId = peerRef.current.id;
      const peers = JSON.parse(localStorage.getItem(`room-${roomId}`) || '[]');
      const filtered = peers.filter((id: string) => id !== myPeerId);
      localStorage.setItem(`room-${roomId}`, JSON.stringify(filtered));
      
      peerRef.current.destroy();
    }
    
    dispatch({ type: "RESET_STATE" });
    router.push("/");
  }, [state.localStream, roomId, router]);

  return {
    state,
    actions: {
      toggleAudio,
      toggleVideo,
      toggleScreenShare,
      leaveRoom,
      selectDevice: changeDevice,
    },
  };
}
