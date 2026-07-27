import { NextRequest, NextResponse } from 'next/server';

export async function testMiddleware(req: NextRequest, next: () => Promise<NextResponse>) {
  console.log(`[Middleware] Processing test request to ${req.nextUrl.pathname}`);
  return await next();
}
