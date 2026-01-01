import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl.clone();

  const isAdmin = false; // later check via cookies / token

  // Check if user is trying to access /admin routes
  if (!isAdmin && url.pathname.startsWith("/report/dashboard/admin")) {
    // Use absolute path starting from root
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Apply middleware only to /report routes
export const config = {
  matcher: ["/report/:path*"],
};
