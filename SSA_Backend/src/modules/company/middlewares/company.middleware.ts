import { NextRequest, NextResponse } from 'next/server';

export async function companyMiddleware(req: NextRequest, next: () => Promise<NextResponse>) {
  console.log(`[CompanyMiddleware] Processing company request to ${req.nextUrl.pathname}`);
  return await next();
}
