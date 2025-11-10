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

    // Generate unique peer ID
    const myPeerId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const peer = new Peer(myPeerId, {
      host: '0.peerjs.com',
      port: 443,
      path: '/',
      secure: true,
      debug: 2, // Enable debug logging
      config: {
        iceServers: [
          // Multiple STUN servers for redundancy
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' },
          // Metered TURN servers (primary - more reliable)
          {
            urls: 'turn:a.relay.metered.ca:80',
            username: 'e46a735f4c26d71c3e6e9f1f',
            credential: 'tEgvhMDLK8F8BCAK',
          },
          {
            urls: 'turn:a.relay.metered.ca:80?transport=tcp',
            username: 'e46a735f4c26d71c3e6e9f1f',
            credential: 'tEgvhMDLK8F8BCAK',
          },
          {
            urls: 'turn:a.relay.metered.ca:443',
            username: 'e46a735f4c26d71c3e6e9f1f',
            credential: 'tEgvhMDLK8F8BCAK',
          },
          {
            urls: 'turn:a.relay.metered.ca:443?transport=tcp',
            username: 'e46a735f4c26d71c3e6e9f1f',
            credential: 'tEgvhMDLK8F8BCAK',
          },
          // Twilio TURN as backup
          {
            urls: 'turn:global.turn.twilio.com:3478?transport=udp',
            username: 'f4b4035eaa76f4a55de5f4351567653ee4ff6fa97b50b6b334fcc1be9c27212d',
            credential: 'w1uxM55V9yVoqyVFjt+mxDBV0F87AUCemaYVQGxsPLw=',
          },
          {
            urls: 'turn:global.turn.twilio.com:3478?transport=tcp',
            username: 'f4b4035eaa76f4a55de5f4351567653ee4ff6fa97b50b6b334fcc1be9c27212d',
            credential: 'w1uxM55V9yVoqyVFjt+mxDBV0F87AUCemaYVQGxsPLw=',
          },
          {
            urls: 'turn:global.turn.twilio.com:443?transport=tcp',
            username: 'f4b4035eaa76f4a55de5f4351567653ee4ff6fa97b50b6b334fcc1be9c27212d',
            credential: 'w1uxM55V9yVoqyVFjt+mxDBV0F87AUCemaYVQGxsPLw=',
          },
        ],
        iceTransportPolicy: 'relay', // Force TURN relay for testing (change to 'all' for production)
        iceCandidatePoolSize: 10,
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
      },
    });

    peer.on('open', (id) => {
      console.log('My peer ID:', id);
      
      // Register with room using a simple API
      registerWithRoom(peer, roomId, id);
    });

    peer.on('call', (call) => {
      console.log('Receiving call from:', call.peer);
      
      if (!state.localStream) {
        console.error('No local stream available to answer call');
        return;
      }
      
      // Log our stream before answering
      console.log('Answering with local stream:', state.localStream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
      
      // Answer the call with our stream
      call.answer(state.localStream);
      
      call.on('stream', (remoteStream) => {
        console.log('Received remote stream from:', call.peer);
        console.log('Remote stream tracks:', remoteStream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
        
        // Verify stream has tracks
        if (remoteStream.getTracks().length === 0) {
          console.error('Remote stream has no tracks!');
          toast({
            title: "Connection Issue",
            description: "Received empty stream from peer.",
            variant: "destructive",
          });
          return;
        }
        
        dispatch({
          type: 'ADD_REMOTE_PEER',
          peer: {
            id: call.peer,
            connection: call,
            stream: remoteStream,
          },
        });
        
        peersRef.current.set(call.peer, call);
        
        toast({
          title: "Peer Connected!",
          description: "Another user joined the room.",
        });
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

    // Handle incoming data connections (for signaling)
    peer.on('connection', (conn) => {
      console.log('Incoming data connection from:', conn.peer);
      
      conn.on('open', () => {
        console.log('Data connection opened with:', conn.peer);
      });
      
      conn.on('data', (data: any) => {
        console.log('Received data:', data);
        
        if (data.type === 'peers' && Array.isArray(data.peers)) {
          // Received peer list from coordinator
          data.peers.forEach((peerId: string) => {
            if (peerId !== peer.id && state.localStream && !peersRef.current.has(peerId)) {
              setTimeout(() => {
                callPeer(peer, peerId, state.localStream!);
              }, 500);
            }
          });
        } else if (data.type === 'new-peer' && data.peerId) {
          // New peer notification
          if (data.peerId !== peer.id && state.localStream && !peersRef.current.has(data.peerId)) {
            setTimeout(() => {
              callPeer(peer, data.peerId, state.localStream!);
            }, 500);
          }
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
    console.log('Calling with stream:', stream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
    
    // Verify we have a valid stream
    if (!stream || stream.getTracks().length === 0) {
      console.error('Cannot call peer: invalid stream');
      toast({
        title: "Connection Error",
        description: "Cannot connect: No media stream available.",
        variant: "destructive",
      });
      return;
    }
    
    const call = peer.call(remotePeerId, stream);

    call.on('stream', (remoteStream) => {
      console.log('Received stream from:', remotePeerId);
      console.log('Remote stream tracks:', remoteStream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
      
      // Verify stream has tracks
      if (remoteStream.getTracks().length === 0) {
        console.error('Remote stream has no tracks!');
        toast({
          title: "Connection Issue",
          description: "Received empty stream from peer. They may need to allow camera/mic access.",
          variant: "destructive",
        });
        return;
      }
      
      dispatch({
        type: 'ADD_REMOTE_PEER',
        peer: {
          id: remotePeerId,
          connection: call,
          stream: remoteStream,
        },
      });
      
      peersRef.current.set(remotePeerId, call);
      
      toast({
        title: "Peer Connected!",
        description: "You're now connected to another user.",
      });
    });

    call.on('close', () => {
      console.log('Call closed with:', remotePeerId);
      dispatch({ type: 'REMOVE_REMOTE_PEER', peerId: remotePeerId });
      peersRef.current.delete(remotePeerId);
      toast({
        title: "Peer Disconnected",
        description: "A user left the room.",
      });
    });

    call.on('error', (err) => {
      console.error('Call error with', remotePeerId, ':', err);
      dispatch({ type: 'REMOVE_REMOTE_PEER', peerId: remotePeerId });
      peersRef.current.delete(remotePeerId);
      toast({
        title: "Connection Error",
        description: "Failed to connect to peer. They may have network restrictions.",
        variant: "destructive",
      });
    });
    
    // Monitor connection state with restart capability
    let iceRestartAttempts = 0;
    const maxIceRestartAttempts = 3;
    
    call.peerConnection.oniceconnectionstatechange = () => {
      const state = call.peerConnection.iceConnectionState;
      console.log(`ICE connection state with ${remotePeerId}:`, state);
      
      if (state === 'failed' || state === 'disconnected') {
        if (iceRestartAttempts < maxIceRestartAttempts) {
          iceRestartAttempts++;
          console.log(`ICE connection ${state}, attempting restart ${iceRestartAttempts}/${maxIceRestartAttempts}...`);
          
          setTimeout(() => {
            try {
              call.peerConnection.restartIce();
            } catch (err) {
              console.error('ICE restart failed:', err);
            }
          }, 1000 * iceRestartAttempts); // Exponential backoff
        } else {
          console.error('ICE connection failed after max restart attempts');
          toast({
            title: "Connection Lost",
            description: "Unable to maintain connection with peer. They may have network restrictions.",
            variant: "destructive",
          });
        }
      } else if (state === 'connected' || state === 'completed') {
        console.log('✅ ICE connection established successfully!');
        iceRestartAttempts = 0; // Reset counter on success
        toast({
          title: "Connection Stable",
          description: "Video connection established successfully.",
        });
      }
    };
    
    // Monitor signaling state
    call.peerConnection.onsignalingstatechange = () => {
      console.log(`Signaling state with ${remotePeerId}:`, call.peerConnection.signalingState);
    };
    
    // Monitor connection state
    call.peerConnection.onconnectionstatechange = () => {
      const state = call.peerConnection.connectionState;
      console.log(`Connection state with ${remotePeerId}:`, state);
      
      if (state === 'failed') {
        console.error('Peer connection failed completely');
      }
    };
    
    // Log ICE candidates with more detail
    call.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE candidate:', {
          type: event.candidate.type,
          protocol: event.candidate.protocol,
          address: event.candidate.address,
          port: event.candidate.port,
        });
      } else {
        console.log('ICE gathering complete');
      }
    };
    
    // Log ICE gathering state
    call.peerConnection.onicegatheringstatechange = () => {
      console.log(`ICE gathering state with ${remotePeerId}:`, call.peerConnection.iceGatheringState);
    };
  };

  // Register with room using our Next.js API
  const registerWithRoom = async (peer: Peer, roomId: string, myPeerId: string) => {
    const ROOM_API = '/api/rooms';
    
    try {
      // Join the room
      const response = await fetch(`${ROOM_API}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, peerId: myPeerId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404 || errorData.code === 'ROOM_NOT_FOUND') {
          throw new Error('404: Room not found');
        }
        throw new Error('Failed to join room');
      }
      
      const data = await response.json();
      console.log('Joined room, existing peers:', data.peers);
      
      toast({ 
        title: "Connected!", 
        description: data.peers.length > 0 
          ? `${data.peers.length} user(s) in room` 
          : "Waiting for others to join...",
      });
      
      // Call all existing peers with longer delay for connection stability
      data.peers.forEach((peerId: string, index: number) => {
        if (peerId !== myPeerId && state.localStream) {
          setTimeout(() => {
            console.log('Calling existing peer:', peerId);
            callPeer(peer, peerId, state.localStream!);
          }, 2000 + (index * 1000)); // Stagger calls
        }
      });
      
      // Poll for new peers every 3 seconds
      const pollInterval = setInterval(async () => {
        try {
          const pollResponse = await fetch(`${ROOM_API}/${roomId}`);
          if (pollResponse.ok) {
            const pollData = await pollResponse.json();
            pollData.peers.forEach((peerId: string) => {
              if (peerId !== myPeerId && !peersRef.current.has(peerId) && state.localStream) {
                console.log('Found new peer:', peerId);
                callPeer(peer, peerId, state.localStream!);
              }
            });
          }
        } catch (err) {
          console.error('Error polling for peers:', err);
        }
      }, 3000);
      
      // Cleanup on unmount
      return () => {
        clearInterval(pollInterval);
        fetch(`${ROOM_API}/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, peerId: myPeerId }),
        }).catch(console.error);
      };
      
    } catch (error: any) {
      console.error('Error registering with room:', error);
      
      // Check if room doesn't exist
      if (error.message?.includes('404') || error.message?.includes('ROOM_NOT_FOUND')) {
        toast({
          title: "Room Not Found",
          description: "This room doesn't exist. Please check the room ID or create a new room.",
          variant: "destructive",
        });
        
        // Redirect back to home after 2 seconds
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        toast({
          title: "Connection Error",
          description: "Could not connect to room service. Using fallback mode.",
          variant: "destructive",
        });
        
        // Fallback: use localStorage for same-device testing
        useFallbackMode(peer, roomId, myPeerId);
      }
    }
  };
  
  // Fallback mode for local testing
  const useFallbackMode = (peer: Peer, roomId: string, myPeerId: string) => {
    console.log('Using fallback mode (localStorage)');
    
    const roomKey = `cu-room-${roomId}`;
    const roomPeers = JSON.parse(localStorage.getItem(roomKey) || '[]');
    
    // Call existing peers
    roomPeers.forEach((peerId: string) => {
      if (peerId !== myPeerId && state.localStream) {
        setTimeout(() => {
          callPeer(peer, peerId, state.localStream!);
        }, 1000);
      }
    });
    
    // Add ourselves
    if (!roomPeers.includes(myPeerId)) {
      roomPeers.push(myPeerId);
      localStorage.setItem(roomKey, JSON.stringify(roomPeers));
    }
    
    // Listen for storage changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === roomKey && e.newValue) {
        const newPeers = JSON.parse(e.newValue);
        newPeers.forEach((peerId: string) => {
          if (peerId !== myPeerId && !peersRef.current.has(peerId) && state.localStream) {
            callPeer(peer, peerId, state.localStream!);
          }
        });
      }
    };
    
    window.addEventListener('storage', handleStorage);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      const peers = JSON.parse(localStorage.getItem(roomKey) || '[]');
      localStorage.setItem(roomKey, JSON.stringify(peers.filter((id: string) => id !== myPeerId)));
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
