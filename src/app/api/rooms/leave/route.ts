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
    
    const room = rooms.get(roomId);
    if (room) {
      room.delete(peerId);
      console.log(`Peer ${peerId} left room ${roomId}. Remaining: ${room.size}`);
      
      // Clean up empty rooms
      if (room.size === 0) {
        rooms.delete(roomId);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /api/rooms/leave:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
