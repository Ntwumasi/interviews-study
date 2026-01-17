/**
 * Subscription status values matching Stripe's subscription statuses
 */
export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'inactive'

/**
 * Database subscription record
 */
export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string | null
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  trial_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

/**
 * Subscription info returned to clients
 */
export interface SubscriptionInfo {
  status: SubscriptionStatus
  isActive: boolean
  isPremium: boolean
  trialEndsAt: Date | null
  currentPeriodEnd: Date | null
  daysLeftInTrial: number | null
  cancelAtPeriodEnd: boolean
}

/**
 * Response from subscription status API
 */
export interface SubscriptionStatusResponse {
  subscription: SubscriptionInfo | null
  error?: string
}

/**
 * Response from checkout API
 */
export interface CheckoutResponse {
  url: string
  error?: string
}

/**
 * Response from portal API
 */
export interface PortalResponse {
  url: string
  error?: string
}
