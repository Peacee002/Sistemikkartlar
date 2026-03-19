import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  // Public routes
  if (
    pathname === "/" ||
    pathname.startsWith("/giris") ||
    pathname.startsWith("/kayit") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/kayit") ||
    pathname.startsWith("/api/uploadthing") ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  // Must be authenticated for everything else
  if (!user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/giris", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only routes
  if (pathname.startsWith("/panel")) {
    if (user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Teacher+ routes
  if (pathname.startsWith("/odalar")) {
    if (user.role !== "ADMIN" && user.role !== "TEACHER") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
