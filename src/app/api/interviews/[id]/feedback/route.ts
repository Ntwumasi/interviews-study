import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'
import { InterviewType } from '@/types'

// Increase timeout for AI feedback generation (max 60s on Vercel Pro, 10s on Hobby)
export const maxDuration = 60

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * POST /api/interviews/[id]/feedback
 * Generates AI feedback for a completed interview
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: interviewId } = await params

    // 2. Check API configuration
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('[Feedback] ANTHROPIC_API_KEY not configured')
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      )
    }

    const { data: interview, error: fetchError } = await supabaseAdmin
      .from('interviews')
      .select('*, scenario:scenarios(*), user:users(*)')
      .eq('id', interviewId)
      .single()

    if (fetchError || !interview) {
      console.error('Failed to fetch interview:', fetchError)
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      )
    }

    // Verify the interview belongs to this user
    if (interview.user.clerk_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized access to this interview' },
        { status: 403 }
      )
    }

    // Check if interview is completed
    if (interview.status !== 'completed') {
      return NextResponse.json(
        { error: 'Interview must be completed before generating feedback' },
        { status: 400 }
      )
    }

    // Check if feedback already exists
    const { data: existingFeedback } = await supabaseAdmin
      .from('feedback')
      .select('id')
      .eq('interview_id', interviewId)
      .single()

    if (existingFeedback) {
      return NextResponse.json({
        message: 'Feedback already exists',
        feedbackId: existingFeedback.id,
      })
    }

    // 3. Build feedback generation prompt
    const feedbackPrompt = buildFeedbackPrompt(
      interview.interview_type,
      interview.scenario,
      interview.transcript,
      interview.duration_seconds,
      interview.code_submission,
      interview.star_responses
    )

    // 4. Call Claude API for feedback generation
    console.log(`[Feedback] Generating feedback for interview ${interviewId}`)
    const startTime = Date.now()

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: feedbackPrompt,
        },
      ],
    })

    const duration = Date.now() - startTime
    console.log(`[Feedback] AI response received in ${duration}ms`)

    const feedbackText = response.content[0].type === 'text'
      ? response.content[0].text
      : 'Failed to generate feedback'

    // 5. Parse feedback response
    const feedback = parseFeedbackResponse(feedbackText)

    // 6. Save feedback to database
    // Try with all columns first, fall back to core columns if new columns don't exist
    const coreData = {
      interview_id: interviewId,
      overall_score: feedback.overall_score,
      technical_accuracy: feedback.technical_accuracy,
      communication: feedback.communication,
      problem_solving: feedback.problem_solving,
      strengths: feedback.strengths,
      areas_for_improvement: feedback.areas_for_improvement,
      detailed_feedback: feedback.detailed_feedback,
    }

    const fullData = {
      ...coreData,
      recommended_resources: feedback.recommended_resources,
      next_steps: feedback.next_steps,
    }

    let savedFeedback = null
    let saveError = null

    // Try with full data first (includes recommended_resources and next_steps)
    const fullResult = await supabaseAdmin
      .from('feedback')
      .insert(fullData)
      .select('id')
      .single()

    if (fullResult.error) {
      // If column doesn't exist, retry with core columns only
      if (fullResult.error.message?.includes('column') || fullResult.error.code === '42703') {
        console.warn('[Feedback] New columns not found, inserting with core columns only')
        const coreResult = await supabaseAdmin
          .from('feedback')
          .insert(coreData)
          .select('id')
          .single()

        savedFeedback = coreResult.data
        saveError = coreResult.error
      } else {
        saveError = fullResult.error
      }
    } else {
      savedFeedback = fullResult.data
    }

    if (saveError || !savedFeedback) {
      console.error('[Feedback] Failed to save feedback:', {
        error: saveError,
        errorMessage: saveError?.message,
        errorCode: saveError?.code,
        interviewId,
      })
      return NextResponse.json(
        { error: 'Failed to save feedback', details: saveError?.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Feedback generated successfully',
      feedbackId: savedFeedback.id,
    })
  } catch (error) {
    console.error('[Feedback] Error generating feedback:', error)

    // Check if it's an Anthropic API error
    if (error instanceof Error) {
      console.error('[Feedback] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })

      return NextResponse.json(
        { error: `Failed to generate feedback: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while generating feedback' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/interviews/[id]/feedback
 * Retrieves feedback for an interview
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: interviewId } = await params

    // 2. Fetch feedback with interview verification
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      )
    }

    const { data: feedback, error: fetchError } = await supabaseAdmin
      .from('feedback')
      .select('*, interview:interviews(*, user:users(*))')
      .eq('interview_id', interviewId)
      .single()

    if (fetchError || !feedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      )
    }

    // Verify the interview belongs to this user
    if (feedback.interview.user.clerk_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized access to this feedback' },
        { status: 403 }
      )
    }

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * Builds the feedback generation prompt based on interview type
 */
function buildFeedbackPrompt(
  interviewType: InterviewType,
  scenario: any,
  transcript: any[],
  durationSeconds: number,
  codeSubmission?: any,
  starResponses?: any
): string {
  const durationMinutes = Math.floor(durationSeconds / 60)

  // Count actual substantive messages from candidate
  const candidateMessages = transcript.filter(msg => msg.role === 'user')
  const totalCandidateWords = candidateMessages.reduce((sum, msg) => sum + (msg.content?.split(/\s+/).length || 0), 0)

  const conversationHistory = transcript
    .map((msg) => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`)
    .join('\n\n')

  const codeSection = codeSubmission?.code
    ? `\n**Candidate's Code Submission:**\n\`\`\`${codeSubmission.language}\n${codeSubmission.code}\n\`\`\`\n`
    : '\n**CRITICAL: No code was submitted by the candidate. This should result in very low technical scores (1-3/10).**\n'

  // Format STAR responses for behavioral interviews
  const starSection = starResponses
    ? `\n**Candidate's STAR Response Notes:**
- **Situation:** ${starResponses.situation || '(not provided)'}
- **Task:** ${starResponses.task || '(not provided)'}
- **Action:** ${starResponses.action || '(not provided)'}
- **Result:** ${starResponses.result || '(not provided)'}
`
    : '\n**Note:** Candidate did not use the STAR notes feature.\n'

  // Determine if this looks like a minimal/no-effort attempt
  const isMinimalEffort = candidateMessages.length <= 2 || totalCandidateWords < 50

  const basePrompt = `You are a STRICT but fair senior technical interviewer at a top tech company (Google/Meta/Amazon level). You are providing honest, accurate feedback on a ${interviewType.replace('_', ' ')} interview.

**Interview Details:**
- **Problem:** ${scenario.title}
- **Description:** ${scenario.description}
- **Difficulty:** ${scenario.difficulty}
- **Duration Used:** ${durationMinutes} minutes
- **Type:** ${interviewType.replace('_', ' ')}
- **Candidate Messages:** ${candidateMessages.length} messages, ~${totalCandidateWords} words total
${interviewType === 'coding' ? codeSection : ''}${interviewType === 'behavioral' ? starSection : ''}

**Full Interview Transcript:**
${conversationHistory}

---

## STRICT SCORING GUIDELINES - READ CAREFULLY

You must be HONEST and ACCURATE. Do NOT inflate scores to be nice. Real interview feedback helps candidates improve.

**Score Definitions (apply these strictly):**
- **1-2/10:** Did not attempt the problem, off-topic, or completely wrong approach
- **3-4/10:** Minimal effort, incomplete solution, major gaps in understanding
- **5-6/10:** Partial solution, understood the problem but couldn't complete it
- **7-8/10:** Good solution with minor issues, demonstrated solid understanding
- **9-10/10:** Excellent, optimal or near-optimal solution, great communication

${isMinimalEffort ? `
**⚠️ WARNING: This appears to be a minimal-effort interview:**
- Only ${candidateMessages.length} messages from candidate
- Only ~${totalCandidateWords} total words spoken
- This should be reflected in LOW scores (typically 1-4/10 range)
- Do NOT give average scores (5-7) for minimal participation
` : ''}

**CRITICAL RULES:**
1. If candidate did NOT write code or provide a solution → technical_accuracy should be 1-3/10
2. If candidate went off-topic or didn't engage with the problem → overall_score should be 1-4/10
3. If candidate only had brief exchanges without substance → problem_solving should be 1-4/10
4. Do NOT default to middle scores (5-7) for incomplete work - be accurate
5. A 2/10 is appropriate for someone who barely participated
6. A 5/10 means they attempted but couldn't finish - this requires real effort shown

**You must respond in this EXACT JSON format:**
\`\`\`json
{
  "overall_score": <number 1-10>,
  "technical_accuracy": <number 1-10>,
  "communication": <number 1-10>,
  "problem_solving": <number 1-10>,
  "strengths": [
    "Be specific - cite exact things they did well, or say 'Showed up for the interview' if nothing else"
  ],
  "areas_for_improvement": [
    "Be specific and actionable - what exactly should they work on?"
  ],
  "detailed_feedback": "Markdown formatted feedback - be specific about what happened in THIS interview",
  "recommended_resources": [
    {
      "type": "practice",
      "title": "Resource title",
      "url": "https://...",
      "description": "Why this helps"
    }
  ],
  "next_steps": [
    "Specific actionable step 1",
    "Specific actionable step 2",
    "Specific actionable step 3"
  ]
}
\`\`\`

`

  // Add type-specific guidance
  switch (interviewType) {
    case 'system_design':
      return basePrompt + `
**Evaluation Criteria for System Design:**
1. **Requirements Gathering (0-2 points):** Did they ask ANY clarifying questions? If not, deduct heavily.
2. **High-Level Design (0-2 points):** Did they sketch out components? No diagram/explanation = 0 points.
3. **Depth (0-2 points):** Did they dive into at least one component in detail?
4. **Scalability (0-2 points):** Did they discuss scale, bottlenecks, or optimizations?
5. **Trade-offs (0-2 points):** Did they acknowledge any trade-offs in their design?

**Recommended Resources to Include (pick 2-4 relevant ones):**
- "System Design Interview" by Alex Xu (Book)
- https://github.com/donnemartin/system-design-primer - System Design Primer
- https://www.youtube.com/@SystemDesignInterview - System Design Interview YouTube
- https://bytebytego.com - ByteByteGo Newsletter
- Specific YouTube videos for the system they were designing (e.g., "Design Instagram" videos)
`

    case 'coding':
      return basePrompt + `
**Evaluation Criteria for Coding:**
1. **Problem Understanding (0-2 points):** Did they restate the problem or ask clarifying questions?
2. **Approach Discussion (0-2 points):** Did they explain their approach BEFORE coding?
3. **Code Correctness (0-3 points):** Does the code actually work? Review what they wrote.
4. **Code Quality (0-2 points):** Is it readable? Reasonable variable names?
5. **Complexity Analysis (0-1 point):** Did they mention time/space complexity?

**IF NO CODE WAS SUBMITTED:**
- technical_accuracy: 1-2/10 maximum
- problem_solving: 1-3/10 maximum
- This is a failing interview performance

**Recommended Resources to Include (pick 3-5 relevant ones based on the problem):**
- https://leetcode.com/problems/{similar-problem} - Similar LeetCode problems to practice
- https://neetcode.io - NeetCode (structured problem-solving course)
- https://www.algoexpert.io - AlgoExpert
- "Cracking the Coding Interview" by Gayle McDowell (Book)
- Specific topics: Arrays, Hash Maps, Two Pointers, Dynamic Programming, etc.
- https://visualgo.net - VisuAlgo for understanding algorithms visually

For this specific problem (${scenario.title}), recommend:
- 2-3 similar LeetCode problems at same or easier difficulty
- The specific data structure/algorithm topic they should study
- A video explanation if available (NeetCode, Back To Back SWE, etc.)
`

    case 'behavioral':
      return basePrompt + `
**Evaluation Criteria for Behavioral:**
1. **STAR Structure (0-3 points):** Did they clearly state Situation, Task, Action, Result?
2. **Specificity (0-2 points):** Did they give specific details, metrics, outcomes?
3. **Ownership (0-2 points):** Did they say "I" not just "we"? Was their role clear?
4. **Impact (0-2 points):** Did they quantify results? Business impact?
5. **Relevance (0-1 point):** Did the story actually answer the question asked?

**IF THEY DIDN'T SHARE A STORY:**
- communication: 1-3/10 maximum
- This is not a passing behavioral response

**Recommended Resources to Include:**
- https://www.amazon.jobs/en/principles - Amazon Leadership Principles (great framework)
- "The STAR Interview Method" - YouTube videos
- https://www.levels.fyi/blog/behavioral-interview-prep.html - Behavioral Interview Guide
- Practice with: "Tell me about a time when..." format
- Record yourself answering and review
`

    default:
      return basePrompt
  }
}

/**
 * Parses the feedback response from Claude into structured data
 */
function parseFeedbackResponse(feedbackText: string): {
  overall_score: number
  technical_accuracy: number
  communication: number
  problem_solving: number
  strengths: string[]
  areas_for_improvement: string[]
  detailed_feedback: string
  recommended_resources: Array<{ type: string; title: string; url: string; description: string }>
  next_steps: string[]
} {
  try {
    // Extract JSON from markdown code blocks
    const jsonMatch = feedbackText.match(/```json\s*([\s\S]*?)\s*```/)
    const jsonText = jsonMatch ? jsonMatch[1] : feedbackText

    const parsed = JSON.parse(jsonText)

    return {
      overall_score: Math.max(1, Math.min(10, parsed.overall_score || 3)),
      technical_accuracy: Math.max(1, Math.min(10, parsed.technical_accuracy || 3)),
      communication: Math.max(1, Math.min(10, parsed.communication || 3)),
      problem_solving: Math.max(1, Math.min(10, parsed.problem_solving || 3)),
      strengths: parsed.strengths || ['Completed the interview session'],
      areas_for_improvement: parsed.areas_for_improvement || ['Need to attempt the problem', 'Practice coding fundamentals', 'Engage more with the interviewer'],
      detailed_feedback: parsed.detailed_feedback || '# Feedback\n\nThe interview was not completed successfully. Please review the resources below and try again.',
      recommended_resources: parsed.recommended_resources || [
        { type: 'course', title: 'NeetCode - Coding Interview Prep', url: 'https://neetcode.io', description: 'Structured approach to learning algorithms' },
        { type: 'practice', title: 'LeetCode Easy Problems', url: 'https://leetcode.com/problemset/?difficulty=EASY', description: 'Start with easy problems to build confidence' },
      ],
      next_steps: parsed.next_steps || ['Review the problem and understand what was being asked', 'Practice similar problems on LeetCode', 'Watch solution explanations on YouTube'],
    }
  } catch (error) {
    console.error('Failed to parse feedback:', error)
    // Return low default scores if parsing fails - don't assume good performance
    return {
      overall_score: 3,
      technical_accuracy: 3,
      communication: 3,
      problem_solving: 3,
      strengths: ['Attended the interview session'],
      areas_for_improvement: ['Complete the coding problem', 'Communicate your thought process', 'Practice problem-solving skills'],
      detailed_feedback: '# Interview Feedback\n\nWe were unable to fully analyze your interview performance. Based on the available information, we recommend focusing on the fundamentals and practicing more problems before your next attempt.',
      recommended_resources: [
        { type: 'course', title: 'NeetCode - Coding Interview Prep', url: 'https://neetcode.io', description: 'Structured approach to learning algorithms' },
        { type: 'practice', title: 'LeetCode Easy Problems', url: 'https://leetcode.com/problemset/?difficulty=EASY', description: 'Start with easy problems to build confidence' },
        { type: 'book', title: 'Cracking the Coding Interview', url: 'https://www.crackingthecodinginterview.com/', description: 'Comprehensive interview preparation guide' },
      ],
      next_steps: ['Start with easy problems on LeetCode', 'Learn one data structure per week', 'Practice explaining your thought process out loud'],
    }
  }
}
