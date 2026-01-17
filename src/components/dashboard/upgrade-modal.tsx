'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react'

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  featureName?: string
}

const PREMIUM_FEATURES = [
  'Unlimited mock interviews',
  'All company interview tracks',
  'Priority AI feedback',
  'Advanced analytics & insights',
  'Video recording & playback',
  'Job-specific roadmap generator',
]

export function UpgradeModal({ open, onOpenChange, featureName }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStartTrial = async () => {
    setIsLoading(true)
    setError(null)

    try {
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
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <DialogTitle className="text-center text-white">
            Start Your Free Trial
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-400">
            {featureName
              ? `${featureName} is a Pro feature. Start your 3-day free trial to unlock it!`
              : 'Get 3 days free, then $19.99/month. Cancel anytime.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <ul className="space-y-3">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-zinc-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <p className="text-sm text-red-400 text-center bg-red-500/10 py-2 px-3 rounded-lg">
            {error}
          </p>
        )}

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
            onClick={handleStartTrial}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting Trial...
              </>
            ) : (
              'Start 3-Day Free Trial'
            )}
          </Button>
          <Button
            variant="ghost"
            className="w-full text-zinc-400 hover:text-white hover:bg-zinc-800"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Maybe Later
          </Button>
        </DialogFooter>

        <p className="text-[10px] text-zinc-500 text-center">
          You won&apos;t be charged until your trial ends. Cancel anytime.
        </p>
      </DialogContent>
    </Dialog>
  )
}
