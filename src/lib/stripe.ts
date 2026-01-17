import Stripe from 'stripe'

// Initialize Stripe client
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey && process.env.NODE_ENV === 'production') {
  console.error('STRIPE_SECRET_KEY is not configured')
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  : null

// Helper to check if Stripe is configured
export function isStripeConfigured(): boolean {
  return stripe !== null
}

// Stripe configuration
export const STRIPE_CONFIG = {
  priceId: process.env.STRIPE_PRICE_ID || '',
  trialDays: 3,
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=canceled`,
  portalReturnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
}
