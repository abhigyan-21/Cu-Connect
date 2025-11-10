import { NextResponse } from 'next/server';
import { createRoom } from '@/lib/rooms-db';

export async function POST(request: Request) {
  try {
    const { roomId } = await request.json();
    
    if (!roomId) {
      return NextResponse.json(
        { error: 'Missing roomId' },
        { status: 400 }
      );
    }
    
    // Create new room in MongoDB
    const room = await createRoom(roomId);
    console.log(`Room created: ${roomId}`);
    
    return NextResponse.json({
      success: true,
      roomId: room.roomId,
      message: 'Room created successfully',
    });
  } catch (error: any) {
    console.error('Error in /api/rooms/create:', error);
    
    if (error.message === 'Room already exists') {
      return NextResponse.json(
        { error: 'Room already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
