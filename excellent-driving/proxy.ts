import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { decideRedirect } from "@/lib/route-guard";

export default withAuth(
  function middleware(req) {
    const redirectTo = decideRedirect(req.nextUrl.pathname, req.nextauth.token?.role as string | undefined);
    if (redirectTo) {
      return NextResponse.redirect(new URL(redirectTo, req.url));
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
