"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { User, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  stream: MediaStream;
  name: string;
  isMuted?: boolean;
  isScreenShare?: boolean;
}

export function VideoPlayer({ stream, name, isMuted, isScreenShare = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasVideo, setHasVideo] = useState(true); // Start with true, assume video exists
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

    // Only set stream if it's different from current
    if (video.srcObject !== stream) {
      console.log(`Setting new stream for ${name}`);
      video.srcObject = stream;
    }
    
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
      // Play after metadata is loaded
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.error('Error playing video after metadata:', err);
        });
      }
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

    // Handle errors
    const handleError = (e: Event) => {
      console.error(`Video error for ${name}:`, e);
      setError('Video playback error');
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);

    // Only play if stream is new
    if (video.srcObject === stream && video.paused) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.error('Error playing video:', err);
          // Retry once after a delay
          setTimeout(() => {
            if (video.paused) {
              video.play().catch(e => console.error('Retry failed:', e));
            }
          }, 500);
        });
      }
    }

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
      video.removeEventListener('error', handleError);
      stream.getTracks().forEach(track => {
        if (track.kind === 'video') {
          track.removeEventListener('enabled', handleTrackEnabled);
          track.removeEventListener('mute', handleTrackEnabled);
          track.removeEventListener('unmute', handleTrackEnabled);
        }
      });
    };
  }, [stream, name]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  const handleVideoClick = () => {
    toggleFullscreen();
  };

  return (
    <Card 
      ref={containerRef}
      className={`relative aspect-video w-full overflow-hidden bg-muted flex items-center justify-center cursor-pointer group ${
        isScreenShare ? 'ring-2 ring-primary' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleVideoClick}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        className="h-full w-full object-cover"
        style={{ display: 'block' }}
      />
      
      {/* Fullscreen button - shows on hover */}
      {isHovered && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 z-20 opacity-80 hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            toggleFullscreen();
          }}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      )}

      <div className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-1 text-white text-sm backdrop-blur-sm z-10 pointer-events-none flex items-center gap-2">
        {isScreenShare && (
          <span className="text-xs bg-primary px-1.5 py-0.5 rounded">SCREEN</span>
        )}
        {name}
      </div>
      {error && (
        <div className="absolute top-2 left-2 rounded-md bg-red-500/80 px-2 py-1 text-white text-xs z-10">
          {error}
        </div>
      )}
      {!hasVideo && stream.getVideoTracks().length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white z-[5] pointer-events-none">
          <User className="h-16 w-16" />
          <p className="mt-2 text-lg font-semibold">{name}</p>
          <p className="text-sm text-muted-foreground">No video track</p>
        </div>
      )}
      
      {/* Click hint - shows briefly on hover */}
      {isHovered && !isFullscreen && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-[15] pointer-events-none">
          <div className="bg-black/60 px-4 py-2 rounded-lg text-white text-sm backdrop-blur-sm">
            Click to fullscreen
          </div>
        </div>
      )}
    </Card>
  );
}
