import Link from 'next/link'
import { Code2, Network, MessageSquare, Camera, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Scenario, InterviewType, DURATION_BY_TYPE } from '@/types'
import { cn } from '@/lib/utils'

interface ScenarioCardProps {
  scenario: Scenario
}

// Color schemes for each interview type
const TYPE_COLORS = {
  coding: {
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    card: 'border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/5',
    icon: 'bg-blue-500/10 text-blue-400',
    iconHover: 'group-hover:bg-blue-500/20',
  },
  system_design: {
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    card: 'border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/5',
    icon: 'bg-purple-500/10 text-purple-400',
    iconHover: 'group-hover:bg-purple-500/20',
  },
  behavioral: {
    badge: 'bg-green-500/20 text-green-300 border-green-500/30',
    card: 'border-green-500/30 hover:border-green-500/50 hover:bg-green-500/5',
    icon: 'bg-green-500/10 text-green-400',
    iconHover: 'group-hover:bg-green-500/20',
  },
} as const

// Icons for each interview type
const TYPE_ICONS = {
  coding: Code2,
  system_design: Network,
  behavioral: MessageSquare,
} as const

// Display names for interview types
const TYPE_NAMES = {
  coding: 'Coding',
  system_design: 'System Design',
  behavioral: 'Behavioral',
} as const

export function ScenarioCard({ scenario }: ScenarioCardProps) {
  const colors = TYPE_COLORS[scenario.interview_type]
  const Icon = TYPE_ICONS[scenario.interview_type]
  const typeName = TYPE_NAMES[scenario.interview_type]
  const duration = DURATION_BY_TYPE[scenario.interview_type]

  // Difficulty badge colors
  const difficultyColors = {
    easy: 'bg-green-500/20 text-green-300',
    medium: 'bg-yellow-500/20 text-yellow-300',
    hard: 'bg-red-500/20 text-red-300',
  }

  return (
    <Link href={`/interview/${scenario.id}`}>
      <div
        className={cn(
          'group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 hover:scale-105 cursor-pointer',
          colors.card
        )}
      >
        {/* Header with icon and badges */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              'p-3 rounded-xl transition-colors',
              colors.icon,
              colors.iconHover
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-2 items-end">
            <span
              className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold border',
                colors.badge
              )}
            >
              {typeName}
            </span>
            <span
              className={cn(
                'px-2.5 py-0.5 rounded-full text-xs font-medium',
                difficultyColors[scenario.difficulty]
              )}
            >
              {scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1)}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300">
          {scenario.title}
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
          {scenario.description}
        </p>

        {/* Tags */}
        {scenario.tags && scenario.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {scenario.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
            {scenario.tags.length > 3 && (
              <span className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded-md">
                +{scenario.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer with duration and video indicator */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-4 text-gray-400 text-sm">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{duration} min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Camera className="w-4 h-4" />
              <span className="text-xs">Video</span>
            </div>
          </div>

          {/* Arrow indicator on hover */}
          <div className="text-gray-400 group-hover:text-white transition-colors">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>

        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-br from-white/5 to-transparent" />
      </div>
    </Link>
  )
}
