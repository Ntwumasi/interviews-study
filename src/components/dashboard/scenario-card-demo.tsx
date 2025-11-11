// Demo component to showcase all three interview type cards
// This can be used in the dashboard or for testing

import { ScenarioCard } from './scenario-card'
import { Scenario } from '@/types'

// Sample scenarios for each type
const SAMPLE_SCENARIOS: Scenario[] = [
  {
    id: '1',
    interview_type: 'coding',
    title: 'Two Sum Problem',
    description: 'Given an array of integers and a target, find two numbers that add up to the target value.',
    difficulty: 'medium',
    tags: ['arrays', 'hash-table', 'two-pointers'],
    prompt: 'Solve the Two Sum problem...',
    duration_minutes: 60,
    created_at: '2025-11-11T00:00:00Z',
  },
  {
    id: '2',
    interview_type: 'system_design',
    title: 'Design Twitter',
    description: 'Design a Twitter-like social media platform with timeline, tweets, follows, and real-time updates.',
    difficulty: 'hard',
    tags: ['social-media', 'feed', 'scaling', 'real-time'],
    prompt: 'Design Twitter...',
    duration_minutes: 45,
    created_at: '2025-11-11T00:00:00Z',
  },
  {
    id: '3',
    interview_type: 'behavioral',
    title: 'Tell me about a time you failed',
    description: 'Describe a significant professional failure or setback and what you learned from it.',
    difficulty: 'medium',
    tags: ['self-awareness', 'growth-mindset', 'resilience'],
    prompt: 'Tell me about a time you failed...',
    duration_minutes: 30,
    created_at: '2025-11-11T00:00:00Z',
  },
]

export function ScenarioCardDemo() {
  return (
    <div className="grid md:grid-cols-3 gap-6 p-8">
      {SAMPLE_SCENARIOS.map((scenario) => (
        <ScenarioCard key={scenario.id} scenario={scenario} />
      ))}
    </div>
  )
}
