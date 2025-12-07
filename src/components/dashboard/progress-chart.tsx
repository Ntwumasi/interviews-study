'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Interview {
  id: string
  completed_at: string
  interview_type: string
  feedback: {
    overall_score: number
    technical_accuracy: number
    communication: number
    problem_solving: number
  }[] | null
}

interface ProgressChartProps {
  interviews: Interview[]
}

export function ProgressChart({ interviews }: ProgressChartProps) {
  const chartData = useMemo(() => {
    const sorted = [...interviews]
      .filter(i => i.feedback && i.feedback.length > 0)
      .sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime())

    return sorted.map((interview, index) => {
      const feedback = Array.isArray(interview.feedback)
        ? interview.feedback[0]
        : interview.feedback

      return {
        name: `#${index + 1}`,
        date: new Date(interview.completed_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        overall: feedback?.overall_score || 0,
        technical: feedback?.technical_accuracy || 0,
        communication: feedback?.communication || 0,
        problemSolving: feedback?.problem_solving || 0,
        type: interview.interview_type,
      }
    })
  }, [interviews])

  const trend = useMemo(() => {
    if (chartData.length < 2) return { direction: 'neutral', change: 0 }

    const recentCount = Math.min(3, Math.floor(chartData.length / 2))
    const recent = chartData.slice(-recentCount)
    const earlier = chartData.slice(0, recentCount)

    const recentAvg = recent.reduce((sum, d) => sum + d.overall, 0) / recent.length
    const earlierAvg = earlier.reduce((sum, d) => sum + d.overall, 0) / earlier.length
    const change = recentAvg - earlierAvg

    return {
      direction: change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'neutral',
      change: Math.abs(change).toFixed(1),
    }
  }, [chartData])

  const averages = useMemo(() => {
    if (chartData.length === 0) return null

    const sum = chartData.reduce(
      (acc, d) => ({
        overall: acc.overall + d.overall,
        technical: acc.technical + d.technical,
        communication: acc.communication + d.communication,
        problemSolving: acc.problemSolving + d.problemSolving,
      }),
      { overall: 0, technical: 0, communication: 0, problemSolving: 0 }
    )

    return {
      overall: (sum.overall / chartData.length).toFixed(1),
      technical: (sum.technical / chartData.length).toFixed(1),
      communication: (sum.communication / chartData.length).toFixed(1),
      problemSolving: (sum.problemSolving / chartData.length).toFixed(1),
    }
  }, [chartData])

  if (chartData.length === 0) {
    return null
  }

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Your Progress
          </h3>
          <p className="text-sm text-white/50">
            Performance over {chartData.length} interview{chartData.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Trend Indicator */}
        {chartData.length >= 2 && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
            trend.direction === 'up'
              ? 'bg-emerald-500/20 text-emerald-400'
              : trend.direction === 'down'
              ? 'bg-red-500/20 text-red-400'
              : 'bg-white/10 text-white/60'
          }`}>
            {trend.direction === 'up' && <TrendingUp className="w-4 h-4" />}
            {trend.direction === 'down' && <TrendingDown className="w-4 h-4" />}
            {trend.direction === 'neutral' && <Minus className="w-4 h-4" />}
            <span>
              {trend.direction === 'up' && '+'}
              {trend.direction === 'down' && '-'}
              {trend.change}
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
              ticks={[0, 2, 4, 6, 8, 10]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0a0a0a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
              labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}
              itemStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}
              formatter={(value: number, name: string) => [
                `${value}/10`,
                name === 'overall' ? 'Overall' :
                name === 'technical' ? 'Technical' :
                name === 'communication' ? 'Communication' :
                'Problem Solving'
              ]}
            />
            <Legend
              wrapperStyle={{ paddingTop: 16 }}
              formatter={(value) => (
                <span className="text-xs text-white/40">
                  {value === 'overall' ? 'Overall' :
                   value === 'technical' ? 'Technical' :
                   value === 'communication' ? 'Communication' :
                   'Problem Solving'}
                </span>
              )}
            />
            <Line
              type="monotone"
              dataKey="overall"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: '#10b981' }}
            />
            <Line
              type="monotone"
              dataKey="technical"
              stroke="#3b82f6"
              strokeWidth={1.5}
              dot={{ fill: '#3b82f6', strokeWidth: 0, r: 3 }}
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="communication"
              stroke="#8b5cf6"
              strokeWidth={1.5}
              dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 3 }}
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="problemSolving"
              stroke="#f59e0b"
              strokeWidth={1.5}
              dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Averages */}
      {averages && (
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{averages.overall}</div>
            <div className="text-xs text-white/40">Overall</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{averages.technical}</div>
            <div className="text-xs text-white/40">Technical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-violet-400">{averages.communication}</div>
            <div className="text-xs text-white/40">Communication</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">{averages.problemSolving}</div>
            <div className="text-xs text-white/40">Problem Solving</div>
          </div>
        </div>
      )}
    </div>
  )
}
