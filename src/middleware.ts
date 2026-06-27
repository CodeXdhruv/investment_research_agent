import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/api/v1/research/history',
  '/api/v1/research/saved',
  '/api/v1/watchlist(.*)',
  '/api/v1/debate(.*)',
  '/api/v1/chat(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (req.method === 'OPTIONS') {
    const origin = process.env.CORS_ORIGIN || 'http://localhost:3000';
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-clerk-auth-reason, x-clerk-auth-status',
        'Access-Control-Allow-Credentials': 'true',
      }
    });
  }
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
