'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function SubscribePage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initiateCheckout() {
      try {
        // First check if user already has a subscription
        const subResponse = await fetch('/api/stripe/subscription')
        const subData = await subResponse.json()

        if (subData.subscription?.isActive) {
          // Already subscribed, redirect to dashboard
          router.replace('/dashboard')
          return
        }

        // No subscription, create checkout session
        const response = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to start checkout')
        }

        if (data.url) {
          // Redirect to Stripe Checkout
          window.location.href = data.url
        } else {
          throw new Error('No checkout URL received')
        }
      } catch (err) {
        console.error('Checkout error:', err)
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    }

    initiateCheckout()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <span className="text-2xl">!</span>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-white/60 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-white mb-2">Setting up your trial...</h1>
        <p className="text-white/50">Redirecting to secure checkout</p>
      </div>
    </div>
  )
}
