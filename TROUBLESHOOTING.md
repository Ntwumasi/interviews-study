# Troubleshooting Guide - interviews.study

This document tracks all issues encountered during development and their solutions.

---

## 1. Anthropic API Key - 404 Model Errors

### Issue
AI chat returning errors: `404 {"type":"error","error":{"type":"not_found_error","message":"model: claude-3-5-sonnet-20241022"}}`

### Root Cause
- API key in Vercel was invalid or had no model access
- Key showed "Never" used status in Anthropic Console
- Multiple model versions attempted all returned 404 errors

### Solution
1. Created new API key in Anthropic Console: https://console.anthropic.com/settings/keys
2. Copied the new key immediately (only shown once)
3. Updated `ANTHROPIC_API_KEY` in Vercel Environment Variables
4. Changed model to `claude-3-haiku-20240307` (smaller, more reliable model)
5. Redeployed application

### Files Changed
- `src/app/api/ai-interviewer/route.ts` - Line 93
- `src/app/api/interviews/[id]/feedback/route.ts` - Line 94

### Prevention
- Keep API keys documented in secure password manager
- Monitor API key usage in Anthropic Console
- Set up API key expiration reminders

---

## 2. Next.js 16 Async Params Breaking Changes

### Issue
Multiple pages failing with TypeScript errors or runtime errors related to `params` not being properly awaited.

### Root Cause
Next.js 16 changed `params` from synchronous objects to asynchronous Promises. All dynamic route handlers need to await params.

### Solution Pattern
```typescript
// ❌ BEFORE (Next.js 15)
interface PageProps {
  params: { id: string }
}
export default async function Page({ params }: PageProps) {
  const id = params.id
}

// ✅ AFTER (Next.js 16)
interface PageProps {
  params: Promise<{ id: string }>
}
export default async function Page({ params }: PageProps) {
  const { id } = await params
}
```

### Files Fixed
1. `src/app/interview/[id]/page.tsx` - Line 9-10, 75
2. `src/app/feedback/[id]/page.tsx` - Line 6-9, 43
3. `src/app/api/ai-interviewer/route.ts` - Line 11, 24
4. `src/app/api/interviews/[id]/complete/route.ts` - Line 11, 24
5. `src/app/api/interviews/[id]/feedback/route.ts` - Line 17, 30

### Prevention
- Always check Next.js migration guides when upgrading major versions
- Use TypeScript strict mode to catch these issues at compile time

---

## 3. AI Interviewer Giving Away Complete Solutions

### Issue
AI interviewer was providing complete code solutions (including pseudocode implementations) when candidates asked for help, defeating the purpose of practice interviews.

### Root Cause
System prompt lacked explicit instructions to prevent solution disclosure.

### Solution
Enhanced system prompt with explicit restrictions:
- Added **"CRITICAL: NEVER PROVIDE COMPLETE SOLUTIONS"** section
- Instructed AI to decline direct answer requests politely
- Emphasized guiding with questions instead of solutions
- Added specific examples of acceptable hints vs. unacceptable solutions

### Files Changed
- `src/app/api/ai-interviewer/route.ts` - Lines 165-170, 214-219

### Code Example
```typescript
**CRITICAL: NEVER PROVIDE COMPLETE SOLUTIONS**
- NEVER write complete code solutions or pseudocode for the candidate
- NEVER reveal the full algorithm or implementation details
- If asked directly for the answer, politely decline and offer hints instead
- Guide with questions like "What data structure could help here?"
- Only provide conceptual hints, never implementation code
```

### Prevention
- Test AI responses with prompts like "can you give me the answer?"
- Have multiple people test the AI interviewer behavior
- Add monitoring/logging of AI responses for review

---

## 4. Clerk Middleware Blocking Interview Routes

### Issue
Users redirected to sign-in page when trying to access `/interview/start?type=coding&difficulty=easy`

### Root Cause
Clerk middleware was protecting all routes by default, including the interview start route which needed to be accessible.

### Solution
Added `/interview/start(.*)` to public routes in middleware:

```typescript
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/interview/start(.*)', // Added this
])
```

### Files Changed
- `src/middleware.ts` - Line 9

### Notes
This was marked as TEMPORARY for testing. May need to revisit if interview start should actually require auth.

---

## 5. Missing NEXT_PUBLIC_APP_URL Environment Variable

### Issue
Feedback generation failing silently after completing interviews. No feedback being created in database.

### Root Cause
The `/api/interviews/[id]/complete` endpoint tries to trigger feedback generation by calling:
```typescript
fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/interviews/${interviewId}/feedback`, {
  method: 'POST',
})
```

Without `NEXT_PUBLIC_APP_URL` set in Vercel, this call fails.

### Solution
Add environment variable in Vercel:
1. Go to Project Settings → Environment Variables
2. Add new variable:
   - **Name:** `NEXT_PUBLIC_APP_URL`
   - **Value:** `https://interviews.study`
   - **Environments:** Production, Preview, Development
