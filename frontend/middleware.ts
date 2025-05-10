import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Add specific pages that should be public
const publicPaths = ['/', '/results', '/auth/signin', '/auth/signup', '/auth/forgot-password', '/auth/verify-email']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow all public paths and auth paths without restriction
  if (publicPaths.includes(path) || path.startsWith('/auth/')) {
    return NextResponse.next();
  }

  // Allow all other requests to proceed without checking auth-token cookie
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/api/:path*"]
}
