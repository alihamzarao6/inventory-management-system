import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const authToken = request.cookies.get('auth-token')?.value;
    const isAuthPage = request.nextUrl.pathname === '/auth';
    const tokenParam = request.nextUrl.searchParams.get('token');

    // For auth page
    if (isAuthPage) {
        // If has auth cookie but no token param, redirect to home
        if (authToken && !tokenParam) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        // If has token param, allow access to verify the token
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/auth(.*)']
};