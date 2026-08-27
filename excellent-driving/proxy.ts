import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (pathname.startsWith("/student") && role !== "STUDENT") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Just checking "is there a token" here — the role check above in
      // the wrapped middleware does the finer-grained STUDENT/ADMIN split.
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/student/:path*", "/admin/:path*", "/booking/:path*"],
};
