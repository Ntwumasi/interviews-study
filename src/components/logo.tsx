'use client'

import { Bot } from 'lucide-react'

interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 38, className = '' }: LogoProps) {
  return (
    <div className={`group relative ${className}`} style={{ width: size, height: size }}>
      {/* Main icon container - fades out on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-500 ease-out group-hover:opacity-0 group-hover:scale-95 flex items-center justify-center">
        {/* Bot icon - bounces then fades out with container */}
        <Bot
          className="text-white transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:translate-y-0.5"
          style={{ width: size * 0.5, height: size * 0.5 }}
        />
      </div>

      {/* Thinking dots - emerge as the container fades */}
      <div
        className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:delay-100"
      >
        <span
          className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-[pulse-dot_1.4s_ease-in-out_infinite] shadow-sm shadow-emerald-500/50"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-[pulse-dot_1.4s_ease-in-out_infinite] shadow-sm shadow-emerald-500/50"
          style={{ animationDelay: '200ms' }}
        />
        <span
          className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-[pulse-dot_1.4s_ease-in-out_infinite] shadow-sm shadow-emerald-500/50"
          style={{ animationDelay: '400ms' }}
        />
      </div>

      {/* Custom keyframes */}
      <style jsx>{`
        @keyframes pulse-dot {
          0%, 100% {
            transform: scale(1) translateY(0);
            opacity: 0.85;
          }
          50% {
            transform: scale(1.35) translateY(-4px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

// Simplified icon-only version for smaller uses
export function LogoIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`p-1.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg ${className}`}>
      <Bot className="text-white" style={{ width: size * 0.55, height: size * 0.55 }} />
    </div>
  )
}
