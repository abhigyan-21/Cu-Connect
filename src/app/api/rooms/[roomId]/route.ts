import { NextResponse } from 'next/server';
import { rooms } from '@/lib/rooms';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    
    const room = rooms.get(roomId);
    const peers = room ? Array.from(room) : [];
    
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
