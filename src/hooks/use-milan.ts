"use client";

import { useEffect, useCallback, useReducer, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./use-toast";

// In a real app, you'd use a more robust WebRTC library or a fully implemented service.
// These are placeholder types and functions for demonstration.
type PeerConnection = RTCPeerConnection;
interface RemotePeer {
  id: string;
  connection: PeerConnection;
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
        dispatch({ type: 'RESET_STATE' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Signaling setup would go here when implementing WebRTC
    console.log("Room initialized:", roomId);
  }, [roomId]);

  const replaceTrack = (track: MediaStreamTrack) => {
    if (state.localStream) {
      const senders = Object.values(state.remotePeers).flatMap(
        (peer) => peer.connection.getSenders().filter(s => s.track?.kind === 'video')
      );
      senders.forEach(sender => sender.replaceTrack(track));

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
    Object.values(state.remotePeers).forEach((peer) => peer.connection.close());
    dispatch({ type: "RESET_STATE" });
    router.push("/");
  }, [state.localStream, state.remotePeers, router]);

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
