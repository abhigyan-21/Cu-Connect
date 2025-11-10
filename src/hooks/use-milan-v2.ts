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
  const cleanupRef = useRef<(() => void) | null>(null);

  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter((d) => d.kind === "audioinput");
      const videoInputs = devices.filter((d) => d.kind === "videoinput");
      const audioOutputs = devices.filter((d) => d.kind === "audiooutput");
      dispatch({
        type: "SET_DEVICES",
        devices: { audioInputs, videoInputs, audioOutputs },
      });
    } catch (error) {
      console.error("Error enumerating devices:", error);
    }
  }, []);

  const getMedia = useCallback(
    async (constraints?: MediaStreamConstraints) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(
          constraints || { video: { width: 1280, height: 720 }, audio: true }
        );
        cameraStreamRef.current = stream;
        dispatch({ type: "SET_LOCAL_STREAM", stream });
        await getDevices();
        console.log("✅ Local media stream obtained:", stream.id);
      } catch (error) {
        console.error("Error accessing media devices:", error);
        toast({
          title: "Media Access Denied",
          description: "Please allow camera and microphone access.",
          variant: "destructive",
        });
        router.push("/");
      }
    },
    [getDevices, toast, router]
  );

  // Get media on mount
  useEffect(() => {
    getMedia();
    return () => {
      state.localStream?.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      peerRef.current?.destroy();
      cleanupRef.current?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize PeerJS
  useEffect(() => {
    if (!state.localStream) return;

    const myPeerId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const peer = new Peer(myPeerId, {
      host: "0.peerjs.com",
      port: 443,
      path: "/",
      secure: true,
      debug: 1,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          {
            urls: "turn:a.relay.metered.ca:80",
            username: "e46a735f4c26d71c3e6e9f1f",
            credential: "tEgvhMDLK8F8BCAK",
          },
          {
            urls: "turn:a.relay.metered.ca:443",
            username: "e46a735f4c26d71c3e6e9f1f",
            credential: "tEgvhMDLK8F8BCAK",
          },
        ],
        iceTransportPolicy: "all",
      },
    });

    peer.on("open", (id) => {
      console.log("✅ Peer opened with ID:", id);
      registerWithRoom(peer, roomId, id);
    });

    peer.on("call", (call) => {
      console.log("📞 Receiving call from:", call.peer);
      call.answer(state.localStream!);
      handleCall(call);
    });

    peer.on("error", (err) => {
      console.error("❌ PeerJS error:", err);
    });

    peerRef.current = peer;

    return () => {
      peer.destroy();
    };
  }, [state.localStream, roomId]);

  const handleCall = (call: MediaConnection) => {
    call.on("stream", (remoteStream) => {
      console.log("📺 Received stream from:", call.peer, remoteStream.id);
      console.log("Stream tracks:", remoteStream.getTracks().map(t => `${t.kind}:${t.enabled}`));

      dispatch({
        type: "ADD_REMOTE_PEER",
        peer: {
          id: call.peer,
          connection: call,
          stream: remoteStream,
        },
      });

      peersRef.current.set(call.peer, call);
    });

    call.on("close", () => {
      console.log("📴 Call closed:", call.peer);
      dispatch({ type: "REMOVE_REMOTE_PEER", peerId: call.peer });
      peersRef.current.delete(call.peer);
    });

    call.on("error", (err) => {
      console.error("❌ Call error:", err);
      dispatch({ type: "REMOVE_REMOTE_PEER", peerId: call.peer });
      peersRef.current.delete(call.peer);
    });
  };

  const callPeer = (peer: Peer, remotePeerId: string, stream: MediaStream) => {
    if (peersRef.current.has(remotePeerId)) {
      console.log("Already connected to:", remotePeerId);
      return;
    }

    console.log("📞 Calling peer:", remotePeerId);
    const call = peer.call(remotePeerId, stream);
    handleCall(call);
  };

  const registerWithRoom = async (
    peer: Peer,
    roomId: string,
    myPeerId: string
  ) => {
    try {
      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, peerId: myPeerId }),
      });

      if (!response.ok) {
        throw new Error("Room not found");
      }

      const data = await response.json();
      console.log("✅ Joined room, existing peers:", data.peers);

      // Call existing peers
      data.peers.forEach((peerId: string) => {
        if (peerId !== myPeerId && state.localStream) {
          setTimeout(() => callPeer(peer, peerId, state.localStream!), 1000);
        }
      });

      // Poll for new peers
      const pollInterval = setInterval(async () => {
        try {
          const pollResponse = await fetch(`/api/rooms/${roomId}`);
          if (pollResponse.ok) {
            const pollData = await pollResponse.json();
            pollData.peers.forEach((peerId: string) => {
              if (
                peerId !== myPeerId &&
                !peersRef.current.has(peerId) &&
                state.localStream
              ) {
                callPeer(peer, peerId, state.localStream!);
              }
            });
          }
        } catch (err) {
          console.error("Poll error:", err);
        }
      }, 3000);

      cleanupRef.current = () => {
        clearInterval(pollInterval);
        fetch("/api/rooms/leave", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId, peerId: myPeerId }),
        }).catch(console.error);
      };
    } catch (error) {
      console.error("❌ Room registration error:", error);
      toast({
        title: "Room Not Found",
        description: "Please check the room ID.",
        variant: "destructive",
      });
      setTimeout(() => router.push("/"), 2000);
    }
  };

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

  const toggleScreenShare = useCallback(async () => {
    toast({
      title: "Screen Share",
      description: "Screen sharing is temporarily disabled.",
    });
  }, [toast]);

  const changeDevice = useCallback(
    async (kind: MediaDeviceKind, deviceId: string) => {
      const constraints =
        kind === "audioinput"
          ? { audio: { deviceId: { exact: deviceId } }, video: true }
          : { audio: true, video: { deviceId: { exact: deviceId } } };

      state.localStream?.getTracks().forEach((track) => track.stop());
      await getMedia(constraints as MediaStreamConstraints);
    },
    [state.localStream, getMedia]
  );

  const leaveRoom = useCallback(() => {
    state.localStream?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    peersRef.current.forEach((call) => call.close());
    peersRef.current.clear();
    peerRef.current?.destroy();
    cleanupRef.current?.();
    dispatch({ type: "RESET_STATE" });
    router.push("/");
  }, [state.localStream, router]);

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
