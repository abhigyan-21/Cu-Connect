"use client";

import {
  Mic,
  MicOff,
  PhoneOff,
  Settings,
  Video,
  VideoOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MilanState } from "@/hooks/use-milan";

type RoomControlsProps = {
  state: MilanState;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onLeave: () => void;
  onSelectDevice: (kind: MediaDeviceKind, deviceId: string) => void;
};

export function RoomControls({
  state,
  onToggleAudio,
  onToggleVideo,
  onLeave,
  onSelectDevice,
}: RoomControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4 rounded-lg bg-card/80 p-4 backdrop-blur-md shadow-lg">
      <Button
        variant={state.isAudioEnabled ? "secondary" : "destructive"}
        size="lg"
        onClick={onToggleAudio}
        className="rounded-full w-16 h-16"
      >
        {state.isAudioEnabled ? (
          <Mic className="h-6 w-6" />
        ) : (
          <MicOff className="h-6 w-6" />
        )}
        <span className="sr-only">
          {state.isAudioEnabled ? "Mute" : "Unmute"}
        </span>
      </Button>
      <Button
        variant={state.isVideoEnabled ? "secondary" : "destructive"}
        size="lg"
        onClick={onToggleVideo}
        className="rounded-full w-16 h-16"
      >
        {state.isVideoEnabled ? (
          <Video className="h-6 w-6" />
        ) : (
          <VideoOff className="h-6 w-6" />
        )}
        <span className="sr-only">
          {state.isVideoEnabled ? "Turn off camera" : "Turn on camera"}
        </span>
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary" size="lg" className="rounded-full w-16 h-16">
            <Settings className="h-6 w-6" />
            <span className="sr-only">Settings</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Device Settings</h4>
              <p className="text-sm text-muted-foreground">
                Select your audio and video devices.
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="audio-input">Microphone</Label>
                <Select
                  onValueChange={(value) =>
                    onSelectDevice("audioinput", value)
                  }
                >
                  <SelectTrigger id="audio-input" className="col-span-2 h-8">
                    <SelectValue placeholder="Select microphone" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.devices.audioInputs.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="video-input">Camera</Label>
                <Select
                  onValueChange={(value) =>
                    onSelectDevice("videoinput", value)
                  }
                >
                  <SelectTrigger id="video-input" className="col-span-2 h-8">
                    <SelectValue placeholder="Select camera" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.devices.videoInputs.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="destructive"
        size="lg"
        onClick={onLeave}
        className="rounded-full w-16 h-16"
      >
        <PhoneOff className="h-6 w-6" />
        <span className="sr-only">Leave room</span>
      </Button>
    </div>
  );
}
