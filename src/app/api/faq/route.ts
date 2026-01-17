import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { checkRateLimit, rateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit'

const anthropic = new Anthropic()

// Platform context for the AI to reference
const PLATFORM_CONTEXT = `
You are a helpful assistant for interviews.study, an AI-powered mock interview platform for software engineers.

PLATFORM OVERVIEW:
- interviews.study helps software engineers prepare for technical interviews at top tech companies (Google, Meta, Amazon, Apple, Microsoft, Netflix, Stripe)
- We offer three interview types: Coding (60 min), System Design (45 min), and Behavioral (30 min)
- All interviews are conducted by an AI interviewer that simulates real interview conditions
- After each interview, users receive detailed AI-generated feedback with scores and recommendations

KEY FEATURES:
1. Interview Types:
   - Coding: Live code editor supporting JavaScript, Python, Java, C++, Go with real-time execution
   - System Design: Interactive whiteboard/diagramming canvas for architecture designs
   - Behavioral: STAR method framework (Situation, Task, Action, Result) for structured responses

2. Difficulty Levels: Easy, Medium, Hard for each interview type

3. Feedback System:
   - Overall score (1-10)
   - Category scores: Technical Accuracy, Communication, Problem Solving
   - Strengths and areas for improvement
   - Curated study resources with links
   - Actionable next steps

4. Progress Tracking:
   - Dashboard with performance trends
   - Charts showing improvement over time
   - Interview history with full transcripts and code review

5. Job Roadmap Generator:
   - Paste a job URL or description
   - Set target interview date
   - AI generates personalized day-by-day preparation plan
   - Includes focus areas, practice recommendations, and resources

6. Company-Specific Tracks:
   - Google, Meta, Amazon, Apple, Microsoft tracks
   - Company-specific interview focuses and question types
   - Tailored preparation for each company's interview style

PRICING:
- Pro Plan: $19.99/month
- 3-day free trial to start (credit card required)
- Unlimited interviews, all company tracks, video recording
- Cancel anytime during trial - no charge

TECHNICAL:
- Works best on desktop (coding/system design need larger screens)
- Mobile-responsive for viewing progress and feedback
- No installation required - runs in browser
- Supports Chrome, Firefox, Safari, Edge

SUPPORT:
- Email: support@kodedit.io
- Privacy questions: privacy@kodedit.io
`

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP for unauthenticated endpoint
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'
    const rateLimitResult = checkRateLimit(`faq:${ip}`, RATE_LIMITS.faq)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many questions. Please wait before asking more.' },
        { status: 429, headers: rateLimitHeaders(rateLimitResult) }
      )
    }

    const { question } = await request.json()

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a question' },
        { status: 400 }
      )
    }

    if (question.length > 500) {
      return NextResponse.json(
        { error: 'Question is too long. Please keep it under 500 characters.' },
        { status: 400 }
      )
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `${PLATFORM_CONTEXT}

USER QUESTION: ${question}

Please provide a helpful, concise answer to this question about interviews.study.
- If the question is about features we offer, explain clearly
- If asking about something we don't offer, say so honestly and suggest alternatives if relevant
- Keep the response friendly and professional
- If the question is unrelated to interview prep or our platform, politely redirect
- Keep the answer under 3-4 sentences unless more detail is truly needed`,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response format')
    }

    return NextResponse.json({
      answer: content.text,
    })
  } catch (error) {
    console.error('FAQ AI error:', error)
    return NextResponse.json(
      { error: 'Failed to generate answer. Please try again.' },
      { status: 500 }
    )
  }
}
