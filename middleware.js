import { NextResponse } from "next/server";

export function middleware(req) {
  const isAdmin = false; // later check via cookies / token

  if (!isAdmin && req.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}
