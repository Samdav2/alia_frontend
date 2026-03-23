import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Define protected routes
    const isProtectedRoute = pathname.startsWith('/dashboard');

    // Get the auth token from cookies
    const authToken = request.cookies.get('auth_token')?.value;

    // If trying to access a protected route without a token, redirect to login
    if (isProtectedRoute && !authToken) {
        const loginUrl = new URL('/login', request.url);
        // Optional: add a redirect query param to return here after login
        // loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If trying to access login/signup while already logged in
    if ((pathname === '/login' || pathname === '/signup') && authToken) {
        return NextResponse.redirect(new URL('/dashboard/student', request.url));
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/dashboard/:path*', '/login', '/signup'],
};
