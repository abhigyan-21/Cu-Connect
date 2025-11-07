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
import { generateRoomId } from "@/lib/utils";
import { Video, ScreenShare, Users, CheckCircle } from "lucide-react";

const features = [
  {
    icon: <Video className="w-10 h-10 text-primary" />,
    title: "HD Video & Audio",
    description: "Crystal-clear communication for meetings of any size.",
  },
  {
    icon: <ScreenShare className="w-10 h-10 text-primary" />,
    title: "Screen Sharing",
    description: "Easily share your screen for presentations and collaboration.",
  },
  {
    icon: <Users className="w-10 h-10 text-primary" />,
    title: "Simple Room Management",
    description: "Create and join rooms with a single click.",
  },
  {
    icon: <CheckCircle className="w-10 h-10 text-primary" />,
    title: "Secure & Reliable",
    description: "Built on WebRTC for secure, peer-to-peer connections.",
  },
];


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

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
                Features Designed for You
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Everything you need for effective online meetings.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-12">
              {features.map((feature, index) => (
                <Card key={index} className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>


      <footer className="w-full border-t border-border py-4 text-center text-muted-foreground text-sm">
        <p>Built for performance and reliability.</p>
      </footer>
    </main>
  );
}
