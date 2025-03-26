import { NextResponse } from 'next/server';

export function middleware(request) {
    console.log("Middleware is running for:", request.nextUrl.pathname);
    const token = request.cookies.get('authorization')?.value;
    console.log("Token:", token);

    if (!token && request.nextUrl.pathname !== '/login') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = { matcher: '/((?!.*\\.).*)' };