'use client'

import { useEffect, useState } from 'react'
import { Crown, Clock, AlertCircle, Settings, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UpgradeModal } from './upgrade-modal'
import { SubscriptionInfo } from '@/types/subscription'

export function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [isPortalLoading, setIsPortalLoading] = useState(false)

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await fetch('/api/stripe/subscription')
        const data = await response.json()
        setSubscription(data.subscription)
      } catch (error) {
        console.error('Failed to fetch subscription:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscription()
  }, [])

  const handleManageSubscription = async () => {
    setIsPortalLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Failed to open portal:', error)
    } finally {
      setIsPortalLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
          <span className="text-white/50 text-sm">Loading subscription...</span>
        </div>
      </div>
    )
  }

  // No subscription or inactive
  if (!subscription || !subscription.isActive) {
    return (
      <>
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Upgrade to Pro</h3>
                <p className="text-xs text-white/60 mt-0.5">
                  Get unlimited interviews, all company tracks, and more
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white flex-shrink-0"
              onClick={() => setShowUpgradeModal(true)}
            >
              Start Free Trial
            </Button>
          </div>
        </div>
        <UpgradeModal
          open={showUpgradeModal}
          onOpenChange={setShowUpgradeModal}
        />
      </>
    )
  }

  // Trial active
  if (subscription.status === 'trialing' && subscription.daysLeftInTrial !== null) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">Pro Trial</h3>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  {subscription.daysLeftInTrial} days left
                </span>
              </div>
              <p className="text-xs text-white/60 mt-0.5">
                Your trial ends on {subscription.trialEndsAt?.toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/10 flex-shrink-0"
            onClick={handleManageSubscription}
            disabled={isPortalLoading}
          >
            {isPortalLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Settings className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Active subscription
  if (subscription.status === 'active') {
    return (
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">Pro Plan</h3>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                  Active
                </span>
              </div>
              <p className="text-xs text-white/60 mt-0.5">
                {subscription.cancelAtPeriodEnd
                  ? `Cancels on ${subscription.currentPeriodEnd?.toLocaleDateString()}`
                  : `Renews on ${subscription.currentPeriodEnd?.toLocaleDateString()}`}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/10 flex-shrink-0"
            onClick={handleManageSubscription}
            disabled={isPortalLoading}
          >
            {isPortalLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Settings className="w-4 h-4 mr-1" />
                Manage
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Past due
  if (subscription.status === 'past_due') {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Payment Failed</h3>
              <p className="text-xs text-white/60 mt-0.5">
                Please update your payment method to continue using Pro features
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white flex-shrink-0"
            onClick={handleManageSubscription}
            disabled={isPortalLoading}
          >
            {isPortalLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Update Payment'
            )}
          </Button>
        </div>
      </div>
    )
  }

  return null
}
