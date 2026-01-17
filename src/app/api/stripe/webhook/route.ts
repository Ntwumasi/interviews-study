import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { syncSubscriptionFromStripe, markSubscriptionCanceled } from '@/lib/subscription'
import Stripe from 'stripe'

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events
 */
export async function POST(request: NextRequest) {
  if (!stripe) {
    console.error('[Stripe Webhook] Stripe not configured')
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('[Stripe Webhook] Missing signature')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[Stripe Webhook] Webhook secret not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log(`[Stripe Webhook] Checkout completed for session: ${session.id}`)

        // The subscription is created automatically, we'll sync it when we receive
        // the customer.subscription.created event
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`[Stripe Webhook] Subscription ${event.type}: ${subscription.id}`)

        // Get period info from subscription items
        const item = subscription.items?.data[0]
        await syncSubscriptionFromStripe({
          id: subscription.id,
          customer: subscription.customer as string,
          status: subscription.status,
          current_period_start: item?.current_period_start ?? Math.floor(Date.now() / 1000),
          current_period_end: item?.current_period_end ?? Math.floor(Date.now() / 1000),
          trial_end: subscription.trial_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`[Stripe Webhook] Subscription deleted: ${subscription.id}`)

        await markSubscriptionCanceled(subscription.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`[Stripe Webhook] Payment failed for invoice: ${invoice.id}`)

        // If there's a subscription, update its status
        // Access subscription from parent field in newer Stripe API
        const subscriptionId = invoice.parent?.subscription_details?.subscription
        if (subscriptionId && typeof subscriptionId === 'string') {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          // Get period info from subscription items
          const item = subscription.items?.data[0]
          await syncSubscriptionFromStripe({
            id: subscription.id,
            customer: subscription.customer as string,
            status: subscription.status,
            current_period_start: item?.current_period_start ?? Math.floor(Date.now() / 1000),
            current_period_end: item?.current_period_end ?? Math.floor(Date.now() / 1000),
            trial_end: subscription.trial_end,
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
        }
        break
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`[Stripe Webhook] Trial ending soon for: ${subscription.id}`)
        // Could send reminder email here
        break
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Stripe Webhook] Error processing event:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
