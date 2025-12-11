import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

// these are pages/routes that we want to guard; this approach may not be good if you have heaps of routes, but it works for now; and again, middleware is just the first line of defence
const protectedRoutes = ["/profile", "/admin/dashboard"];

// proxy.ts -- this is middleware that reads the cookie and redirects users if they're in the wrong place
// so e.g. instead of seeing "unauthorised" when you visit the profile page when not logged in, you just get redirected back to the login page
// and conversely if you ARE logged in and you go to /auth/register or /auth/login, you are redirected to the profile page

// middleware is the first line of defence. second line is in profile/page.tsx

// https://www.better-auth.com/docs/integrations/next#auth-protection
// better auth: "In Next.js proxy/middleware, it's recommended to only check for the existence of a session cookie to handle redirection. To avoid blocking requests by making API or database calls."
// so we are using middleware just to check for the EXISTENCE of a session cookie
// as for whether the session is real or not - that's a different story - we'll check that on the page level
// (this is better auth's recommended approach)

// NOTE: next.js has rename middleware to proxy
// https://nextjs.org/docs/messages/middleware-to-proxy

export async function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const sessionCookie = getSessionCookie(req);

  const res = NextResponse.next();

  // `!!` is the "double not" double boolean conversion trick
  // i.e. the boolean version of sessionCookie
  // this is where we check for the EXISTENCE of the cookie, and nothing else
  const isLoggedIn = !!sessionCookie;
  // this is a boolean - if you're on a particular route or not
  const isOnProtectedRoute = protectedRoutes.includes(nextUrl.pathname);
  const isOnAuthRoute = nextUrl.pathname.startsWith("/auth");

  // if you're not allowed to be here, go to login page
  if (isOnProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
  // if you ARE logged, you shouldn't still be on auth route; go to profile page
  if (isOnAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/profile", req.url));
  }
  // otherwise, let the request proceed; for public routes etc
  return res;
}

// this tells it where to run the middleware
// https://nextjs.org/docs/14/app/building-your-application/routing/middleware
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
