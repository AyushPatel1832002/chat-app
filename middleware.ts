import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-key-change-this-in-prod"
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // Protect chat routes
  if (request.nextUrl.pathname.startsWith("/chat")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Use jose for edge-compatible JWT verification
      await jose.jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (["/login", "/register"].includes(request.nextUrl.pathname)) {
    if (token) {
      try {
        await jose.jwtVerify(token, JWT_SECRET);
        return NextResponse.redirect(new URL("/chat", request.url));
      } catch (error) {
        // Token invalid, allow access to login/register
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/login", "/register"],
};
