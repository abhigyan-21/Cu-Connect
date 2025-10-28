"use client";

import { useState, useEffect, useCallback, useReducer } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./use-toast";
import { useFirestore } from "@/firebase";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  deleteDoc,
  setDoc,
  getDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore";

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
  devices: MediaDeviceState;
}

type MilanAction =
  | { type: "SET_LOCAL_STREAM"; stream: MediaStream | null }
  | { type: "ADD_REMOTE_PEER"; peer: RemotePeer }
  | { type: "REMOVE_REMOTE_PEER"; peerId: string }
  | { type: "SET_REMOTE_STREAM"; peerId: string; stream: MediaStream }
  | { type: "SET_AUDIO_ENABLED"; enabled: boolean }
  | { type: "SET_VIDEO_ENABLED"; enabled: boolean }
  | { type: "SET_DEVICES"; devices: MediaDeviceState }
  | { type: "RESET_STATE" };

const initialState: MilanState = {
  localStream: null,
  remotePeers: {},
  isAudioEnabled: true,
  isVideoEnabled: true,
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
  const firestore = useFirestore();

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
        dispatch({ type: 'RESET_STATE' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initSignaling = useCallback(() => {
    // This is where you would set up Firestore listeners
    // to exchange SDP offers/answers and ICE candidates.
    // For now, this is a placeholder.
    console.log("Initializing signaling for room:", roomId);
  }, [roomId]);

  useEffect(() => {
    if (state.localStream && firestore) {
      initSignaling();
    }
  }, [state.localStream, initSignaling, firestore]);


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
    if (state.localStream) {
      const videoTracks = state.localStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !state.isVideoEnabled;
      });
      dispatch({ type: "SET_VIDEO_ENABLED", enabled: !state.isVideoEnabled });
    }
  }, [state.localStream, state.isVideoEnabled]);

  const changeDevice = useCallback(async (kind: MediaDeviceKind, deviceId: string) => {
    const constraints = kind === 'audioinput' 
        ? { audio: { deviceId: { exact: deviceId } } }
        : { video: { deviceId: { exact: deviceId } } };
    
    state.localStream?.getTracks().forEach(track => track.stop());
    await getMedia(constraints as MediaStreamConstraints);
    toast({ title: "Device changed", description: "Your media device has been updated." });
  }, [state.localStream, getMedia, toast]);

  const leaveRoom = useCallback(() => {
    state.localStream?.getTracks().forEach((track) => track.stop());
    Object.values(state.remotePeers).forEach((peer) => peer.connection.close());
    dispatch({ type: "RESET_STATE" });
    router.push("/");
  }, [state.localStream, state.remotePeers, router]);

  return {
    state,
    actions: {
      toggleAudio,
      toggleVideo,
      leaveRoom,
      selectDevice: changeDevice,
    },
  };
}
