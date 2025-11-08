import { NextResponse } from 'next/server';
import { rooms } from '@/lib/rooms';

export async function POST(request: Request) {
  try {
    const { roomId, peerId } = await request.json();
    
    if (!roomId || !peerId) {
      return NextResponse.json(
        { error: 'Missing roomId or peerId' },
        { status: 400 }
      );
    }
    
    // Get or create room
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    
    const room = rooms.get(roomId)!;
    const existingPeers = Array.from(room);
    
    // Add new peer
    room.add(peerId);
    
    console.log(`Peer ${peerId} joined room ${roomId}. Total peers: ${room.size}`);
    
    return NextResponse.json({
      success: true,
      peers: existingPeers, // Return peers that were already in the room
      totalPeers: room.size,
    });
  } catch (error) {
    console.error('Error in /api/rooms/join:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
