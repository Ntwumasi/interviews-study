'use client'

import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Clock,
  Award,
  Code2,
  Network,
  MessageSquare,
  Flame,
  Calendar,
  ChevronRight,
} from 'lucide-react'

interface Interview {
  id: string
  completed_at: string
  interview_type: 'coding' | 'system_design' | 'behavioral'
  duration_seconds: number | null
  scenario: {
    title: string
    difficulty: string
  } | null
  feedback: {
    overall_score: number
    technical_accuracy: number
    communication: number
    problem_solving: number
  }[] | null
}

interface ProgressDashboardProps {
  interviews: Interview[]
}

const TYPE_CONFIG = {
  coding: { icon: Code2, color: '#3b82f6', label: 'Coding' },
  system_design: { icon: Network, color: '#8b5cf6', label: 'System Design' },
  behavioral: { icon: MessageSquare, color: '#10b981', label: 'Behavioral' },
}

export function ProgressDashboard({ interviews }: ProgressDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'history'>('overview')

  // Filter interviews with feedback
  const interviewsWithFeedback = useMemo(() =>
    interviews.filter(i => i.feedback && i.feedback.length > 0),
    [interviews]
  )

  // Calculate overall stats
  const stats = useMemo(() => {
    if (interviewsWithFeedback.length === 0) return null

    const totalInterviews = interviewsWithFeedback.length
    const totalTime = interviewsWithFeedback.reduce((sum, i) => sum + (i.duration_seconds || 0), 0)

    const scores = interviewsWithFeedback.map(i => {
      const feedback = Array.isArray(i.feedback) ? i.feedback[0] : i.feedback
      return feedback?.overall_score || 0
    })

    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
    const bestScore = Math.max(...scores)

    // Calculate streak (consecutive days with interviews)
    const dates = interviewsWithFeedback.map(i =>
      new Date(i.completed_at).toDateString()
    )
    const uniqueDates = [...new Set(dates)].sort()
    let streak = 0
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
      streak = 1
      for (let i = uniqueDates.length - 2; i >= 0; i--) {
        const curr = new Date(uniqueDates[i + 1])
        const prev = new Date(uniqueDates[i])
        const diff = (curr.getTime() - prev.getTime()) / 86400000
        if (diff === 1) streak++
        else break
      }
    }

    return {
      totalInterviews,
      totalTime: Math.round(totalTime / 60), // minutes
      avgScore: avgScore.toFixed(1),
      bestScore,
      streak,
    }
  }, [interviewsWithFeedback])

  // Calculate by type breakdown
  const typeBreakdown = useMemo(() => {
    const breakdown: Record<string, { count: number; avgScore: number }> = {}

    interviewsWithFeedback.forEach(interview => {
      const type = interview.interview_type
      const feedback = Array.isArray(interview.feedback) ? interview.feedback[0] : interview.feedback
      const score = feedback?.overall_score || 0

      if (!breakdown[type]) {
        breakdown[type] = { count: 0, avgScore: 0 }
      }
      breakdown[type].count++
      breakdown[type].avgScore += score
    })

    Object.keys(breakdown).forEach(type => {
      breakdown[type].avgScore = breakdown[type].avgScore / breakdown[type].count
    })

    return breakdown
  }, [interviewsWithFeedback])

  // Calculate skill radar data
  const skillRadarData = useMemo(() => {
    if (interviewsWithFeedback.length === 0) return []

    const totals = { technical: 0, communication: 0, problemSolving: 0 }

    interviewsWithFeedback.forEach(interview => {
      const feedback = Array.isArray(interview.feedback) ? interview.feedback[0] : interview.feedback
      if (feedback) {
        totals.technical += feedback.technical_accuracy || 0
        totals.communication += feedback.communication || 0
        totals.problemSolving += feedback.problem_solving || 0
      }
    })

    const count = interviewsWithFeedback.length
    return [
      { skill: 'Technical', value: totals.technical / count, fullMark: 10 },
      { skill: 'Communication', value: totals.communication / count, fullMark: 10 },
      { skill: 'Problem Solving', value: totals.problemSolving / count, fullMark: 10 },
    ]
  }, [interviewsWithFeedback])

  // Calculate trend
  const trend = useMemo(() => {
    if (interviewsWithFeedback.length < 2) return { direction: 'neutral', change: 0 }

    const sorted = [...interviewsWithFeedback].sort(
      (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
    )

    const recentCount = Math.min(3, Math.floor(sorted.length / 2))
    const recent = sorted.slice(-recentCount)
    const earlier = sorted.slice(0, recentCount)

    const getAvgScore = (arr: Interview[]) =>
      arr.reduce((sum, i) => {
        const feedback = Array.isArray(i.feedback) ? i.feedback[0] : i.feedback
        return sum + (feedback?.overall_score || 0)
      }, 0) / arr.length

    const recentAvg = getAvgScore(recent)
    const earlierAvg = getAvgScore(earlier)
    const change = recentAvg - earlierAvg

    return {
      direction: change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'neutral',
      change: Math.abs(change).toFixed(1),
    }
  }, [interviewsWithFeedback])

  // Timeline chart data
  const timelineData = useMemo(() => {
    return [...interviewsWithFeedback]
      .sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime())
      .slice(-10)
      .map((interview, index) => {
        const feedback = Array.isArray(interview.feedback) ? interview.feedback[0] : interview.feedback
        return {
          name: `#${index + 1}`,
          date: new Date(interview.completed_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          }),
          score: feedback?.overall_score || 0,
          type: interview.interview_type,
        }
      })
  }, [interviewsWithFeedback])

  // Weakness analysis
  const weaknesses = useMemo(() => {
    if (interviewsWithFeedback.length === 0) return []

    const skills: Record<string, number[]> = {
      technical: [],
      communication: [],
      problemSolving: [],
    }

    interviewsWithFeedback.forEach(interview => {
      const feedback = Array.isArray(interview.feedback) ? interview.feedback[0] : interview.feedback
      if (feedback) {
        skills.technical.push(feedback.technical_accuracy || 0)
        skills.communication.push(feedback.communication || 0)
        skills.problemSolving.push(feedback.problem_solving || 0)
      }
    })

    const avgSkills = Object.entries(skills).map(([skill, scores]) => ({
      skill,
      avg: scores.reduce((a, b) => a + b, 0) / scores.length,
      label: skill === 'technical' ? 'Technical Accuracy' :
             skill === 'communication' ? 'Communication' : 'Problem Solving',
    }))

    return avgSkills.sort((a, b) => a.avg - b.avg).slice(0, 2)
  }, [interviewsWithFeedback])

  if (interviewsWithFeedback.length === 0) {
    return (
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center">
          <Target className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Start Your Journey
        </h3>
        <p className="text-white/50 text-sm max-w-md mx-auto">
          Complete your first practice interview to unlock detailed progress tracking,
          skill analysis, and personalized improvement recommendations.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-white/40 uppercase tracking-wider">Avg Score</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-white">{stats?.avgScore}</span>
            <span className="text-sm text-white/40 mb-0.5">/10</span>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-white/40 uppercase tracking-wider">Best</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-white">{stats?.bestScore}</span>
            <span className="text-sm text-white/40 mb-0.5">/10</span>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-white/40 uppercase tracking-wider">Interviews</span>
          </div>
          <span className="text-2xl font-bold text-white">{stats?.totalInterviews}</span>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-white/40 uppercase tracking-wider">Time</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-white">{stats?.totalTime}</span>
            <span className="text-sm text-white/40 mb-0.5">min</span>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-white/40 uppercase tracking-wider">Streak</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-white">{stats?.streak || 0}</span>
            <span className="text-sm text-white/40 mb-0.5">days</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-white/10 px-6 pt-4">
          <div className="flex gap-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'skills', label: 'Skills' },
              { id: 'history', label: 'History' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-white'
                    : 'border-transparent text-white/40 hover:text-white/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Progress Chart */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-white">Score Trend</h4>
                  {trend.direction !== 'neutral' && (
                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                      trend.direction === 'up'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {trend.direction === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {trend.direction === 'up' ? '+' : '-'}{trend.change}
                    </div>
                  )}
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 10]}
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        tickLine={false}
                        ticks={[0, 5, 10]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0a0a0a',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Type Distribution */}
              <div>
                <h4 className="text-sm font-medium text-white mb-4">By Interview Type</h4>
                <div className="space-y-3">
                  {Object.entries(typeBreakdown).map(([type, data]) => {
                    const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG]
                    const Icon = config?.icon || Code2
                    return (
                      <div key={type} className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${config?.color}20` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: config?.color }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-white">{config?.label}</span>
                            <span className="text-xs text-white/40">{data.count} interviews</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${(data.avgScore / 10) * 100}%`,
                                backgroundColor: config?.color,
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium text-white w-8 text-right">
                          {data.avgScore.toFixed(1)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Skill Radar */}
              <div>
                <h4 className="text-sm font-medium text-white mb-4">Skill Breakdown</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={skillRadarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis
                        dataKey="skill"
                        tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                      />
                      <PolarRadiusAxis
                        domain={[0, 10]}
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                        axisLine={false}
                      />
                      <Radar
                        name="Score"
                        dataKey="value"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Areas to Improve */}
              <div>
                <h4 className="text-sm font-medium text-white mb-4">Focus Areas</h4>
                <div className="space-y-4">
                  {weaknesses.map((weakness, index) => (
                    <div
                      key={weakness.skill}
                      className="bg-white/[0.03] border border-white/10 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          index === 0 ? 'bg-red-500/20' : 'bg-amber-500/20'
                        }`}>
                          <Target className={`w-4 h-4 ${
                            index === 0 ? 'text-red-400' : 'text-amber-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">{weakness.label}</span>
                            <span className={`text-sm font-medium ${
                              weakness.avg < 5 ? 'text-red-400' : 'text-amber-400'
                            }`}>
                              {weakness.avg.toFixed(1)}/10
                            </span>
                          </div>
                          <p className="text-xs text-white/50">
                            {weakness.skill === 'technical'
                              ? 'Practice more coding problems and review core concepts'
                              : weakness.skill === 'communication'
                              ? 'Focus on explaining your thought process clearly'
                              : 'Work on breaking down problems systematically'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="text-center pt-2">
                    <button className="text-sm text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1">
                      View personalized study plan
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {interviewsWithFeedback.slice(0, 10).map((interview) => {
                const feedback = Array.isArray(interview.feedback) ? interview.feedback[0] : interview.feedback
                const config = TYPE_CONFIG[interview.interview_type]
                const Icon = config?.icon || Code2

                return (
                  <div
                    key={interview.id}
                    className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:bg-white/[0.04] transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${config?.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: config?.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-white truncate">
                          {interview.scenario?.title || config?.label}
                        </span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          interview.scenario?.difficulty === 'easy'
                            ? 'bg-green-500/20 text-green-400'
                            : interview.scenario?.difficulty === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {interview.scenario?.difficulty}
                        </span>
                      </div>
                      <span className="text-xs text-white/40">
                        {new Date(interview.completed_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        (feedback?.overall_score || 0) >= 7
                          ? 'text-emerald-400'
                          : (feedback?.overall_score || 0) >= 5
                          ? 'text-amber-400'
                          : 'text-red-400'
                      }`}>
                        {feedback?.overall_score || 0}/10
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
