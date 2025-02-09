import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Các routes không cần authentication
const publicRoutes = ['/login', '/register', '/forgot-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthenticated = request.cookies.get('auth_token') // hoặc tên token của bạn

  // Cho phép truy cập các public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Nếu chưa đăng nhập và cố truy cập route khác -> redirect về login
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Nếu đã đăng nhập và cố vào trang login -> redirect về home
  if (isAuthenticated && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Chỉ định các path sẽ được middleware xử lý
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}