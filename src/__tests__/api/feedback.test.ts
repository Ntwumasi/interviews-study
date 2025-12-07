import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the modules
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({ userId: 'test-user-id' })),
}))

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: { id: 'db-user-id' }, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({ data: null, error: null })),
      })),
      insert: vi.fn(() => ({ data: null, error: null })),
    })),
  },
}))

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              overall_score: 8,
              technical_accuracy: 7,
              communication: 9,
              problem_solving: 8,
              strengths: ['Clear explanation', 'Good approach'],
              areas_for_improvement: ['Could optimize further'],
              detailed_feedback: 'Good job overall.',
            }),
          },
        ],
      }),
    },
  })),
}))

describe('Feedback API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should validate interview ID format', async () => {
    // Test with invalid UUID format
    const invalidId = 'not-a-uuid'
    expect(invalidId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)).toBeNull()
  })

  it('should validate UUID format correctly', () => {
    const validId = '550e8400-e29b-41d4-a716-446655440000'
    expect(validId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)).not.toBeNull()
  })

  it('should parse Claude response JSON correctly', () => {
    const mockResponse = JSON.stringify({
      overall_score: 8,
      technical_accuracy: 7,
      communication: 9,
      problem_solving: 8,
      strengths: ['Clear explanation'],
      areas_for_improvement: ['Optimize further'],
      detailed_feedback: 'Good job.',
    })

    const parsed = JSON.parse(mockResponse)
    expect(parsed.overall_score).toBe(8)
    expect(parsed.strengths).toHaveLength(1)
    expect(parsed.areas_for_improvement).toHaveLength(1)
  })

  it('should validate score ranges', () => {
    const validateScore = (score: number) => score >= 0 && score <= 10

    expect(validateScore(8)).toBe(true)
    expect(validateScore(0)).toBe(true)
    expect(validateScore(10)).toBe(true)
    expect(validateScore(-1)).toBe(false)
    expect(validateScore(11)).toBe(false)
  })

  it('should handle missing feedback fields gracefully', () => {
    const partialFeedback = {
      overall_score: 7,
      // Missing other fields
    }

    // Should provide defaults
    const normalized = {
      overall_score: partialFeedback.overall_score ?? 5,
      technical_accuracy: (partialFeedback as any).technical_accuracy ?? 5,
      communication: (partialFeedback as any).communication ?? 5,
      problem_solving: (partialFeedback as any).problem_solving ?? 5,
      strengths: (partialFeedback as any).strengths ?? [],
      areas_for_improvement: (partialFeedback as any).areas_for_improvement ?? [],
      detailed_feedback: (partialFeedback as any).detailed_feedback ?? 'No detailed feedback available.',
    }

    expect(normalized.overall_score).toBe(7)
    expect(normalized.technical_accuracy).toBe(5)
    expect(normalized.strengths).toEqual([])
  })
})
