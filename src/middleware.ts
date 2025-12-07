import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/faq',                 // FAQ page - marketing/informational
  '/terms',               // Terms of service
  '/privacy',             // Privacy policy
  '/contact',             // Contact page
  '/api/webhooks(.*)',
  '/api/text-to-speech',  // TTS is called from client, auth handled by session
  '/api/mux/webhook',     // Mux webhooks from external service
  '/api/newsletter',      // Newsletter signup from landing page
  '/api/faq',             // FAQ AI endpoint - public for marketing
  '/interview/start(.*)', // TEMPORARY: Testing if Clerk is blocking this route
])

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname
  console.log('[MIDDLEWARE] Request:', pathname, 'Search:', req.nextUrl.search)
  console.log('[MIDDLEWARE] Is public route?', isPublicRoute(req))

  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    console.log('[MIDDLEWARE] Calling auth.protect() for:', pathname)
    await auth.protect()
  } else {
    console.log('[MIDDLEWARE] Skipping auth.protect() for public route:', pathname)
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
