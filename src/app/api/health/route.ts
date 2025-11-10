import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    
    // Test database connection
    await db.command({ ping: 1 });
    
    // Get room count
    const roomCount = await db.collection('rooms').countDocuments();
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      mongodb: true,
      roomCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      mongodb: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
