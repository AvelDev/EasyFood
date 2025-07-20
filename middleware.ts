import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Firebase Auth works on the client side, so we don't need server-side auth checks
  // The protection will be handled by the client-side auth context
  return NextResponse.next();
}

export const config = {
  matcher: ["/poll/:path*", "/admin/:path*"],
};
