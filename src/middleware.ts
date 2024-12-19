import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add any basic routing logic here if needed
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/schedules/:path*',
    '/generator',
  ],
}; 