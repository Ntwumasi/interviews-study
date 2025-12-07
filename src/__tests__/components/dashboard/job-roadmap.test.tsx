import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { JobRoadmap } from '@/components/dashboard/job-roadmap'

// Mock fetch
global.fetch = vi.fn()

describe('JobRoadmap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the component with header', () => {
    render(<JobRoadmap />)
    expect(screen.getByText('Job Interview Roadmap')).toBeInTheDocument()
    expect(screen.getByText(/Paste a job URL/)).toBeInTheDocument()
  })

  it('shows input mode toggle buttons', () => {
    render(<JobRoadmap />)
    expect(screen.getByText('Job URL')).toBeInTheDocument()
    expect(screen.getByText('Paste Description')).toBeInTheDocument()
  })

  it('switches between URL and text input modes', () => {
    render(<JobRoadmap />)

    // Default is URL mode
    expect(screen.getByPlaceholderText(/linkedin.com/)).toBeInTheDocument()

    // Switch to text mode
    fireEvent.click(screen.getByText('Paste Description'))
    expect(screen.getByPlaceholderText(/Paste the full job description/)).toBeInTheDocument()
  })

  it('has a target date input', () => {
    render(<JobRoadmap />)
    expect(screen.getByText('Interview Date (optional)')).toBeInTheDocument()
  })

  it('shows generate button', () => {
    render(<JobRoadmap />)
    expect(screen.getByText('Generate Learning Roadmap')).toBeInTheDocument()
  })

  it('disables generate button when no input', () => {
    render(<JobRoadmap />)
    const button = screen.getByText('Generate Learning Roadmap').closest('button')
    expect(button).toBeDisabled()
  })

  it('enables generate button when URL is entered', () => {
    render(<JobRoadmap />)

    const input = screen.getByPlaceholderText(/linkedin.com/)
    fireEvent.change(input, { target: { value: 'https://linkedin.com/jobs/view/123' } })

    const button = screen.getByText('Generate Learning Roadmap').closest('button')
    expect(button).not.toBeDisabled()
  })

  it('enables generate button when job description is entered', () => {
    render(<JobRoadmap />)

    // Switch to text mode
    fireEvent.click(screen.getByText('Paste Description'))

    const textarea = screen.getByPlaceholderText(/Paste the full job description/)
    fireEvent.change(textarea, { target: { value: 'Software Engineer at Google...' } })

    const button = screen.getByText('Generate Learning Roadmap').closest('button')
    expect(button).not.toBeDisabled()
  })

  it('shows loading state when generating', async () => {
    // Mock a slow response
    ;(global.fetch as any).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: () => Promise.resolve({ roadmap: {} }) }), 1000))
    )

    render(<JobRoadmap />)

    const input = screen.getByPlaceholderText(/linkedin.com/)
    fireEvent.change(input, { target: { value: 'https://linkedin.com/jobs/view/123' } })

    const button = screen.getByText('Generate Learning Roadmap').closest('button')
    fireEvent.click(button!)

    expect(screen.getByText('Analyzing job posting...')).toBeInTheDocument()
  })

  it('displays error message on API failure', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed to fetch job posting' }),
    })

    render(<JobRoadmap />)

    const input = screen.getByPlaceholderText(/linkedin.com/)
    fireEvent.change(input, { target: { value: 'https://linkedin.com/jobs/view/123' } })

    const button = screen.getByText('Generate Learning Roadmap').closest('button')
    fireEvent.click(button!)

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch job posting')).toBeInTheDocument()
    })
  })

  it('displays roadmap after successful generation', async () => {
    const mockRoadmap = {
      company: 'Google',
      role: 'Software Engineer',
      level: 'senior',
      type: 'fullstack',
      keySkills: ['JavaScript', 'Python'],
      techStack: ['React', 'Node.js', 'PostgreSQL'],
      focusAreas: {
        coding: { weight: 50, topics: ['Algorithms', 'Data Structures'] },
        systemDesign: { weight: 30, topics: ['Scalability'] },
        behavioral: { weight: 20, topics: ['Leadership'] },
      },
      roadmap: {
        totalDays: 14,
        phases: [
          {
            name: 'Foundation',
            days: 'Day 1-5',
            focus: 'Coding',
            dailyPlan: [
              {
                day: 1,
                title: 'Arrays & Strings',
                tasks: [
                  { type: 'study', topic: 'Array fundamentals', duration: '2 hours', details: 'Review' },
                ],
              },
            ],
          },
        ],
      },
      practiceInterviews: [
        { type: 'coding', difficulty: 'medium', topic: 'Two Sum', when: 'Day 3' },
      ],
      resources: [
        { name: 'LeetCode', type: 'website', url: 'https://leetcode.com', topic: 'Practice' },
      ],
      tips: ['Focus on communication', 'Practice whiteboarding'],
    }

    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ roadmap: mockRoadmap }),
    })

    render(<JobRoadmap />)

    const input = screen.getByPlaceholderText(/linkedin.com/)
    fireEvent.change(input, { target: { value: 'https://linkedin.com/jobs/view/123' } })

    const button = screen.getByText('Generate Learning Roadmap').closest('button')
    fireEvent.click(button!)

    await waitFor(() => {
      expect(screen.getByText('Google')).toBeInTheDocument()
      expect(screen.getByText('Software Engineer')).toBeInTheDocument()
      expect(screen.getByText('14-Day Preparation Plan')).toBeInTheDocument()
    })

    // Check focus areas
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText('30%')).toBeInTheDocument()
    expect(screen.getByText('20%')).toBeInTheDocument()

    // Check tech stack
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
  })

  it('shows new search button after roadmap is generated', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        roadmap: {
          company: 'Test',
          role: 'Engineer',
          level: 'mid',
          type: 'backend',
          keySkills: [],
          techStack: [],
          focusAreas: { coding: { weight: 50, topics: [] }, systemDesign: { weight: 30, topics: [] }, behavioral: { weight: 20, topics: [] } },
          roadmap: { totalDays: 7, phases: [] },
          practiceInterviews: [],
          resources: [],
          tips: [],
        },
      }),
    })

    render(<JobRoadmap />)

    const input = screen.getByPlaceholderText(/linkedin.com/)
    fireEvent.change(input, { target: { value: 'https://linkedin.com/jobs/view/123' } })

    const button = screen.getByText('Generate Learning Roadmap').closest('button')
    fireEvent.click(button!)

    await waitFor(() => {
      expect(screen.getByText('New Search')).toBeInTheDocument()
    })
  })
})
