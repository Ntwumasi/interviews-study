# interviews.study - Project Documentation

> AI-powered mock interview platform for software engineers

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Auth | Clerk |
| Database | Supabase (PostgreSQL) |
| Payments | Stripe |
| AI | Anthropic Claude API |
| Voice | ElevenLabs TTS |
| Video | Mux |
| Analytics | PostHog |
| Hosting | Vercel |
| Domain | interviews.study |

---

## User Flow

```
Landing Page → Sign Up (Clerk) → /subscribe → Stripe Checkout → Dashboard
                                      ↓
                              (3-day free trial)
                                      ↓
                              $19.99/month after
```

**Key points:**
- Users MUST enter payment info to access the app
- 3-day free trial, then auto-converts to paid
- No free tier access to dashboard

---

## Environment Variables

### Required for `.env.local` and Vercel:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/subscribe

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-api03-...

# ElevenLabs TTS
ELEVENLABS_API_KEY=sk_...

# Mux Video
MUX_TOKEN_ID=...
MUX_TOKEN_SECRET=...
MUX_WEBHOOK_SECRET=...

# Stripe Payments
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# App
NEXT_PUBLIC_APP_URL=https://interviews.study
```

---

## Third-Party Service Configuration

### Clerk (Auth)
- Dashboard: https://dashboard.clerk.com
- Social connections configured:
  - **GitHub OAuth**: Custom credentials from GitHub Developer Settings
  - **Google OAuth**: Custom credentials from Google Cloud Console
- Callback URL for both: `https://clerk.interviews.study/v1/oauth_callback`

### Stripe (Payments)
- Dashboard: https://dashboard.stripe.com
- Product: "Interview Study Pro" - $19.99/month
- Price ID: `price_1SqIOZHyXLSFqfeaaTED9OYj`
- Webhook endpoint: `https://interviews.study/api/stripe/webhook`
- Webhook events: `customer.subscription.*`
- Trial: 3 days

### Supabase (Database)
- Dashboard: https://supabase.com/dashboard/project/wfzfoehklqkjypzzuxtg
- Key tables: `users`, `interviews`, `scenarios`, `feedback`, `subscriptions`

### Mux (Video Recording)
- Dashboard: https://dashboard.mux.com
- Webhook endpoint: `https://interviews.study/api/mux/webhook`

---

## Database Schema

### subscriptions table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'inactive',
  -- Status: 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'inactive'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### users table additions
```sql
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
```

---

## Key Routes

### Pages
| Route | Description |
|-------|-------------|
| `/` | Landing page with pricing |
| `/sign-up` | Clerk sign-up |
| `/sign-in` | Clerk sign-in |
| `/subscribe` | Auto-redirects to Stripe Checkout |
| `/dashboard` | Main app (requires subscription) |
| `/interview/[id]` | Active interview session |
| `/faq` | FAQ page with AI chatbot |

### API Routes
| Route | Description |
|-------|-------------|
| `/api/stripe/checkout` | Creates Stripe Checkout session |
| `/api/stripe/webhook` | Handles Stripe webhook events |
| `/api/stripe/portal` | Creates Stripe Customer Portal session |
| `/api/stripe/subscription` | Gets user's subscription status |
| `/api/ai-interviewer` | AI interviewer responses |
| `/api/interviews/[id]/feedback` | Generate interview feedback |
| `/api/mux/upload` | Get Mux upload URL |
| `/api/mux/webhook` | Handle Mux video events |

---

## Key Files

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── subscribe/page.tsx          # Auto-redirect to Stripe
│   ├── (dashboard)/dashboard/      # Main dashboard
│   └── api/
│       ├── stripe/                 # Stripe endpoints
│       ├── ai-interviewer/         # Claude AI
│       └── mux/                    # Video recording
├── components/
│   └── dashboard/
│       ├── subscription-status.tsx # Shows trial/subscription status
│       └── upgrade-modal.tsx       # Upgrade prompt (not used in current flow)
├── lib/
│   ├── stripe.ts                   # Stripe client config
│   ├── subscription.ts             # Subscription helpers
│   ├── rate-limit.ts               # API rate limiting
│   └── supabase.ts                 # Supabase client
└── middleware.ts                   # Clerk auth middleware
```

---

## Deployment

### Vercel
- Auto-deploys on push to `main`
- Environment variables configured in Vercel dashboard
- Domain: interviews.study

### Commands
```bash
# Local development
npm run dev

# Build
npm run build

# Deploy (auto via git push)
git push origin main
```

---

## Pricing Model

| Plan | Price | Features |
|------|-------|----------|
| Pro | $19.99/month | Unlimited interviews, all company tracks, video recording, AI feedback |

- 3-day free trial (credit card required)
- Cancel anytime during trial = no charge
- Auto-converts to paid after trial

---

## Interview Types

1. **Coding** (60 min) - Live code editor, 5 languages (JS, Python, Java, C++, Go)
2. **System Design** (45 min) - Interactive whiteboard/diagrams
3. **Behavioral** (30 min) - STAR framework

Difficulty levels: Easy, Medium, Hard

---

## Company Tracks

- Google
- Meta
- Amazon
- Apple
- Microsoft
- Netflix
- Stripe

---

## Rate Limits (Free tier - not currently used)

| Endpoint | Limit |
|----------|-------|
| AI Interviewer | 10 req/hour |
| TTS | 20 req/hour |
| Code Execution | 30 req/hour |
| Job Roadmap | 5 req/day |
| FAQ | 10 req/hour |

---

## Common Tasks

### Add new environment variable
1. Add to `.env.local`
2. Add to Vercel: `vercel env add VAR_NAME production`
3. Redeploy

### Update Stripe price
1. Create new price in Stripe Dashboard
2. Update `STRIPE_PRICE_ID` in env vars
3. Redeploy

### Run database migration
1. Go to Supabase SQL Editor
2. Run migration SQL
3. No deploy needed

---

## Contacts

- Support email: support@kodedit.io
- Privacy email: privacy@kodedit.io
- Company: Kodedit LLC
