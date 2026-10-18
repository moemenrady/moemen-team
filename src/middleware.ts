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
        // Allow public pages
        const path = req.nextUrl.pathname;
        if (
          path.startsWith("/login") ||
          path.startsWith("/register") ||
          path.startsWith("/about")
        ) {
          return true;
        }
        // Require auth for internal dashboard pages
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png|login|register|about).*)"],
};
