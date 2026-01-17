import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { checkRateLimit, rateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit'
import { hasActiveSubscription } from '@/lib/subscription'

const anthropic = new Anthropic()

// Parse job description from URL
async function fetchJobDescription(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`)
    }

    const html = await response.text()

    // Extract text content from HTML (basic extraction)
    // Remove script and style tags
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    // Limit text length for API
    if (text.length > 15000) {
      text = text.substring(0, 15000)
    }

    return text
  } catch (error) {
    console.error('Error fetching job URL:', error)
    throw new Error('Failed to fetch job posting. Please paste the job description directly.')
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check for premium subscription
    const isPremium = await hasActiveSubscription(userId)
    if (!isPremium) {
      return NextResponse.json(
        { error: 'Premium subscription required', code: 'PREMIUM_REQUIRED' },
        { status: 402 }
      )
    }

    // Rate limiting
    const rateLimitResult = checkRateLimit(`job-roadmap:${userId}`, RATE_LIMITS.jobRoadmap)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many roadmap requests. Please wait before generating another.' },
        { status: 429, headers: rateLimitHeaders(rateLimitResult) }
      )
    }

    const { url, jobDescription, targetDate } = await request.json()

    if (!url && !jobDescription) {
      return NextResponse.json(
        { error: 'Please provide a job URL or job description' },
        { status: 400 }
      )
    }

    // Get job description from URL or use provided text
    let jd = jobDescription
    if (url && !jobDescription) {
      jd = await fetchJobDescription(url)
    }

    // Calculate days until target date
    const daysUntilInterview = targetDate
      ? Math.max(1, Math.ceil((new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 14 // Default to 2 weeks

    // Generate roadmap using Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `You are an expert technical interview coach. Analyze this job posting and create a personalized interview preparation roadmap.

JOB POSTING:
${jd}

PREPARATION TIME: ${daysUntilInterview} days

Generate a detailed JSON response with this exact structure:
{
  "company": "Company name extracted from posting",
  "role": "Role title",
  "level": "junior|mid|senior|staff|principal",
  "type": "frontend|backend|fullstack|mobile|devops|data|ml|other",
  "keySkills": ["skill1", "skill2", ...],
  "techStack": ["tech1", "tech2", ...],
  "focusAreas": {
    "coding": { "weight": 0-100, "topics": ["topic1", "topic2"] },
    "systemDesign": { "weight": 0-100, "topics": ["topic1", "topic2"] },
    "behavioral": { "weight": 0-100, "topics": ["topic1", "topic2"] }
  },
  "roadmap": {
    "totalDays": ${daysUntilInterview},
    "phases": [
      {
        "name": "Phase name",
        "days": "Day X - Day Y",
        "focus": "Main focus area",
        "dailyPlan": [
          {
            "day": 1,
            "title": "Day title",
            "tasks": [
              { "type": "study|practice|interview", "topic": "Topic", "duration": "1-2 hours", "details": "What to do" }
            ]
          }
        ]
      }
    ]
  },
  "practiceInterviews": [
    { "type": "coding|system_design|behavioral", "difficulty": "easy|medium|hard", "topic": "Topic", "when": "Day X" }
  ],
  "resources": [
    { "name": "Resource name", "type": "course|book|website|video", "url": "optional url", "topic": "What it covers" }
  ],
  "tips": ["Tip 1", "Tip 2", ...]
}

Make the roadmap realistic and achievable within the timeframe. Prioritize high-impact preparation activities.
Focus heavily on the specific technologies and skills mentioned in the job posting.
Return ONLY valid JSON, no markdown or explanation.`,
        },
      ],
    })

    // Parse the response
    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response format')
    }

    let roadmap
    try {
      // Clean the response - remove any markdown code blocks if present
      let jsonText = content.text.trim()
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '')
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '')
      }
      roadmap = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('Failed to parse roadmap JSON:', content.text)
      throw new Error('Failed to generate roadmap. Please try again.')
    }

    return NextResponse.json({
      success: true,
      roadmap,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error generating roadmap:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate roadmap' },
      { status: 500 }
    )
  }
}
