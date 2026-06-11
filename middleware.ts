import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const walletConnected = request.cookies.get('wallet_connected')?.value === 'true';

  // If attempting to access /vault/create without a wallet connected, redirect to '/'
  if (request.nextUrl.pathname.startsWith('/vault/create')) {
    if (!walletConnected) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('alert', 'wallet-required');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Config matcher to only run on protected paths
export const config = {
  matcher: ['/vault/create/:path*', '/vault/create'],
};
