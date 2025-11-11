'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { initPostHog, posthog } from '@/lib/posthog'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user, isLoaded } = useUser()

  // Initialize PostHog on mount
  useEffect(() => {
    initPostHog()
  }, [])

  // Identify user when Clerk user loads
  useEffect(() => {
    if (isLoaded && user) {
      try {
        posthog.identify(user.id, {
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName || user.firstName || undefined,
          createdAt: user.createdAt,
        })
      } catch (error) {
        console.error('Failed to identify user in PostHog:', error)
      }
    }
  }, [user, isLoaded])

  // Track page views on route changes
  useEffect(() => {
    if (pathname) {
      try {
        let url = window.origin + pathname
        if (searchParams && searchParams.toString()) {
          url = url + `?${searchParams.toString()}`
        }
        posthog.capture('$pageview', {
          $current_url: url,
        })
      } catch (error) {
        console.error('Failed to track pageview:', error)
      }
    }
  }, [pathname, searchParams])

  return <>{children}</>
}
