import { NextResponse } from 'next/server';

// Wallet connection is a client-side concern (wagmi). The vault-create page
// handles the disconnected case itself, so no server-side gating is needed.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
