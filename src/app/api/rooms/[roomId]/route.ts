import { NextResponse } from 'next/server';
import { getRoomPeers } from '@/lib/rooms-db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    
    const peers = await getRoomPeers(roomId);
    
    return NextResponse.json({
      roomId,
      peers,
      count: peers.length,
    });
  } catch (error) {
    console.error('Error in /api/rooms/[roomId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
