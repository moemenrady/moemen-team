import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Strict access control: /admin is reserved ONLY for ADMIN and MANAGER
    if (pathname.startsWith("/admin")) {
      const role = token?.role as string | undefined;
      if (role !== "ADMIN" && role !== "MANAGER") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Allow auth pages
        if (req.nextUrl.pathname.startsWith("/login")) {
          return true;
        }
        // Require auth for other pages
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};
