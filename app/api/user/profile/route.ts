import { NextResponse } from 'next/server';

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Handle GET request for user profile
export async function GET() {
  // For now, return a simple response indicating this is a TypeRace app
  return NextResponse.json({
    message: 'TypeRace API - User profile endpoint',
    app: 'TypeRace',
    status: 'active'
  }, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  });
}

// Handle POST request for user profile updates
export async function POST() {
  return NextResponse.json({
    message: 'TypeRace API - Profile update not implemented',
    app: 'TypeRace'
  }, {
    status: 501,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  });
}
