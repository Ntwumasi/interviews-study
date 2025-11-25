import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, source = 'landing_page' } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      console.error('Supabase admin client not available')
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      )
    }

    // Check if email already exists
    const { data: existing } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id, is_active')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      // If they unsubscribed before, reactivate them
      if (!existing.is_active) {
        await supabaseAdmin
          .from('newsletter_subscribers')
          .update({
            is_active: true,
            unsubscribed_at: null,
            source
          })
          .eq('id', existing.id)

        return NextResponse.json({
          success: true,
          message: 'Welcome back! You have been re-subscribed.'
        })
      }

      return NextResponse.json({
        success: true,
        message: 'You are already subscribed!'
      })
    }

    // Insert new subscriber
    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .insert({
        email: email.toLowerCase(),
        source,
      })

    if (error) {
      console.error('Newsletter signup error:', error)
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Thanks for subscribing!'
    })

  } catch (error) {
    console.error('Newsletter API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
