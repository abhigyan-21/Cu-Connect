import { NextResponse } from 'next/server';
import { addPeerToRoom, getRoomPeers } from '@/lib/rooms-db';

export async function POST(request: Request) {
  try {
    const { roomId, peerId } = await request.json();
    
    if (!roomId || !peerId) {
      return NextResponse.json(
        { error: 'Missing roomId or peerId' },
        { status: 400 }
      );
    }
    
    // Add peer to room in MongoDB
    const existingPeers = await addPeerToRoom(roomId, peerId);
    const allPeers = await getRoomPeers(roomId);
    
    console.log(`Peer ${peerId} joined room ${roomId}. Total peers: ${allPeers.length}`);
    
    return NextResponse.json({
      success: true,
      peers: existingPeers, // Return peers that were already in the room
      totalPeers: allPeers.length,
    });
  } catch (error: any) {
    console.error('Error in /api/rooms/join:', error);
    
    if (error.message === 'Room not found') {
      return NextResponse.json(
        { error: 'Room does not exist', code: 'ROOM_NOT_FOUND' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
