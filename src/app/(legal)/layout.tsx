import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </Link>
          <Link href="/" className="text-lg sm:text-xl font-bold text-white hover:text-gray-200 transition-colors">
            interviews.study
          </Link>
        </div>
      </nav>
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
      <footer className="border-t border-white/10 mt-12">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <p className="text-gray-500 text-sm text-center">
            &copy; {new Date().getFullYear()} Kodedit LLC. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
