"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";

interface VideoPlayerProps {
  stream: MediaStream;
  name: string;
  isMuted?: boolean;
}

export function VideoPlayer({ stream, name, isMuted }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <Card className="relative aspect-video w-full overflow-hidden bg-muted flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        className="h-full w-full object-cover"
      />
      <div className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-1 text-white text-sm backdrop-blur-sm">
        {name}
      </div>
      {!stream.getVideoTracks().find((track) => track.enabled) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
          <User className="h-16 w-16" />
          <p className="mt-2 text-lg font-semibold">{name}</p>
          <p className="text-sm text-muted-foreground">Camera is off</p>
        </div>
      )}
    </Card>
  );
}
