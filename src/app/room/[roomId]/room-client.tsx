"use client";

import { useMilan } from "@/hooks/use-milan";
import { VideoPlayer } from "@/components/video-player";
import { RoomControls } from "@/components/room-controls";
import { PeersPanel } from "@/components/peers-panel";

export default function RoomClient({ roomId }: { roomId: string }) {
  const { state, actions } = useMilan(roomId);

  const remoteStreams = Object.values(state.remotePeers).filter(p => p.stream);
  
  // Calculate total peers: yourself + remote peers with streams
  const totalPeers = 1 + remoteStreams.length;
  
  // Get peer names
  const peerNames = [
    state.isScreenSharing ? "You (Screen Sharing)" : "You",
    ...remoteStreams.map(peer => peer.id)
  ];

  // Debug logging
  console.log('RoomClient render:', {
    localStream: state.localStream?.id,
    remotePeersCount: Object.keys(state.remotePeers).length,
    remoteStreamsCount: remoteStreams.length,
    remotePeers: Object.entries(state.remotePeers).map(([id, peer]) => ({
      id,
      hasStream: !!peer.stream,
      streamId: peer.stream?.id,
      tracks: peer.stream?.getTracks().map(t => `${t.kind}: ${t.enabled}`)
    }))
  });

  return (
    <div className="flex h-screen w-full flex-col bg-background relative">
       <header className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <img src="/cu_logo.jpg" alt="CU Logo" className="h-10 w-auto" />
          <span className="text-xl font-bold text-primary font-headline">CU-Connect</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm bg-card/80 backdrop-blur-md px-3 py-1.5 rounded-md">
            Room: <span className="font-bold font-mono">{roomId}</span>
          </div>
          <div className="text-sm bg-primary/10 backdrop-blur-md px-3 py-1.5 rounded-md border border-primary/20">
            <span className="font-semibold text-primary">{totalPeers}</span> {totalPeers === 1 ? 'user' : 'users'}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 pt-20 pb-28 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-min">
        {state.localStream && (
          <VideoPlayer
            stream={state.localStream}
            name={state.isScreenSharing ? "Your Screen" : "You"}
            isMuted
            isScreenShare={state.isScreenSharing}
          />
        )}
        {remoteStreams.map((peer) => (
          <VideoPlayer
            key={peer.id}
            stream={peer.stream!}
            name={peer.id}
          />
        ))}
      </main>

      <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        {state.localStream && (
          <RoomControls
            state={state}
            onToggleAudio={actions.toggleAudio}
            onToggleVideo={actions.toggleVideo}
            onToggleScreenShare={actions.toggleScreenShare}
            onLeave={actions.leaveRoom}
            onSelectDevice={actions.selectDevice}
          />
        )}
      </footer>

      {/* Peers Panel - Bottom Right */}
      <div className="absolute bottom-4 right-4 z-10">
        <PeersPanel totalPeers={totalPeers} peerNames={peerNames} />
      </div>
    </div>
  );
}
