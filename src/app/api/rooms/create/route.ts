import { NextResponse } from 'next/server';
import { rooms } from '@/lib/rooms';

export async function POST(request: Request) {
  try {
    const { roomId } = await request.json();
    
    if (!roomId) {
      return NextResponse.json(
        { error: 'Missing roomId' },
        { status: 400 }
      );
    }
    
    // Check if room already exists
    if (rooms.has(roomId)) {
      return NextResponse.json(
        { error: 'Room already exists' },
        { status: 409 }
      );
    }
    
    // Create new room
    rooms.set(roomId, new Set());
    console.log(`Room created: ${roomId}`);
    
    return NextResponse.json({
      success: true,
      roomId,
      message: 'Room created successfully',
    });
  } catch (error) {
    console.error('Error in /api/rooms/create:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
