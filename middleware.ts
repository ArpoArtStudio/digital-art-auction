import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the request is for an admin route (except the login page)
  if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin') {
    // Check if user is authenticated
    const isAuthenticated = request.cookies.get('admin-authenticated')?.value === 'true'
    
    if (!isAuthenticated) {
      // Redirect to admin login page
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*'
}
