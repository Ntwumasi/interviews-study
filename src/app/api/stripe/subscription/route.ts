import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSubscriptionInfo } from '@/lib/subscription'

/**
 * GET /api/stripe/subscription
 * Returns the current user's subscription status
 */
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const subscription = await getSubscriptionInfo(userId)

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('[Subscription Status] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    )
  }
}
