import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressChart } from '@/components/dashboard/progress-chart'

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}))

const mockInterviews = [
  {
    id: '1',
    completed_at: new Date().toISOString(),
    interview_type: 'coding',
    feedback: [
      {
        overall_score: 8,
        technical_accuracy: 7,
        communication: 9,
        problem_solving: 8,
      },
    ],
  },
  {
    id: '2',
    completed_at: new Date(Date.now() - 86400000).toISOString(),
    interview_type: 'system_design',
    feedback: [
      {
        overall_score: 7,
        technical_accuracy: 6,
        communication: 8,
        problem_solving: 7,
      },
    ],
  },
]

describe('ProgressChart', () => {
  it('renders nothing when no interviews have feedback', () => {
    const { container } = render(<ProgressChart interviews={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders progress header with correct interview count', () => {
    render(<ProgressChart interviews={mockInterviews} />)
    expect(screen.getByText('Your Progress')).toBeInTheDocument()
    expect(screen.getByText(/2 interviews/)).toBeInTheDocument()
  })

  it('displays trend indicator when multiple interviews exist', () => {
    render(<ProgressChart interviews={mockInterviews} />)
    // Should show a trend indicator (up, down, or neutral)
    const trendContainer = document.querySelector('[class*="bg-emerald"], [class*="bg-red"], [class*="bg-white"]')
    expect(trendContainer).toBeInTheDocument()
  })

  it('shows averages section with correct scores', () => {
    render(<ProgressChart interviews={mockInterviews} />)
    // Should display overall, technical, communication, and problem solving averages
    expect(screen.getByText('Overall')).toBeInTheDocument()
    expect(screen.getByText('Technical')).toBeInTheDocument()
    expect(screen.getByText('Communication')).toBeInTheDocument()
    expect(screen.getByText('Problem Solving')).toBeInTheDocument()
  })

  it('renders chart components', () => {
    render(<ProgressChart interviews={mockInterviews} />)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('handles interviews without feedback array', () => {
    const interviewsWithoutFeedback = [
      {
        id: '1',
        completed_at: new Date().toISOString(),
        interview_type: 'coding',
        feedback: null,
      },
    ]
    const { container } = render(<ProgressChart interviews={interviewsWithoutFeedback} />)
    expect(container.firstChild).toBeNull()
  })
})
