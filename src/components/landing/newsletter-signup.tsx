'use client'

import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2, Mail } from 'lucide-react'
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
    <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 border border-white/10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-500/10 rounded-full mb-4 sm:mb-5 md:mb-6">
            <Mail className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-400" />
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            Stay Updated
          </h2>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-6 sm:mb-7 md:mb-8 px-2">
            Get interview tips, new scenarios, and product updates delivered weekly.
          </p>

          {isSubmitted ? (
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-green-400 bg-green-500/10 rounded-lg py-3 sm:py-4 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">Thanks for subscribing! Check your inbox.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20 h-11 sm:h-12 text-sm sm:text-base"
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 sm:px-8 h-11 sm:h-12 whitespace-nowrap text-sm sm:text-base"
              >
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          )}

          <p className="text-gray-500 text-xs sm:text-sm mt-3 sm:mt-4">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  )
}