3. Redeploy application

### Files Affected
- `src/app/api/interviews/[id]/complete/route.ts` - Line 90

### Prevention
- Document all required environment variables in README
- Add environment variable checklist to deployment process
- Consider adding runtime checks for critical env vars

---

## 6. Code Editor Not Executing Code

### Issue
"Run" button in code editor does nothing. Output panel shows "Code execution coming soon..."

### Root Cause
Code execution backend was never implemented. The `handleRun` function only logs to console.

### Solution (For V2)
Code execution is intentionally deferred to V2. Current implementation allows:
- Users can write and edit code ✓
- AI can review code in chat ✓
- Code is saved in interview transcript ✓
- Execution is V2 feature

To implement in future:
1. Integrate code execution API (Piston API, Judge0, or similar)
2. Add secure sandboxed execution
3. Handle output/errors properly
4. Add language-specific runtime support

### Files Affected
- `src/components/interview/workspaces/code-workspace.tsx` - Lines 15-18

### V2 Feature Requirements
- [ ] Choose code execution service
- [ ] Set up API integration
- [ ] Add security/sandboxing
- [ ] Handle edge cases (timeouts, memory limits, infinite loops)
- [ ] Add test case support
- [ ] Display execution results in output panel

---

## 7. React 19 Peer Dependency Warnings

### Issue
Build warnings during Vercel deployment about React 19 peer dependencies conflicting with Radix UI packages inside Excalidraw.

### Severity
⚠️ **NON-CRITICAL** - These are warnings only, not errors. Application functions correctly.

### Root Cause
Project uses React 19, but `@excalidraw/excalidraw` has internal dependencies on older Radix UI packages that expect React 16-18.

### Solution
No action needed for V1. This is a known compatibility issue with Excalidraw and React 19. The warnings are automatically resolved by npm's dependency resolution.

### For V2 (Optional)
- Wait for Excalidraw to update dependencies
- Or consider alternative diagram libraries
- Or override peer dependencies explicitly in package.json

---

## 8. PostHog Analytics Disabled During Debugging

### Issue
Analytics tracking was temporarily removed from interview start buttons during troubleshooting.

### Root Cause
Debugging button navigation issues, simplified code to isolate problem.

### Solution
Re-enabled PostHog tracking after confirming navigation worked:

```typescript
const handleClick = () => {
  const url = `/interview/start?type=${type}&difficulty=${difficulty}`

  // Track interview click event
  try {
    trackEvent<InterviewClickedProps>(ANALYTICS_EVENTS.INTERVIEW_CLICKED, {
      type,
      difficulty,
      location: 'dashboard',
    })
  } catch (error) {
    console.error('Analytics tracking error (non-blocking):', error)
  }

  window.location.assign(url)
}
```

### Files Changed
- `src/components/dashboard/interview-difficulty-button.tsx` - Lines 22-38

### Prevention
- Use feature flags for debugging instead of removing code
- Add comments when temporarily disabling features

---

## Summary of Status

### ✅ Fixed & Deployed
1. Anthropic API key configuration
2. Next.js 16 async params in all routes
3. AI solution disclosure prevention
4. Clerk middleware route protection
5. PostHog analytics re-enabled
6. Feedback page params fix

### ⏳ Pending Testing (After Vercel Deploy)
1. NEXT_PUBLIC_APP_URL environment variable
2. Complete interview flow end-to-end
3. Feedback generation functionality

### 📋 V2 Features (Deferred)
1. Code execution engine
2. Monaco editor integration
3. Excalidraw React 19 compatibility

---

## Deployment Checklist

Before deploying to production, verify:

- [ ] All environment variables set in Vercel
  - [ ] ANTHROPIC_API_KEY (valid and has model access)
  - [ ] CLERK_SECRET_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] NEXT_PUBLIC_APP_URL (https://interviews.study)
  - [ ] NEXT_PUBLIC_POSTHOG_KEY
  - [ ] NEXT_PUBLIC_POSTHOG_HOST
  - [ ] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY

- [ ] Database tables created and RLS policies configured
- [ ] Clerk authentication working
- [ ] PostHog analytics tracking events
- [ ] AI chat responding (not giving away solutions)
- [ ] Interview flow: start → chat → end → feedback
- [ ] All dynamic routes using async params

---

## Quick Reference Commands

```bash
# Check git status
git status

# Stage all changes
git add .

# Commit with message
git commit -m "Description of changes"

# Push to main branch
git push origin main

# View Vercel logs
vercel logs [deployment-url]

# Check environment variables
vercel env ls
```

---

## Contact & Resources

- **Anthropic Console:** https://console.anthropic.com/
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Clerk Dashboard:** https://dashboard.clerk.com/
- **Supabase Dashboard:** https://app.supabase.com/
- **PostHog Dashboard:** https://us.i.posthog.com/

---

*Last Updated: 2025-11-12*
