# PostHog Analytics Setup

PostHog has been successfully configured for product analytics tracking.

## 📦 What's Installed

- **posthog-js** - PostHog JavaScript SDK for browser-based tracking

## 🗂️ Files Created

### 1. Core Configuration
- **`src/lib/posthog.ts`** - PostHog client initialization
  - Only runs client-side
  - Only enabled in development and production (not during build)
  - Includes error handling and development debug mode

### 2. Provider Component
- **`src/components/providers/posthog-provider.tsx`** - React provider component
  - Initializes PostHog on mount
  - Identifies users when Clerk authentication loads
  - Automatically tracks page views on route changes
  - Integrated into app layout

### 3. Type Definitions
- **`src/types/analytics.ts`** - TypeScript types for all analytics events
  - Event name constants to avoid typos
  - Typed properties for each event
  - Helper function `trackEvent()` for type-safe tracking

### 4. Tracking Components
- **`src/components/dashboard/interview-difficulty-button.tsx`** - Tracks interview clicks
- **Updated** `src/components/landing/newsletter-signup.tsx` - Tracks newsletter signups

## 🔐 Environment Variables

Add these to your `.env.local`:

```bash
# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_your_project_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### Getting Your PostHog Credentials

1. Sign up at [posthog.com](https://posthog.com) (free tier available)
2. Create a new project
3. Go to Project Settings → Project API Key
4. Copy your **Project API Key** as `NEXT_PUBLIC_POSTHOG_KEY`
5. The host is usually `https://us.i.posthog.com` for US region or `https://eu.i.posthog.com` for EU

**Important:** Don't forget to add these to Vercel environment variables for production!

## 📊 Events Currently Tracked

### Automatic Events
- **Page Views** - Tracked automatically on every route change
- **User Identification** - Users are identified when they sign in via Clerk

### Custom Events

#### 1. interview_clicked
**Triggered:** When user clicks on an interview difficulty button
**Location:** Dashboard
**Properties:**
```typescript
{
  type: 'coding' | 'system_design' | 'behavioral'
  difficulty: 'easy' | 'medium' | 'hard'
  location: 'dashboard'
}
```

#### 2. newsletter_signup
**Triggered:** When user subscribes to newsletter
**Location:** Landing page
**Properties:**
```typescript
{
  source: 'landing_page'
}
```

## 🎯 Events Ready to Implement

The following event types are defined and ready to use when you build those features:

### interview_started
```typescript
{
  interview_id: string
  type: InterviewType
  difficulty: DifficultyLevel
  scenario_id: string
  scenario_title: string
}
```

### interview_completed
```typescript
{
  interview_id: string
  type: InterviewType
  difficulty: DifficultyLevel
  scenario_id: string
  duration_seconds: number
  completed_successfully: boolean
}
```

### interview_abandoned
```typescript
{
  interview_id: string
  type: InterviewType
  difficulty: DifficultyLevel
  scenario_id: string
  time_spent_seconds: number
  progress_percentage?: number
}
```

### feedback_viewed
```typescript
{
  interview_id: string
  feedback_id: string
  type: InterviewType
  overall_score: number
  time_to_view_seconds?: number
}
```

## 🧑‍💻 How to Track Additional Events

### Method 1: Using the Helper Function (Recommended)

```typescript
import { ANALYTICS_EVENTS, trackEvent, InterviewStartedProps } from '@/types/analytics'

// In your component or API route
trackEvent<InterviewStartedProps>(ANALYTICS_EVENTS.INTERVIEW_STARTED, {
  interview_id: '123',
  type: 'coding',
  difficulty: 'medium',
  scenario_id: '456',
  scenario_title: 'Two Sum Problem',
})
```

### Method 2: Direct PostHog Import

```typescript
import { posthog } from '@/lib/posthog'

posthog.capture('custom_event', {
  property1: 'value1',
  property2: 'value2',
})
```

## 🔍 Viewing Your Analytics

1. Log in to [PostHog](https://posthog.com)
2. Navigate to **Insights** to create custom analytics dashboards
3. Go to **Events** to see all tracked events in real-time
4. Use **Persons** to see individual user journeys

## 🛠️ Development Mode

PostHog is configured to:
- Show debug logs in console during development
- Only create user profiles for identified users (not anonymous visitors)
- Capture page leave events automatically
- Handle errors gracefully

## 🚀 Production Checklist

Before deploying to production:

- [ ] Add `NEXT_PUBLIC_POSTHOG_KEY` to Vercel environment variables
- [ ] Add `NEXT_PUBLIC_POSTHOG_HOST` to Vercel environment variables
- [ ] Verify PostHog project is set to production mode
- [ ] Test a few events in production to ensure tracking works
- [ ] Set up PostHog alerts for critical events (optional)

## 📚 Best Practices

1. **Always use typed events** - Use the constants from `ANALYTICS_EVENTS` instead of strings
2. **Add meaningful properties** - Include context that will help you understand user behavior
3. **Track user actions, not page loads** - Page views are automatic; focus on interactions
4. **Don't track PII** - Avoid tracking sensitive personal information
5. **Test locally** - Check the browser console in development to see tracked events

## 🎨 Creating Custom Events

To add a new event type:

1. Add the event name to `ANALYTICS_EVENTS` in `src/types/analytics.ts`
2. Create an interface for the event properties
3. Add the interface to the `AnalyticsEventProps` union type
4. Use `trackEvent()` wherever you want to track the event

Example:

```typescript
// In src/types/analytics.ts
export const ANALYTICS_EVENTS = {
  // ...existing events
  PAYMENT_COMPLETED: 'payment_completed',
} as const

export interface PaymentCompletedProps {
  amount: number
  currency: string
  plan: string
}

// In your component
trackEvent<PaymentCompletedProps>(ANALYTICS_EVENTS.PAYMENT_COMPLETED, {
  amount: 29.99,
  currency: 'USD',
  plan: 'pro_monthly',
})
```

## 🐛 Troubleshooting

### Events not showing up?

1. Check browser console for PostHog debug logs
2. Verify `NEXT_PUBLIC_POSTHOG_KEY` is set correctly
3. Make sure you're not blocking PostHog with ad blockers
4. Check Network tab for requests to PostHog API

### User not being identified?

1. Ensure user is logged in via Clerk
2. Check that `PostHogProvider` is wrapping your app
3. Look for "PostHog loaded successfully" in console (dev mode)

### Analytics working locally but not in production?

1. Verify environment variables are set in Vercel
2. Check that keys don't have extra spaces or quotes
3. Ensure PostHog project is active and not paused

## 📖 Additional Resources

- [PostHog Documentation](https://posthog.com/docs)
- [PostHog React Integration](https://posthog.com/docs/libraries/react)
- [PostHog Event Tracking Best Practices](https://posthog.com/docs/product-analytics/capture-events)
