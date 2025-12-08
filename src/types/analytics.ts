/**
 * Analytics event types for PostHog tracking
 * Keep this in sync with tracked events across the app
 */

// Interview types
import { InterviewType, DifficultyLevel } from './index'

// Event names (as constants to avoid typos)
export const ANALYTICS_EVENTS = {
  // Authentication events
  SIGN_UP_COMPLETED: 'sign_up_completed',
  SIGN_IN_COMPLETED: 'sign_in_completed',

  // Interview flow events
  INTERVIEW_CLICKED: 'interview_clicked',
  INTERVIEW_STARTED: 'interview_started',
  INTERVIEW_COMPLETED: 'interview_completed',
  INTERVIEW_ABANDONED: 'interview_abandoned',

  // Feedback events
  FEEDBACK_VIEWED: 'feedback_viewed',
  FEEDBACK_GENERATED: 'feedback_generated',

  // Engagement events
  NEWSLETTER_SIGNUP: 'newsletter_signup',
  CTA_CLICKED: 'cta_clicked',
} as const

// Event property types
export interface InterviewClickedProps {
  type: InterviewType
  difficulty: DifficultyLevel
  location: 'dashboard' | 'landing_page'
}

export interface InterviewStartedProps {
  interview_id: string
  type: InterviewType
  difficulty: DifficultyLevel
  scenario_id: string
  scenario_title: string
}

export interface InterviewCompletedProps {
  interview_id: string
  type: InterviewType
  difficulty: DifficultyLevel
  scenario_id: string
  duration_seconds: number
  completed_successfully: boolean
}

export interface InterviewAbandonedProps {
  interview_id: string
  type: InterviewType
  difficulty: DifficultyLevel
  scenario_id: string
  time_spent_seconds: number
  progress_percentage?: number
}

export interface FeedbackViewedProps {
  interview_id: string
  feedback_id: string
  type: InterviewType
  overall_score: number
  time_to_view_seconds?: number // Time between interview completion and viewing feedback
}

export interface FeedbackGeneratedProps {
  interview_id: string
  feedback_id: string
  type: InterviewType
  generation_time_ms: number
}

export interface NewsletterSignupProps {
  source: 'landing_page' | 'dashboard' | 'feedback_page'
}

export interface CTAClickedProps {
  cta_location: 'hero' | 'cta_section' | 'navbar' | 'footer'
  cta_text: string
  destination: string
}

// Union type for all event properties
export type AnalyticsEventProps =
  | InterviewClickedProps
  | InterviewStartedProps
  | InterviewCompletedProps
  | InterviewAbandonedProps
  | FeedbackViewedProps
  | FeedbackGeneratedProps
  | NewsletterSignupProps
  | CTAClickedProps

// Helper function to ensure type safety when tracking events
export function trackEvent<T extends AnalyticsEventProps>(
  eventName: string,
  properties: T
): void {
  if (typeof window !== 'undefined' && window.posthog) {
    try {
      window.posthog.capture(eventName, properties)
    } catch (error) {
      console.error('Failed to track event:', error)
    }
  }
}
