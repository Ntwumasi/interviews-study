import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Brain, MessageSquare, Target, Twitter, Github, Code2, Network, CheckCircle2, Clock, Camera, Timer, Bot, BarChart3 } from 'lucide-react'
import { NewsletterSignup } from '@/components/landing/newsletter-signup'
import { TypingText } from '@/components/landing/typing-text'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="container mx-auto px-4 sm:px-6 py-4 sm:py-5 md:py-6" role="navigation" aria-label="Main navigation">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg sm:text-xl md:text-2xl font-bold text-white hover:text-gray-200 transition-colors">
            interviews.study
          </Link>
          <div className="flex gap-2 sm:gap-3 md:gap-4">
            <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10 text-sm sm:text-base px-3 sm:px-4" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button className="bg-white text-blue-900 hover:bg-gray-100 text-sm sm:text-base px-3 sm:px-4" asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-white mb-4 sm:mb-6 leading-tight tracking-tight">
            Ace Your Next{' '}
            <TypingText
              text="Tech Interview"
              className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400"
              delay={300}
              speed={80}
            />
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4">
            Practice coding, system design, and behavioral interviews with AI.
            Get real-time feedback. Land your dream role.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Button
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white text-base sm:text-lg md:text-xl px-6 sm:px-8 md:px-10 py-5 sm:py-6 md:py-7 h-auto shadow-xl hover:shadow-2xl transition-all hover:scale-105 w-full sm:w-auto max-w-sm"
              asChild
            >
              <Link href="/sign-up">Start Practicing Free</Link>
            </Button>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-gray-400 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>No credit card required</span>
              </div>
              <span className="hidden sm:inline text-gray-600">•</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>First 3 interviews free</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Interview Types Section */}
      <section className="container mx-auto px-4 sm:px-6 pb-12 sm:pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-3 sm:mb-4">
            Master Every Interview Format
          </h2>
          <p className="text-gray-400 text-center mb-8 sm:mb-12 text-sm sm:text-base md:text-lg px-4">
            Practice the three critical types of technical interviews
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Coding Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-white/10 hover:border-green-500/50 transition-all hover:scale-105 group">
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <div className="bg-green-500/10 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl group-hover:bg-green-500/20 transition-colors">
                  <Code2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-400" />
                </div>
                <span className="bg-green-500/20 text-green-300 text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full">
                  Available
                </span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">
                💻 Coding Interview
              </h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-3 sm:mb-4">
                Solve problems while explaining your approach. Get feedback on code quality,
                time complexity, and communication.
              </p>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                  <span>Real-time code execution</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                  <span>AI interviewer feedback</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                  <span>60-minute timed sessions</span>
                </li>
              </ul>
            </div>

            {/* System Design Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-white/10 hover:border-blue-500/50 transition-all hover:scale-105 group">
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <div className="bg-blue-500/10 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl group-hover:bg-blue-500/20 transition-colors">
                  <Network className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-400" />
                </div>
                <span className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full">
                  Available
                </span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">
                🏗️ System Design
              </h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-3 sm:mb-4">
                Design scalable systems. Practice with real scenarios from FAANG interviews.
                Master architecture discussions.
              </p>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                  <span>Interactive diagram canvas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                  <span>Scalability deep-dives</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                  <span>45-minute timed sessions</span>
                </li>
              </ul>
            </div>

            {/* Behavioral Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-white/10 hover:border-purple-500/50 transition-all hover:scale-105 group">
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <div className="bg-purple-500/10 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl group-hover:bg-purple-500/20 transition-colors">
                  <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-400" />
                </div>
                <span className="bg-purple-500/20 text-purple-300 text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full">
                  Available
                </span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">
                💬 Behavioral
              </h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-3 sm:mb-4">
                Answer STAR-format questions. Get feedback on storytelling, clarity, and impact.
                Prepare for culture fit questions.
              </p>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                  <span>STAR framework guidance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                  <span>Communication feedback</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                  <span>30-minute timed sessions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-3 sm:mb-4 md:mb-6">
            How It Works
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 text-center mb-10 sm:mb-12 md:mb-16 px-4">
            Four simple steps to level up your interview skills
          </p>

          {/* Timeline Steps */}
          <div className="relative">
            {/* Vertical connecting line */}
            <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-blue-500 to-purple-500 hidden md:block" />

            <div className="space-y-8 sm:space-y-10 md:space-y-12">
              {/* Step 1: Turn on Camera */}
              <div className="relative flex flex-col md:flex-row gap-4 sm:gap-5 md:gap-6 items-start group">
                <div className="flex-shrink-0 relative z-10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-white text-green-600 flex items-center justify-center font-bold text-xs sm:text-sm shadow-lg">
                    1
                  </div>
                </div>
                <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-white/10 hover:border-green-500/50 transition-all">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1.5 sm:mb-2">
                    Turn on your camera
                  </h3>
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                    Simulate real interview pressure. Practice like you&apos;re on a video call.
                  </p>
                </div>
              </div>

              {/* Step 2: Start the Timer */}
              <div className="relative flex flex-col md:flex-row gap-4 sm:gap-5 md:gap-6 items-start group">
                <div className="flex-shrink-0 relative z-10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Timer className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-xs sm:text-sm shadow-lg">
                    2
                  </div>
                </div>
                <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-white/10 hover:border-blue-500/50 transition-all">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1.5 sm:mb-2">
                    Start the timer
                  </h3>
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                    60 minutes for coding, 45 for system design, 30 for behavioral. Just like the real thing.
                  </p>
                </div>
              </div>

              {/* Step 3: Interview with AI */}
              <div className="relative flex flex-col md:flex-row gap-4 sm:gap-5 md:gap-6 items-start group">
                <div className="flex-shrink-0 relative z-10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Bot className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-white text-purple-600 flex items-center justify-center font-bold text-xs sm:text-sm shadow-lg">
                    3
                  </div>
                </div>
                <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-white/10 hover:border-purple-500/50 transition-all">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1.5 sm:mb-2">
                    Interview with AI
                  </h3>
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                    Our AI interviewer asks follow-up questions and probes your thinking.
                  </p>
                </div>
              </div>

              {/* Step 4: Get Detailed Feedback */}
              <div className="relative flex flex-col md:flex-row gap-4 sm:gap-5 md:gap-6 items-start group">
                <div className="flex-shrink-0 relative z-10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-white text-orange-600 flex items-center justify-center font-bold text-xs sm:text-sm shadow-lg">
                    4
                  </div>
                </div>
                <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-white/10 hover:border-orange-500/50 transition-all">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1.5 sm:mb-2">
                    Get detailed feedback
                  </h3>
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                    Receive a comprehensive breakdown of your performance with actionable improvements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <main>
        <section id="features" className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20" aria-labelledby="features-heading">
          <div className="max-w-6xl mx-auto">
            <h2 id="features-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-8 sm:mb-12 md:mb-16">
              Why Engineers Love Us
            </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 sm:p-6 md:p-8 hover:bg-white/15 transition-all hover:scale-105 cursor-pointer border border-white/10">
              <div className="bg-blue-500 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center mb-4 sm:mb-5 md:mb-6">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3 md:mb-4">
                Realistic Interview Simulations
              </h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                Practice with AI interviewers that ask real system design questions.
                45-minute sessions with live diagramming, just like the real thing.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 sm:p-6 md:p-8 hover:bg-white/15 transition-all hover:scale-105 cursor-pointer border border-white/10">
              <div className="bg-green-500 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center mb-4 sm:mb-5 md:mb-6">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3 md:mb-4">
                AI-Powered Feedback
              </h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                Get detailed, actionable feedback after every interview.
                Know exactly what to improve and how to improve it.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 sm:p-6 md:p-8 hover:bg-white/15 transition-all hover:scale-105 cursor-pointer border border-white/10">
              <div className="bg-purple-500 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center mb-4 sm:mb-5 md:mb-6">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3 md:mb-4">
                System Design Focus
              </h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                Master the hardest part of senior engineering interviews.
                Practice designing Twitter, Netflix, URL shorteners, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20" aria-label="Call to action">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-5 md:mb-6 px-4">
            Ready to ace your next interview?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-7 md:mb-8 px-4">
            Join engineers preparing for senior roles at top tech companies.
          </p>
          <Button
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto w-full sm:w-auto max-w-sm"
            asChild
          >
            <Link href="/sign-up">Start Practicing Now</Link>
          </Button>
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterSignup />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12 sm:mt-16 md:mt-20">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="text-center md:text-left">
              <div className="text-white font-bold text-lg sm:text-xl mb-1 sm:mb-2">
                interviews.study
              </div>
              <p className="text-gray-400 text-xs sm:text-sm">
                Built by{' '}
                <a
                  href="https://kodedit.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 transition-colors underline"
                >
                  kodedit.io
                </a>
              </p>
            </div>
            <div className="flex gap-4 sm:gap-6">
              <a
                href="https://twitter.com/interviewsstudy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="View our GitHub"
              >
                <Github className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="sr-only">GitHub</span>
              </a>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm text-center md:text-right">
              © 2025 interviews.study. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'interviews.study',
            applicationCategory: 'EducationalApplication',
            description:
              'AI-powered mock interview platform for system design interviews. Practice with realistic simulations and get detailed feedback to land senior engineering roles at top tech companies.',
            url: 'https://interviews.study',
            creator: {
              '@type': 'Organization',
              name: 'kodedit.io',
              url: 'https://kodedit.io',
            },
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '5',
              ratingCount: '1',
            },
          }),
        }}
      />
    </div>
  )
}
