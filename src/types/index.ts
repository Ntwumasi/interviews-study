/**
 * Core TypeScript types for interviews.study
 */

// User types (synced from Clerk to Supabase)
export interface User {
  id: string
  clerk_id: string
  email: string
  name: string | null
  created_at: string
  updated_at: string
}

// Interview scenario types
export type InterviewType = 'coding' | 'system_design' | 'behavioral'
export type DifficultyLevel = 'easy' | 'medium' | 'hard'

// Duration mapping for each interview type (in minutes)
export const DURATION_BY_TYPE: Record<InterviewType, number> = {
  coding: 60,
  system_design: 45,
  behavioral: 30,
} as const

// Interview type metadata
export const INTERVIEW_TYPE_CONFIG = {
  coding: {
    name: 'Coding Interview',
    duration: 60,
    icon: 'Code2',
    color: 'green',
    description: 'Solve algorithmic problems with live code execution',
  },
  system_design: {
    name: 'System Design',
    duration: 45,
    icon: 'Network',
    color: 'blue',
    description: 'Design scalable systems and architecture',
  },
  behavioral: {
    name: 'Behavioral',
    duration: 30,
    icon: 'MessageSquare',
    color: 'purple',
    description: 'Answer STAR-format questions about experiences',
  },
} as const

export interface Scenario {
  id: string
  interview_type: InterviewType
  title: string
  description: string
  difficulty: DifficultyLevel
  tags: string[]
  prompt: string
  duration_minutes: number
  created_at: string
}

// Interview session types
export type InterviewStatus = 'in_progress' | 'completed' | 'abandoned'

export interface TranscriptMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export interface Interview {
  id: string
  user_id: string
  scenario_id: string
  interview_type: InterviewType
  status: InterviewStatus
  started_at: string
  completed_at: string | null
  duration_seconds: number | null
  transcript: TranscriptMessage[]
  diagram_data: object | null // Excalidraw JSON (system_design only)
  code_submission: CodeSubmission | null // Coding interviews only
  star_responses: StarResponse | null // Behavioral interviews only
  video_recording_url: string | null // All interview types
  created_at: string
}

// Coding interview specific types
export interface CodeSubmission {
  code: string
  language: string
  test_results: TestResult[]
  submitted_at: string
}

export interface TestResult {
  test_case: string
  passed: boolean
  expected_output: string
  actual_output: string
  execution_time_ms: number
}

// Behavioral interview specific types
export interface StarResponse {
  situation: string
  task: string
  action: string
  result: string
  completed_at: string
}

// Feedback types
export interface Feedback {
  id: string
  interview_id: string
  overall_score: number // 1-10
  strengths: string[]
  areas_for_improvement: string[]
  detailed_feedback: string // Markdown format
  technical_accuracy: number // 1-10
  communication: number // 1-10
  problem_solving: number // 1-10
  created_at: string
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Interview state management (Zustand)
export interface InterviewState {
  interviewId: string | null
  scenario: Scenario | null
  interviewType: InterviewType | null
  transcript: TranscriptMessage[]
  diagramData: object | null // system_design
  codeSubmission: CodeSubmission | null // coding
  starResponses: StarResponse | null // behavioral
  timeRemaining: number // seconds
  isPaused: boolean
  isRecording: boolean

  // Actions
  setInterview: (id: string, scenario: Scenario) => void
  addMessage: (message: TranscriptMessage) => void
  updateDiagram: (data: object) => void
  updateCode: (submission: CodeSubmission) => void
  updateStarResponses: (responses: StarResponse) => void
  updateTimer: (seconds: number) => void
  togglePause: () => void
  toggleRecording: () => void
  reset: () => void
}

// Clerk user metadata extensions
export interface UserPublicMetadata {
  role?: 'user' | 'admin'
}

export interface UserPrivateMetadata {
  supabase_id?: string
}
