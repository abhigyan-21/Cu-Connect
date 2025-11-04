"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Video } from "lucide-react";
import { generateRoomId } from "@/lib/utils";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  const handleJoinRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (roomId.trim()) {
      router.push(`/room/${roomId.trim()}`);
    }
  };

  const handleCreateRoom = () => {
    const newRoomId = generateRoomId();
    router.push(`/room/${newRoomId}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="absolute top-8 left-8 flex items-center gap-2 text-2xl font-bold text-primary font-headline">
        CU-Connect
      </div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">
            Video Conferencing, Simplified
          </CardTitle>
          <CardDescription className="pt-2">
            Enter a room code to join or create a new room to get started.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleJoinRoom}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room-id">Room ID</Label>
                <Input
                  id="room-id"
                  placeholder="Enter your room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="text-center text-lg h-12"
                />
              </div>
              <Button
                type="submit"
                className="w-full font-bold text-lg h-12 transition-all duration-300 hover:shadow-lg hover:shadow-primary/40"
                disabled={!roomId.trim()}
              >
                Join Room
              </Button>
            </div>
          </CardContent>
        </form>
        <CardFooter className="flex-col gap-4">
          <div className="relative w-full flex items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-muted-foreground text-sm">
              OR
            </span>
            <div className="flex-grow border-t border-border"></div>
          </div>
          <Button
            variant="secondary"
            className="w-full font-bold text-lg h-12"
            onClick={handleCreateRoom}
          >
            Create a New Room
          </Button>
        </CardFooter>
      </Card>
      <footer className="absolute bottom-4 text-center text-muted-foreground text-sm">
        <p>Built for performance and reliability.</p>
      </footer>
    </main>
  );
}
