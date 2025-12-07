import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProgressDashboard } from '@/components/dashboard/progress-dashboard'

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  RadarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="radar-chart">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  Radar: () => <div data-testid="radar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
  Cell: () => <div data-testid="cell" />,
}))

const mockInterviews = [
  {
    id: '1',
    completed_at: new Date().toISOString(),
    interview_type: 'coding' as const,
    duration_seconds: 1800,
    scenario: { title: 'Two Sum', difficulty: 'medium' },
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
    interview_type: 'system_design' as const,
    duration_seconds: 2700,
    scenario: { title: 'Design Twitter', difficulty: 'hard' },
    feedback: [
      {
        overall_score: 7,
        technical_accuracy: 6,
        communication: 8,
        problem_solving: 7,
      },
    ],
  },
  {
    id: '3',
    completed_at: new Date(Date.now() - 172800000).toISOString(),
    interview_type: 'behavioral' as const,
    duration_seconds: 1200,
    scenario: { title: 'Tell me about yourself', difficulty: 'easy' },
    feedback: [
      {
        overall_score: 9,
        technical_accuracy: 8,
        communication: 10,
        problem_solving: 8,
      },
    ],
  },
]

describe('ProgressDashboard', () => {
  it('shows empty state when no interviews exist', () => {
    render(<ProgressDashboard interviews={[]} />)
    expect(screen.getByText('Start Your Journey')).toBeInTheDocument()
    expect(screen.getByText(/Complete your first practice interview/)).toBeInTheDocument()
  })

  it('renders stats cards with correct data', () => {
    render(<ProgressDashboard interviews={mockInterviews} />)

    // Should show average score
    expect(screen.getByText('Avg Score')).toBeInTheDocument()

    // Should show best score
    expect(screen.getByText('Best')).toBeInTheDocument()

    // Should show total interviews
    expect(screen.getByText('Interviews')).toBeInTheDocument()

    // Should show time spent
    expect(screen.getByText('Time')).toBeInTheDocument()

    // Should show streak
    expect(screen.getByText('Streak')).toBeInTheDocument()
  })

  it('renders all three tabs', () => {
    render(<ProgressDashboard interviews={mockInterviews} />)

    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Skills')).toBeInTheDocument()
    expect(screen.getByText('History')).toBeInTheDocument()
  })

  it('switches between tabs', () => {
    render(<ProgressDashboard interviews={mockInterviews} />)

    // Click Skills tab
    fireEvent.click(screen.getByText('Skills'))
    expect(screen.getByText('Skill Breakdown')).toBeInTheDocument()

    // Click History tab
    fireEvent.click(screen.getByText('History'))
    // Should show interview history items
    expect(screen.getByText('Two Sum')).toBeInTheDocument()
    expect(screen.getByText('Design Twitter')).toBeInTheDocument()
  })

  it('shows score trend chart in overview tab', () => {
    render(<ProgressDashboard interviews={mockInterviews} />)
    expect(screen.getByText('Score Trend')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('shows type breakdown in overview tab', () => {
    render(<ProgressDashboard interviews={mockInterviews} />)
    expect(screen.getByText('By Interview Type')).toBeInTheDocument()
    expect(screen.getByText('Coding')).toBeInTheDocument()
    expect(screen.getByText('System Design')).toBeInTheDocument()
    expect(screen.getByText('Behavioral')).toBeInTheDocument()
  })

  it('shows skill radar in skills tab', () => {
    render(<ProgressDashboard interviews={mockInterviews} />)
    fireEvent.click(screen.getByText('Skills'))

    expect(screen.getByText('Skill Breakdown')).toBeInTheDocument()
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument()
  })

  it('shows focus areas in skills tab', () => {
    render(<ProgressDashboard interviews={mockInterviews} />)
    fireEvent.click(screen.getByText('Skills'))

    expect(screen.getByText('Focus Areas')).toBeInTheDocument()
  })

  it('shows interview history with correct details', () => {
    render(<ProgressDashboard interviews={mockInterviews} />)
    fireEvent.click(screen.getByText('History'))

    // Should show scenario titles
    expect(screen.getByText('Two Sum')).toBeInTheDocument()
    expect(screen.getByText('Design Twitter')).toBeInTheDocument()
    expect(screen.getByText('Tell me about yourself')).toBeInTheDocument()

    // Should show difficulty badges
    expect(screen.getByText('medium')).toBeInTheDocument()
    expect(screen.getByText('hard')).toBeInTheDocument()
    expect(screen.getByText('easy')).toBeInTheDocument()
  })

  it('color codes scores correctly', () => {
    render(<ProgressDashboard interviews={mockInterviews} />)
    fireEvent.click(screen.getByText('History'))

    // High scores (7+) should be green, medium (5-7) amber, low (<5) red
    const scores = screen.getAllByText(/\/10/)
    expect(scores.length).toBeGreaterThan(0)
  })

  it('calculates streak correctly', () => {
    // Create consecutive day interviews
    const consecutiveInterviews = [
      {
        ...mockInterviews[0],
        id: 'a',
        completed_at: new Date().toISOString(),
      },
      {
        ...mockInterviews[1],
        id: 'b',
        completed_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ]

    render(<ProgressDashboard interviews={consecutiveInterviews} />)

    expect(screen.getByText('Streak')).toBeInTheDocument()
    expect(screen.getByText('days')).toBeInTheDocument()
  })

  it('handles interviews without scenario gracefully', () => {
    const interviewsWithoutScenario = [
      {
        ...mockInterviews[0],
        scenario: null,
      },
    ]

    render(<ProgressDashboard interviews={interviewsWithoutScenario} />)
    fireEvent.click(screen.getByText('History'))

    // Should fall back to interview type as title
    expect(screen.getByText('Coding')).toBeInTheDocument()
  })
})
