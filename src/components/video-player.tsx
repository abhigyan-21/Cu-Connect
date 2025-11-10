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
  const [hasVideo, setHasVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) {
      console.error('VideoPlayer: Missing video element or stream');
      setError('No stream available');
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

    // Set stream and ensure video element is ready
    video.srcObject = stream;
    video.load(); // Force reload
    
    // Check if video track exists and is enabled
    const videoTrack = stream.getVideoTracks()[0];
    const hasVideoTrack = videoTrack && videoTrack.enabled && videoTrack.readyState === 'live';
    setHasVideo(hasVideoTrack);
    setError(null);

    // Handle video metadata loaded
    const handleLoadedMetadata = () => {
      console.log(`Video metadata loaded for ${name}`);
      video.play().catch(err => {
        console.error('Error playing video:', err);
        setError('Failed to play video');
      });
    };

    // Handle video can play
    const handleCanPlay = () => {
      console.log(`Video can play for ${name}`);
      const vTrack = stream.getVideoTracks()[0];
      setHasVideo(vTrack && vTrack.enabled && vTrack.readyState === 'live');
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);

    // Try to play immediately
    const playTimeout = setTimeout(() => {
      video.play().catch(err => {
        console.error('Error playing video:', err);
        // Try again after a short delay
        setTimeout(() => {
          video.play().catch(e => {
            console.error('Retry failed:', e);
            setError('Failed to play video');
          });
        }, 500);
      });
    }, 100);

    // Listen for track changes
    const handleTrackEnabled = () => {
      const vTrack = stream.getVideoTracks()[0];
      setHasVideo(vTrack && vTrack.enabled && vTrack.readyState === 'live');
    };

    stream.getTracks().forEach(track => {
      track.addEventListener('enabled', handleTrackEnabled);
      track.addEventListener('mute', handleTrackEnabled);
      track.addEventListener('unmute', handleTrackEnabled);
    });

    return () => {
      clearTimeout(playTimeout);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      stream.getTracks().forEach(track => {
        track.removeEventListener('enabled', handleTrackEnabled);
        track.removeEventListener('mute', handleTrackEnabled);
        track.removeEventListener('unmute', handleTrackEnabled);
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
      {!hasVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white z-[5]">
          <User className="h-16 w-16" />
          <p className="mt-2 text-lg font-semibold">{name}</p>
          <p className="text-sm text-muted-foreground">
            {stream.getVideoTracks().length === 0 ? 'No video track' : 'Camera is off'}
          </p>
        </div>
      )}
    </Card>
  );
}
