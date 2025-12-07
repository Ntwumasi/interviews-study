'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  ChevronRight,
  Lock,
  CheckCircle2,
  Code2,
  Network,
  MessageSquare,
} from 'lucide-react'

interface CompanyTrack {
  id: string
  name: string
  logo: string
  color: string
  description: string
  totalQuestions: number
  interviews: {
    type: 'coding' | 'system_design' | 'behavioral'
    count: number
    focus: string
  }[]
  difficulty: 'medium' | 'hard'
  isPremium: boolean
}

const COMPANY_TRACKS: CompanyTrack[] = [
  {
    id: 'google',
    name: 'Google',
    logo: '🔍',
    color: '#4285f4',
    description: 'Focus on algorithms, scalability, and Googleyness',
    totalQuestions: 15,
    interviews: [
      { type: 'coding', count: 6, focus: 'Graphs, Dynamic Programming, Arrays' },
      { type: 'system_design', count: 5, focus: 'YouTube, Google Maps, Search' },
      { type: 'behavioral', count: 4, focus: 'Googleyness & Leadership' },
    ],
    difficulty: 'hard',
    isPremium: false,
  },
  {
    id: 'meta',
    name: 'Meta',
    logo: '👁️',
    color: '#0668E1',
    description: 'Emphasis on product sense and move fast culture',
    totalQuestions: 14,
    interviews: [
      { type: 'coding', count: 5, focus: 'Trees, Strings, BFS/DFS' },
      { type: 'system_design', count: 5, focus: 'Instagram, Messenger, News Feed' },
      { type: 'behavioral', count: 4, focus: 'Impact & Collaboration' },
    ],
    difficulty: 'hard',
    isPremium: false,
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logo: '📦',
    color: '#ff9900',
    description: 'Leadership Principles focused with system design',
    totalQuestions: 16,
    interviews: [
      { type: 'coding', count: 5, focus: 'Arrays, Trees, OOP Design' },
      { type: 'system_design', count: 5, focus: 'Distributed Systems, Warehousing' },
      { type: 'behavioral', count: 6, focus: 'Leadership Principles' },
    ],
    difficulty: 'hard',
    isPremium: false,
  },
  {
    id: 'apple',
    name: 'Apple',
    logo: '🍎',
    color: '#555555',
    description: 'Deep technical expertise and attention to detail',
    totalQuestions: 12,
    interviews: [
      { type: 'coding', count: 5, focus: 'Systems, Low-level, Performance' },
      { type: 'system_design', count: 4, focus: 'iCloud, App Store, iOS' },
      { type: 'behavioral', count: 3, focus: 'Collaboration & Excellence' },
    ],
    difficulty: 'hard',
    isPremium: true,
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    logo: '🪟',
    color: '#00a4ef',
    description: 'Growth mindset and technical depth',
    totalQuestions: 14,
    interviews: [
      { type: 'coding', count: 5, focus: 'Classic DSA, System Design' },
      { type: 'system_design', count: 5, focus: 'Azure, Teams, Office' },
      { type: 'behavioral', count: 4, focus: 'Growth Mindset' },
    ],
    difficulty: 'medium',
    isPremium: false,
  },
  {
    id: 'netflix',
    name: 'Netflix',
    logo: '🎬',
    color: '#e50914',
    description: 'Freedom and responsibility culture',
    totalQuestions: 10,
    interviews: [
      { type: 'coding', count: 3, focus: 'Streaming, Caching, Algorithms' },
      { type: 'system_design', count: 4, focus: 'Video Streaming, CDN, Recommendations' },
      { type: 'behavioral', count: 3, focus: 'Culture Fit & Candor' },
    ],
    difficulty: 'hard',
    isPremium: true,
  },
]

interface CompanyTracksProps {
  completedInterviews?: Record<string, number>
}

const TYPE_ICONS = {
  coding: Code2,
  system_design: Network,
  behavioral: MessageSquare,
}

export function CompanyTracks({ completedInterviews = {} }: CompanyTracksProps) {
  const router = useRouter()
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null)

  const handleStartTrack = (track: CompanyTrack, type: 'coding' | 'system_design' | 'behavioral') => {
    if (track.isPremium) {
      // TODO: Show upgrade modal
      return
    }
    // Navigate to interview start with company context
    router.push(`/interview/start?type=${type}&difficulty=${track.difficulty}&company=${track.id}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Company Interview Tracks</h3>
          <p className="text-sm text-white/50">Prepare for specific company interviews</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {COMPANY_TRACKS.map((track) => {
          const isSelected = selectedTrack === track.id
          const progress = completedInterviews[track.id] || 0
          const progressPercent = (progress / track.totalQuestions) * 100

          return (
            <div
              key={track.id}
              className={`relative bg-white/[0.03] border rounded-xl overflow-hidden transition-all cursor-pointer ${
                isSelected
                  ? 'border-white/20 bg-white/[0.05]'
                  : 'border-white/10 hover:border-white/15 hover:bg-white/[0.04]'
              }`}
              onClick={() => setSelectedTrack(isSelected ? null : track.id)}
            >
              {/* Premium Badge */}
              {track.isPremium && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 rounded-full">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] font-medium text-amber-400">PRO</span>
                </div>
              )}

              {/* Header */}
              <div className="p-4 pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${track.color}20` }}
                  >
                    {track.logo}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{track.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        track.difficulty === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {track.difficulty}
                      </span>
                      <span className="text-[11px] text-white/40">
                        {track.totalQuestions} questions
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  {track.description}
                </p>
              </div>

              {/* Progress Bar */}
              {progress > 0 && (
                <div className="px-4 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-white/40">Progress</span>
                    <span className="text-[10px] text-white/60">{progress}/{track.totalQuestions}</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progressPercent}%`,
                        backgroundColor: track.color,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Expanded Content */}
              {isSelected && (
                <div className="px-4 pb-4 pt-2 border-t border-white/[0.06] mt-2">
                  <div className="space-y-2">
                    {track.interviews.map((interview) => {
                      const Icon = TYPE_ICONS[interview.type]
                      return (
                        <button
                          key={interview.type}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStartTrack(track, interview.type)
                          }}
                          disabled={track.isPremium}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                            track.isPremium
                              ? 'bg-white/[0.02] opacity-50 cursor-not-allowed'
                              : 'bg-white/[0.03] hover:bg-white/[0.06]'
                          }`}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${track.color}15` }}
                          >
                            <Icon className="w-4 h-4" style={{ color: track.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-white capitalize">
                                {interview.type.replace('_', ' ')}
                              </span>
                              <span className="text-[10px] text-white/40">
                                {interview.count} questions
                              </span>
                            </div>
                            <p className="text-[10px] text-white/40 truncate">
                              {interview.focus}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/30" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Click to expand hint */}
              {!isSelected && (
                <div className="px-4 pb-3 pt-1">
                  <span className="text-[10px] text-white/30">Click to see interview types</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
