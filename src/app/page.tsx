"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
import { generateRoomId } from "@/lib/utils";
import { Video, Mic, Monitor, Users } from "lucide-react";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoinRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (roomId.trim()) {
      setIsLoading(true);
      router.push(`/room/${roomId.trim()}`);
    }
  };

  const handleCreateRoom = async () => {
    setIsLoading(true);
    const newRoomId = generateRoomId();
    
    try {
      // Create the room on the server first
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: newRoomId }),
      });
      
      if (response.ok) {
        router.push(`/room/${newRoomId}`);
      } else {
        // If room creation fails, try with a different ID
        const retryRoomId = generateRoomId();
        const retryResponse = await fetch('/api/rooms/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: retryRoomId }),
        });
        
        if (retryResponse.ok) {
          router.push(`/room/${retryRoomId}`);
        } else {
          setIsLoading(false);
          alert('Failed to create room. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error creating room:', error);
      setIsLoading(false);
      alert('Failed to create room. Please try again.');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <img src="/cu_logo.jpg" alt="CU Logo" className="h-12 w-auto" />
        <span className="text-2xl font-bold text-primary font-headline">CU-Connect</span>
      </div>
      
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Joining room...</p>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center w-full max-w-5xl flex-1 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md shadow-2xl mt-20">
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
                  disabled={!roomId.trim() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    "Join Room"
                  )}
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
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create a New Room"
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Features Section */}
        <div className="w-full max-w-4xl mt-16 mb-8">
          <h2 className="text-2xl font-bold text-center mb-8 font-headline">
            Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Video className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2">HD Video</h3>
              <p className="text-sm text-muted-foreground">
                Crystal-clear video quality for seamless communication
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Mic className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2">Audio Controls</h3>
              <p className="text-sm text-muted-foreground">
                Mute/unmute and select your preferred audio devices
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Monitor className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2">Screen Share</h3>
              <p className="text-sm text-muted-foreground">
                Share your screen for presentations and collaboration
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2">Easy Rooms</h3>
              <p className="text-sm text-muted-foreground">
                Create or join rooms instantly with a simple code
              </p>
            </Card>
          </div>
        </div>
      </div>

      <footer className="w-full border-t border-border py-4 text-center text-muted-foreground text-sm">
        <p>Built for performance and reliability.</p>
      </footer>
    </main>
  );
}
