'use client'

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Home, BarChart3, Menu, X } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/history', label: 'History', icon: BarChart3 },
  ]

  const interviewTypes = [
    {
      href: '/interview/start?type=coding&difficulty=medium',
      label: 'Coding Interview',
      icon: '💻',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      href: '/interview/start?type=system_design&difficulty=medium',
      label: 'System Design',
      icon: '🏗️',
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      href: '/interview/start?type=behavioral&difficulty=medium',
      label: 'Behavioral',
      icon: '💬',
      color: 'text-green-600 dark:text-green-400'
    },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      {/* Navigation Header */}
      <header className="border-b border-gray-200 dark:border-white/10 bg-white/90 dark:bg-black/30 backdrop-blur-md sticky top-0 z-50 shadow-sm dark:shadow-none">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xs sm:text-sm">i.s</span>
              </div>
              <span className="text-gray-900 dark:text-white font-semibold text-base sm:text-lg hidden min-[400px]:inline">
                interviews.study
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive(item.href)
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Right Side - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-9 h-9',
                  },
                }}
              />
            </div>

            {/* Right Side - Mobile */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8',
                  },
                }}
              />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors ml-1"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-white/10">
              <nav className="flex flex-col gap-2">
                {/* Main Navigation */}
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive(item.href)
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}

                {/* Divider */}
                <div className="my-2 border-t border-gray-200 dark:border-white/10" />

                {/* Interview Type Section */}
                <div className="px-4 py-2">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Start New Interview
                  </p>
                </div>

                {/* Interview Types */}
                {interviewTypes.map((interview) => (
                  <Link
                    key={interview.href}
                    href={interview.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    <span className="text-xl">{interview.icon}</span>
                    <span className={`font-medium ${interview.color}`}>{interview.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-8 sm:pb-12">{children}</main>
    </div>
  )
}
