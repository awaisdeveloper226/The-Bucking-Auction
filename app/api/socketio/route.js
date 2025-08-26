import { NextRequest, NextResponse } from 'next/server';

// We'll use a different approach for App Router
// This endpoint will just indicate that we want to use Socket.IO
export async function GET(request) {
  return NextResponse.json({ 
    message: 'Socket.IO endpoint - use custom server or external service',
    timestamp: new Date().toISOString()
  });
}