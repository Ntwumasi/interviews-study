'use client'

import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2 } from 'lucide-react'
import { ANALYTICS_EVENTS, trackEvent, NewsletterSignupProps } from '@/types/analytics'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'landing_page',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Newsletter signup failed:', data.error)
        // Still show success to avoid exposing email enumeration
      }

      // Track newsletter signup
      trackEvent<NewsletterSignupProps>(ANALYTICS_EVENTS.NEWSLETTER_SIGNUP, {
        source: 'landing_page',
      })

      setIsSubmitted(true)
      setEmail('')

      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false)
      }, 5000)
    } catch (error) {
      console.error('Newsletter signup error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-20 md:py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
            Get interview tips weekly
          </h2>
          <p className="text-white/50 text-sm md:text-base mb-8">
            Join 5,000+ engineers. New scenarios, tips, and product updates.
          </p>

          {isSubmitted ? (
            <div className="flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full py-3 px-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium text-sm">You&apos;re in. Check your inbox.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/30 focus:ring-0 h-12 rounded-full px-5 text-sm"
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-white text-black hover:bg-white/90 h-12 px-6 rounded-full font-semibold text-sm"
              >
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          )}

          <p className="text-white/30 text-xs mt-4">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  )
}
