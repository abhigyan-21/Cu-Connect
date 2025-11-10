import { NextResponse } from 'next/server';
import { cleanupOldRooms } from '@/lib/rooms-db';

export async function POST(request: Request) {
  try {
    // Optional: Add authentication here for security
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CLEANUP_TOKEN || 'your-secret-token';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await cleanupOldRooms();
    
    return NextResponse.json({
      success: true,
      message: 'Cleanup completed',
    });
  } catch (error) {
    console.error('Error in /api/rooms/cleanup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
