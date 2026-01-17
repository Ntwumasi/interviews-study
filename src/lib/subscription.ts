import { supabaseAdmin } from './supabase'
import { stripe } from './stripe'
import { SubscriptionInfo, SubscriptionStatus, Subscription } from '@/types/subscription'

/**
 * Get subscription info for a user by their Clerk user ID
 */
export async function getSubscriptionInfo(clerkUserId: string): Promise<SubscriptionInfo | null> {
  if (!supabaseAdmin) {
    console.error('[Subscription] Supabase not configured')
    return null
  }

  // Get user's Supabase ID
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('clerk_id', clerkUserId)
    .single()

  if (userError || !user) {
    return null
  }

  // Get subscription
  const { data: subscription, error: subError } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (subError || !subscription) {
    return {
      status: 'inactive',
      isActive: false,
      isPremium: false,
      trialEndsAt: null,
      currentPeriodEnd: null,
      daysLeftInTrial: null,
      cancelAtPeriodEnd: false,
    }
  }

  const sub = subscription as Subscription
  const isActive = sub.status === 'trialing' || sub.status === 'active'
  const trialEndsAt = sub.trial_end ? new Date(sub.trial_end) : null
  const currentPeriodEnd = sub.current_period_end ? new Date(sub.current_period_end) : null

  let daysLeftInTrial: number | null = null
  if (sub.status === 'trialing' && trialEndsAt) {
    const now = new Date()
    const diffMs = trialEndsAt.getTime() - now.getTime()
    daysLeftInTrial = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
  }

  return {
    status: sub.status as SubscriptionStatus,
    isActive,
    isPremium: isActive,
    trialEndsAt,
    currentPeriodEnd,
    daysLeftInTrial,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  }
}

/**
 * Check if a user has an active subscription (trialing or active)
 */
export async function hasActiveSubscription(clerkUserId: string): Promise<boolean> {
  const info = await getSubscriptionInfo(clerkUserId)
  return info?.isActive ?? false
}

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(
  clerkUserId: string,
  email: string,
  name?: string | null
): Promise<string | null> {
  if (!stripe || !supabaseAdmin) {
    console.error('[Subscription] Stripe or Supabase not configured')
    return null
  }

  // Get user from database
  let { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('id, stripe_customer_id')
    .eq('clerk_id', clerkUserId)
    .single()

  // If user doesn't exist in Supabase, create them (handles race condition with Clerk)
  if (userError || !user) {
    console.log('[Subscription] User not found, creating in Supabase:', clerkUserId)

    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        clerk_id: clerkUserId,
        email: email,
        name: name || null,
      })
      .select('id, stripe_customer_id')
      .single()

    if (createError || !newUser) {
      console.error('[Subscription] Failed to create user:', createError)
      return null
    }

    user = newUser
  }

  // If user already has a Stripe customer ID, return it
  if (user.stripe_customer_id) {
    return user.stripe_customer_id
  }

  // Create new Stripe customer
  try {
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: {
        clerk_user_id: clerkUserId,
      },
    })

    // Save customer ID to user record
    await supabaseAdmin
      .from('users')
      .update({ stripe_customer_id: customer.id })
      .eq('id', user.id)

    return customer.id
  } catch (error) {
    console.error('[Subscription] Failed to create Stripe customer:', error)
    return null
  }
}

/**
 * Sync subscription data from Stripe to Supabase
 * Called by webhook handler
 */
export async function syncSubscriptionFromStripe(
  stripeSubscription: {
    id: string
    customer: string
    status: string
    current_period_start: number
    current_period_end: number
    trial_end: number | null
    cancel_at_period_end: boolean
  }
): Promise<void> {
  if (!supabaseAdmin) {
    console.error('[Subscription] Supabase not configured')
    return
  }

  const customerId = typeof stripeSubscription.customer === 'string'
    ? stripeSubscription.customer
    : stripeSubscription.customer

  // Find user by Stripe customer ID
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !user) {
    console.error('[Subscription] User not found for customer:', customerId)
    return
  }

  // Upsert subscription record
  const subscriptionData = {
    user_id: user.id,
    stripe_customer_id: customerId,
    stripe_subscription_id: stripeSubscription.id,
    status: stripeSubscription.status,
    current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
    trial_end: stripeSubscription.trial_end
      ? new Date(stripeSubscription.trial_end * 1000).toISOString()
      : null,
    cancel_at_period_end: stripeSubscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }

  const { error: upsertError } = await supabaseAdmin
    .from('subscriptions')
    .upsert(subscriptionData, {
      onConflict: 'stripe_subscription_id',
    })

  if (upsertError) {
    console.error('[Subscription] Failed to sync subscription:', upsertError)
  }
}

/**
 * Mark a subscription as canceled in the database
 */
export async function markSubscriptionCanceled(stripeSubscriptionId: string): Promise<void> {
  if (!supabaseAdmin) return

  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', stripeSubscriptionId)
}

/**
 * Require premium access - returns error response if not premium
 */
export async function requirePremium(clerkUserId: string): Promise<{ error: string } | null> {
  const isPremium = await hasActiveSubscription(clerkUserId)
  if (!isPremium) {
    return { error: 'Premium subscription required' }
  }
  return null
}
