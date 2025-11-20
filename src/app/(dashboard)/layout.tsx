import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Home, BarChart3 } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      {/* Navigation Header */}
      <header className="border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-sm">i.s</span>
              </div>
              <span className="text-gray-900 dark:text-white font-semibold text-lg">interviews.study</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Practice</span>
              </Link>
              <Link
                href="/dashboard/history"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>History</span>
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10',
                  },
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}
