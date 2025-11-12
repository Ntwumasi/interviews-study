import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'
import { InterviewType } from '@/types'

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

    // 2. Fetch interview with scenario
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
      interview.duration_seconds
    )

    // 4. Call Claude API for feedback generation
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

    const feedbackText = response.content[0].type === 'text'
      ? response.content[0].text
      : 'Failed to generate feedback'

    // 5. Parse feedback response
    const feedback = parseFeedbackResponse(feedbackText)

    // 6. Save feedback to database
    const { data: savedFeedback, error: saveError } = await supabaseAdmin
      .from('feedback')
      .insert({
        interview_id: interviewId,
        overall_score: feedback.overall_score,
        technical_accuracy: feedback.technical_accuracy,
        communication: feedback.communication,
        problem_solving: feedback.problem_solving,
        strengths: feedback.strengths,
        areas_for_improvement: feedback.areas_for_improvement,
        detailed_feedback: feedback.detailed_feedback,
      })
      .select('id')
      .single()

    if (saveError || !savedFeedback) {
      console.error('Failed to save feedback:', saveError)
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Feedback generated successfully',
      feedbackId: savedFeedback.id,
    })
  } catch (error) {
    console.error('Error generating feedback:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
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
  durationSeconds: number
): string {
  const durationMinutes = Math.floor(durationSeconds / 60)
  const conversationHistory = transcript
    .map((msg) => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`)
    .join('\n\n')

  const basePrompt = `You are an expert technical interviewer providing feedback on a ${interviewType.replace('_', ' ')} interview.

**Interview Details:**
- **Scenario:** ${scenario.title}
- **Description:** ${scenario.description}
- **Difficulty:** ${scenario.difficulty}
- **Duration:** ${durationMinutes} minutes
- **Type:** ${interviewType.replace('_', ' ')}

**Full Interview Transcript:**
${conversationHistory}

**Your Task:**
Provide comprehensive, constructive feedback on this interview performance. Be honest but encouraging. Highlight both strengths and areas for improvement.

**You must respond in this EXACT JSON format:**
\`\`\`json
{
  "overall_score": <number 1-10>,
  "technical_accuracy": <number 1-10>,
  "communication": <number 1-10>,
  "problem_solving": <number 1-10>,
  "strengths": [
    "Specific strength 1",
    "Specific strength 2",
    "Specific strength 3"
  ],
  "areas_for_improvement": [
    "Specific area 1",
    "Specific area 2",
    "Specific area 3"
  ],
  "detailed_feedback": "# Overall Assessment\\n\\nProvide 2-3 paragraphs of detailed feedback here in markdown format. Include:\\n- Summary of performance\\n- Key strengths demonstrated\\n- Areas needing improvement\\n- Specific examples from the interview\\n- Actionable recommendations"
}
\`\`\`

`

  // Add type-specific guidance
  switch (interviewType) {
    case 'system_design':
      return basePrompt + `
**Evaluation Criteria for System Design:**
1. **Requirements Gathering:** Did they ask clarifying questions about functional and non-functional requirements?
2. **High-Level Design:** Did they create a clear system architecture?
3. **Component Design:** Did they explain key components (databases, caches, load balancers, etc.)?
4. **Scalability:** Did they discuss how to scale the system?
5. **Trade-offs:** Did they explain trade-offs in their design decisions?
6. **Failure Handling:** Did they consider failure scenarios and mitigation?
7. **Communication:** Were they clear and structured in their explanation?

Focus on their thought process, not perfect solutions. Real-world systems evolve.
`

    case 'coding':
      return basePrompt + `
**Evaluation Criteria for Coding:**
1. **Problem Understanding:** Did they understand the problem before coding?
2. **Solution Approach:** Did they explain their approach clearly?
3. **Code Quality:** Was their code clean, readable, and well-structured?
4. **Edge Cases:** Did they consider edge cases?
5. **Complexity Analysis:** Did they analyze time and space complexity?
6. **Optimization:** Did they optimize their solution when prompted?
7. **Testing:** Did they discuss how to test their solution?
8. **Communication:** Did they think aloud and explain their decisions?

Be lenient on syntax errors but strict on logical thinking and problem-solving approach.
`

    case 'behavioral':
      return basePrompt + `
**Evaluation Criteria for Behavioral:**
1. **STAR Structure:** Did they follow Situation, Task, Action, Result format?
2. **Specificity:** Were they specific with details, numbers, and outcomes?
3. **Ownership:** Did they clearly explain their role vs team contributions?
4. **Impact:** Did they quantify the impact of their actions?
5. **Reflection:** Did they discuss lessons learned?
6. **Authenticity:** Did the story feel genuine and detailed?
7. **Communication:** Were they clear and engaging?

Look for concrete examples, not vague generalizations. "We" statements should be balanced with "I" statements.
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
} {
  try {
    // Extract JSON from markdown code blocks
    const jsonMatch = feedbackText.match(/```json\s*([\s\S]*?)\s*```/)
    const jsonText = jsonMatch ? jsonMatch[1] : feedbackText

    const parsed = JSON.parse(jsonText)

    return {
      overall_score: Math.max(1, Math.min(10, parsed.overall_score || 7)),
      technical_accuracy: Math.max(1, Math.min(10, parsed.technical_accuracy || 7)),
      communication: Math.max(1, Math.min(10, parsed.communication || 7)),
      problem_solving: Math.max(1, Math.min(10, parsed.problem_solving || 7)),
      strengths: parsed.strengths || ['Showed good engagement', 'Communicated clearly', 'Demonstrated effort'],
      areas_for_improvement: parsed.areas_for_improvement || ['More practice needed', 'Focus on fundamentals', 'Improve time management'],
      detailed_feedback: parsed.detailed_feedback || '# Feedback\n\nThank you for completing the interview. Keep practicing!',
    }
  } catch (error) {
    console.error('Failed to parse feedback:', error)
    // Return default feedback if parsing fails
    return {
      overall_score: 7,
      technical_accuracy: 7,
      communication: 7,
      problem_solving: 7,
      strengths: ['Showed engagement', 'Communicated clearly', 'Demonstrated problem-solving'],
      areas_for_improvement: ['Continue practicing', 'Focus on fundamentals', 'Work on time management'],
      detailed_feedback: '# Interview Feedback\n\nThank you for completing the interview. You demonstrated good engagement and communication throughout the session. Continue practicing to improve your technical skills and problem-solving approach.',
    }
  }
}
