import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });

    // Protect core routes: Everything besides public assets, login, or api boundaries
    const isAuthRoute = request.nextUrl.pathname === '/login';
    const isPublicRoute =
        request.nextUrl.pathname.startsWith('/api') ||
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/logo.png') ||
        request.nextUrl.pathname === '/sw.js' ||
        request.nextUrl.pathname === '/manifest.json' ||
        request.nextUrl.pathname === '/manifest.webmanifest' ||
        request.nextUrl.pathname.startsWith('/icon-');

    if (isAuthRoute) {
        if (token) {
            // Already logged in, redirect away from login
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    if (!token && !isPublicRoute) {
        // Not logged in, redirect to login page
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
