import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./auth";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const isLoggedIn = !!session;

  // Define public paths that don't require authentication
  const publicPaths = ["/login", "/register"];
  // Define API paths that should bypass the middleware
  const apiPaths = ["/api"];
  
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  const isApiPath = apiPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // If it's an API path, just let it through - API requests will handle auth errors separately
  if (isApiPath) {
    return NextResponse.next();
  }

  // Redirect logic
  if (!isLoggedIn && !isPublicPath) {
    // Not logged in and not on a public path, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoggedIn && isPublicPath) {
    // Logged in but on a public path (like /login), redirect to home
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Set security headers
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  
  return response;
}

// Only run middleware on specific paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};