import { NextResponse } from 'next/server';
import { removePeerFromRoom, getRoomPeers } from '@/lib/rooms-db';

export async function POST(request: Request) {
  try {
    const { roomId, peerId } = await request.json();
    
    if (!roomId || !peerId) {
      return NextResponse.json(
        { error: 'Missing roomId or peerId' },
        { status: 400 }
      );
    }
    
    await removePeerFromRoom(roomId, peerId);
    const remainingPeers = await getRoomPeers(roomId);
    
    console.log(`Peer ${peerId} left room ${roomId}. Remaining: ${remainingPeers.length}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /api/rooms/leave:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
