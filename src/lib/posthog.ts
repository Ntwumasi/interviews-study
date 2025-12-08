import posthog from 'posthog-js'

// Extend window type for posthog
declare global {
  interface Window {
    posthog?: typeof posthog
  }
}

// Initialize PostHog client
export function initPostHog() {
  // Only initialize on client side
  if (typeof window === 'undefined') return

  // Only run in production and development, not during build
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

    if (!posthogKey) {
      console.warn('PostHog key not found. Analytics will not be tracked.')
      return
    }

    try {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: 'identified_only', // Only create profiles for identified users
        capture_pageview: false, // We'll manually capture pageviews in the provider
        capture_pageleave: true,
        loaded: (ph) => {
          // Expose posthog on window for easy access
          window.posthog = ph
          if (process.env.NODE_ENV === 'development') {
            console.log('PostHog loaded successfully')
            ph.debug() // Enable debug mode in development
          }
        },
      })
      // Also expose immediately
      window.posthog = posthog
    } catch (error) {
      console.error('Failed to initialize PostHog:', error)
    }
  }
}

// Export the posthog instance
export { posthog }
