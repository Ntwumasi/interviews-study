import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'
import { TranscriptMessage, InterviewType } from '@/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * POST /api/ai-interviewer
 * Sends a message to the AI interviewer and returns the response
 *
 * Request body:
 * - interviewId: string
 * - message: string
 * - transcript: TranscriptMessage[]
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse request body
    const body = await request.json()
    const { interviewId, message, transcript } = body

    if (!interviewId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: interviewId, message' },
        { status: 400 }
      )
    }

    // 3. Fetch interview and scenario details
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      )
    }

    const { data: interview, error: interviewError } = await supabaseAdmin
      .from('interviews')
      .select('*, scenario:scenarios(*), user:users(*)')
      .eq('id', interviewId)
      .single()

    if (interviewError || !interview) {
      console.error('Failed to fetch interview:', interviewError)
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

    // 4. Build system prompt based on interview type
    const systemPrompt = buildSystemPrompt(
      interview.interview_type,
      interview.scenario
    )

    // 5. Build conversation history for Claude
    const messages = transcript.map((msg: TranscriptMessage) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }))

    // Add the new user message
    messages.push({
      role: 'user',
      content: message,
    })

    // 6. Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      system: systemPrompt,
      messages: messages as any,
    })

    const aiResponse = response.content[0].type === 'text'
      ? response.content[0].text
      : 'I apologize, but I encountered an error generating a response.'

    // 7. Update interview transcript in database
    const updatedTranscript = [
      ...transcript,
      {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      },
      {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      },
    ]

    const { error: updateError } = await supabaseAdmin
      .from('interviews')
      .update({ transcript: updatedTranscript })
      .eq('id', interviewId)

    if (updateError) {
      console.error('Failed to update transcript:', updateError)
      // Don't fail the request, just log the error
    }

    // 8. Return AI response
    return NextResponse.json({
      message: aiResponse,
    })
  } catch (error) {
    console.error('Error in AI interviewer:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * Builds the system prompt for the AI interviewer based on interview type
 */
function buildSystemPrompt(interviewType: InterviewType, scenario: any): string {
  const basePrompt = `You are an experienced technical interviewer conducting a ${interviewType.replace('_', ' ')} interview. Your role is to guide the candidate through the interview professionally and constructively.

**Interview Details:**
- **Scenario:** ${scenario.title}
- **Description:** ${scenario.description}
- **Difficulty:** ${scenario.difficulty}
- **Type:** ${interviewType.replace('_', ' ')}

**Scenario Prompt:**
${scenario.prompt}

**Your Responsibilities:**
1. Ask clarifying questions when the candidate makes assumptions
2. Provide hints if the candidate is stuck, but don't give away the solution
3. Challenge good ideas to see how deep their understanding goes
4. Keep the conversation flowing naturally
5. Be encouraging but honest about concerns
6. If they go off track, gently guide them back
7. Adapt your questioning based on their responses

**Important Guidelines:**
- Be conversational and friendly, but professional
- Don't be overly critical or discouraging
- Ask follow-up questions to probe understanding
- If they're doing well, challenge them with edge cases
- Keep responses concise (2-4 sentences typically)
- Use markdown formatting for clarity when needed

`

  // Add type-specific guidance
  switch (interviewType) {
    case 'system_design':
      return basePrompt + `
**System Design Interview Guidance:**
- Start by asking about requirements and constraints
- Guide them through: functional requirements, non-functional requirements, capacity estimation
- Ask about specific components: databases, caching, load balancing, etc.
- Probe trade-offs: "Why did you choose X over Y?"
- Ask about scalability: "What happens when you have 10x users?"
- Discuss failure scenarios: "What if this component fails?"
- Don't expect a perfect solution - real-world systems evolve

**Example Questions to Ask:**
- "What are the key functional requirements?"
- "How many users are we expecting?"
- "What's more important here: consistency or availability?"
- "How would you handle [specific scenario]?"
- "What bottlenecks do you foresee?"
`

    case 'coding':
      return basePrompt + `
**Coding Interview Guidance:**
- Start by ensuring they understand the problem
- Ask them to think aloud as they code
- Inquire about edge cases: empty inputs, large inputs, invalid inputs
- Ask about time and space complexity
- If they finish, ask: "Can you optimize this further?"
- Discuss testing: "How would you test this?"
- Be okay with pseudocode initially, then ask them to implement

**Example Questions to Ask:**
- "What's your initial approach?"
- "Can you walk me through an example?"
- "What edge cases should we consider?"
- "What's the time complexity of your solution?"
- "How would you handle [specific edge case]?"
- "Can you optimize the space complexity?"
`

    case 'behavioral':
      return basePrompt + `
**Behavioral Interview Guidance:**
- Guide them through the STAR method (Situation, Task, Action, Result)
- Ask probing questions if they're too vague
- Look for specifics: numbers, timelines, concrete actions
- Ask about their specific role vs team contributions
- Inquire about lessons learned and what they'd do differently
- Follow up on interesting points

**Example Follow-up Questions:**
- "Can you be more specific about your role in this?"
- "What was the outcome? Do you have any metrics?"
- "What would you do differently if you faced this again?"
- "How did you handle pushback from [stakeholder]?"
- "What did you learn from this experience?"
- "Tell me more about [specific point they mentioned]"

**Red Flags to Probe:**
- Vague answers without specifics
- Taking credit for team work ("we" without "I")
- No discussion of challenges or failures
- No reflection or learning
`

    default:
      return basePrompt
  }
}
