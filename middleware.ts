import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/contacts(.*)',
  '/dashboard(.*)',
  '/teams/create(.*)',
  '/teams/[id]/edit(.*)',
  '/teams/[id]/members(.*)',
  '/riddles/create(.*)',
  '/riddles/[id]/edit(.*)',
  '/riddles/[id]/solve(.*)',
  '/profile(.*)',
  '/admin(.*)',
])

// Public routes for SEO (readable without auth)
const isPublicRoute = createRouteMatcher([
  '/',
  '/login',
  '/signup',
  '/teams',
  '/teams/[id]',
  '/riddles',
  '/riddles/[id]',
  '/leaderboard',
  '/leaderboard/teams',
  '/leaderboard/trends',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth()
  const isBot =
    req.headers.get('user-agent')?.toLowerCase().includes('bot') ||
    req.headers.get('user-agent')?.toLowerCase().includes('crawler') ||
    req.headers.get('user-agent')?.toLowerCase().includes('spider')

  // Allow bots to access public routes for SEO
  if (isBot && isPublicRoute(req)) {
    return NextResponse.next()
  }

  // If the user isn't signed in and the route is private, redirect to sign-in
  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn({ returnBackUrl: '/login' })
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
