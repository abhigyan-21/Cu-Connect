"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";

interface VideoPlayerProps {
  stream: MediaStream;
  name: string;
  isMuted?: boolean;
}

export function VideoPlayer({ stream, name, isMuted }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(true); // Start with true, assume video exists
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) {
      console.error('VideoPlayer: Missing video element or stream');
      setError('No stream available');
      setHasVideo(false);
      return;
    }

    console.log(`VideoPlayer for ${name}:`, {
      streamId: stream.id,
      tracks: stream.getTracks().map(t => ({
        kind: t.kind,
        enabled: t.enabled,
        readyState: t.readyState,
        muted: t.muted
      }))
    });

    // Set stream directly
    video.srcObject = stream;
    
    // Check if video track exists
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      setHasVideo(videoTrack.enabled);
      setError(null);
    } else {
      setHasVideo(false);
      console.warn(`No video track for ${name}`);
    }

    // Handle video metadata loaded
    const handleLoadedMetadata = () => {
      console.log(`✅ Video metadata loaded for ${name}`);
      setHasVideo(true);
      video.play().catch(err => {
        console.error('Error playing video:', err);
      });
    };

    // Handle video can play
    const handleCanPlay = () => {
      console.log(`✅ Video can play for ${name}`);
      setHasVideo(true);
    };

    // Handle video playing
    const handlePlaying = () => {
      console.log(`✅ Video is playing for ${name}`);
      setHasVideo(true);
      setError(null);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handlePlaying);

    // Play video
    video.play().catch(err => {
      console.error('Error playing video:', err);
      // Retry
      setTimeout(() => {
        video.play().catch(e => console.error('Retry failed:', e));
      }, 500);
    });

    // Listen for track changes
    const handleTrackEnabled = () => {
      const vTrack = stream.getVideoTracks()[0];
      if (vTrack) {
        setHasVideo(vTrack.enabled);
      }
    };

    stream.getTracks().forEach(track => {
      if (track.kind === 'video') {
        track.addEventListener('enabled', handleTrackEnabled);
        track.addEventListener('mute', handleTrackEnabled);
        track.addEventListener('unmute', handleTrackEnabled);
      }
    });

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('playing', handlePlaying);
      stream.getTracks().forEach(track => {
        if (track.kind === 'video') {
          track.removeEventListener('enabled', handleTrackEnabled);
          track.removeEventListener('mute', handleTrackEnabled);
          track.removeEventListener('unmute', handleTrackEnabled);
        }
      });
    };
  }, [stream, name]);

  return (
    <Card className="relative aspect-video w-full overflow-hidden bg-muted flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        className="h-full w-full object-cover"
        style={{ display: 'block' }}
      />
      <div className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-1 text-white text-sm backdrop-blur-sm z-10">
        {name}
      </div>
      {error && (
        <div className="absolute top-2 left-2 rounded-md bg-red-500/80 px-2 py-1 text-white text-xs z-10">
          {error}
        </div>
      )}
      {!hasVideo && stream.getVideoTracks().length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white z-[5]">
          <User className="h-16 w-16" />
          <p className="mt-2 text-lg font-semibold">{name}</p>
          <p className="text-sm text-muted-foreground">No video track</p>
        </div>
      )}
    </Card>
  );
}
