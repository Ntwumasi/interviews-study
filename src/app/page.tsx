import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play, Star } from 'lucide-react'
import { NewsletterSignup } from '@/components/landing/newsletter-signup'
import { AnimatedGridBackground } from '@/components/landing/animated-grid-background'
import { Logo } from '@/components/logo'

// Company logos component - shows where engineers practice for
function CompanyLogos() {
  const companies = [
    { name: 'Google', logo: 'G' },
    { name: 'Meta', logo: 'M' },
    { name: 'Apple', logo: '' },
    { name: 'Amazon', logo: 'A' },
    { name: 'Netflix', logo: 'N' },
    { name: 'Stripe', logo: 'S' },
  ]

  return (
    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-40">
      {companies.map((company) => (
        <div
          key={company.name}
          className="text-white/80 font-semibold text-lg md:text-xl tracking-tight"
        >
          {company.name}
        </div>
      ))}
    </div>
  )
}

// Stats section
function StatsSection() {
  const stats = [
    { value: '10,000+', label: 'Mock interviews completed' },
    { value: '47%', label: 'Got offers within 90 days' },
    { value: '4.9/5', label: 'Average rating' },
  ]

  return (
    <section className="border-y border-white/10 bg-black/80 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-white/50 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Testimonials section
function TestimonialsSection() {
  const testimonials = [
    {
      quote: "After 5 sessions, I finally understood what I was doing wrong in system design. Got an offer from Google the next month.",
      author: "Sarah Chen",
      role: "Staff Engineer at Google",
      avatar: "SC",
    },
    {
      quote: "The AI interviewer asks better follow-up questions than most human interviewers I've had. Incredibly realistic.",
      author: "Marcus Johnson",
      role: "Senior SWE at Meta",
      avatar: "MJ",
    },
    {
      quote: "I was mass-applying and getting rejected. This helped me see exactly where I was weak. Now at Stripe.",
      author: "Priya Patel",
      role: "Software Engineer at Stripe",
      avatar: "PP",
    },
  ]

  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Engineers trust us with their careers
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Join thousands who&apos;ve leveled up their interview skills
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <blockquote className="text-white/80 text-base md:text-lg leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="text-white font-medium text-sm">
                    {testimonial.author}
                  </div>
                  <div className="text-white/40 text-sm">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Interview types section
function InterviewTypesSection() {
  const types = [
    {
      title: 'Coding',
      duration: '60 min',
      description: 'Solve algorithmic problems with real-time code execution. Get feedback on complexity, edge cases, and communication.',
      features: ['5 languages supported', 'Live code execution', 'Complexity analysis'],
      gradient: 'from-blue-500 to-blue-600',
      accent: 'blue',
    },
    {
      title: 'System Design',
      duration: '45 min',
      description: 'Design scalable architectures on an interactive whiteboard. Practice the interview that separates seniors from staff.',
      features: ['Interactive diagrams', 'Scalability deep-dives', 'Trade-off discussions'],
      gradient: 'from-violet-500 to-purple-600',
      accent: 'violet',
    },
    {
      title: 'Behavioral',
      duration: '30 min',
      description: 'Master the STAR framework with AI-powered conversation practice. Get feedback on clarity, impact, and storytelling.',
      features: ['STAR framework', 'Leadership scenarios', 'Communication coaching'],
      gradient: 'from-emerald-500 to-emerald-600',
      accent: 'emerald',
    },
  ]

  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Three interviews. One platform.
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Practice every type of technical interview with realistic AI simulations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {types.map((type, index) => (
            <div
              key={index}
              className="group relative bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300"
            >
              {/* Gradient accent line */}
              <div className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r ${type.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  {type.title}
                </h3>
                <span className="text-white/40 text-sm font-medium">
                  {type.duration}
                </span>
              </div>

              <p className="text-white/60 text-sm md:text-base leading-relaxed mb-6">
                {type.description}
              </p>

              <ul className="space-y-2">
                {type.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-white/50 text-sm">
                    <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${type.gradient}`} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// How it works section
function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Choose your interview',
      description: 'Select from coding, system design, or behavioral. Pick your difficulty level.',
    },
    {
      number: '02',
      title: 'Practice with AI',
      description: 'Our AI interviewer asks follow-up questions and probes your thinking—just like a real interview.',
    },
    {
      number: '03',
      title: 'Get detailed feedback',
      description: 'Receive comprehensive analysis with scores, specific improvements, and resources to study.',
    },
  ]

  return (
    <section className="py-24 md:py-32 border-y border-white/10 bg-black/80 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Simple. Effective. Repeatable.
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Practice makes permanent. Here&apos;s how it works.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="text-center md:text-left">
                <div className="text-5xl md:text-6xl font-bold text-white/10 mb-4 tracking-tighter">
                  {step.number}
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-white/50 text-sm md:text-base leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Product preview section
function ProductPreviewSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            See it in action
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            A realistic interview experience, powered by AI
          </p>
        </div>

        {/* Product mockup */}
        <div className="relative max-w-5xl mx-auto">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-violet-500/20 blur-3xl opacity-30" />

          {/* Browser frame */}
          <div className="relative bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            {/* Browser header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <div className="w-3 h-3 rounded-full bg-white/20" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 bg-white/5 rounded-md text-white/40 text-xs">
                  interviews.study/interview
                </div>
              </div>
            </div>

            {/* Interview UI mockup */}
            <div className="aspect-video bg-[#0A0A0A] p-6 md:p-8">
              <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Code editor */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-white/40 text-xs font-mono">solution.py</span>
                  </div>
                  <div className="font-mono text-sm space-y-1">
                    <div><span className="text-violet-400">def</span> <span className="text-blue-400">two_sum</span><span className="text-white/60">(nums, target):</span></div>
                    <div className="text-white/40 pl-4">seen = {'{}'}</div>
                    <div className="text-white/40 pl-4"><span className="text-violet-400">for</span> i, num <span className="text-violet-400">in</span> enumerate(nums):</div>
                    <div className="text-white/40 pl-8">complement = target - num</div>
                    <div className="text-white/40 pl-8"><span className="text-violet-400">if</span> complement <span className="text-violet-400">in</span> seen:</div>
                    <div className="text-white/40 pl-12"><span className="text-violet-400">return</span> [seen[complement], i]</div>
                    <div className="text-emerald-400 pl-8">|</div>
                  </div>
                </div>

                {/* Right: Chat */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                    <span className="text-white/60 text-sm">AI Interviewer</span>
                  </div>
                  <div className="flex-1 space-y-3 text-sm">
                    <div className="bg-white/5 rounded-lg p-3 text-white/70">
                      Good start! What&apos;s the time complexity of your current approach?
                    </div>
                    <div className="bg-emerald-500/10 rounded-lg p-3 text-emerald-300/80 ml-8">
                      O(n) time and O(n) space because we iterate once and use a hash map.
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-white/70">
                      Correct. Now, what happens if there are duplicate values in the array?
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Watch demo button */}
        <div className="text-center mt-8">
          <button className="inline-flex items-center gap-2 px-6 py-3 text-white/60 hover:text-white transition-colors text-sm font-medium">
            <Play className="w-4 h-4" />
            Watch a 2-minute demo
          </button>
        </div>
      </div>
    </section>
  )
}

// Pricing section
function PricingSection() {
  const features = [
    'Unlimited mock interviews',
    'All company interview tracks',
    'Coding, System Design & Behavioral',
    'Real-time AI feedback',
    'Video recording & playback',
    'Job-specific roadmap generator',
    'Priority support',
  ]

  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Start free, upgrade when you&apos;re ready to go all-in
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          {/* Pricing card */}
          <div className="relative bg-gradient-to-b from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl p-8 md:p-10">
            {/* Popular badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full text-white text-sm font-semibold shadow-lg">
                Start with 3-day free trial
              </div>
            </div>

            <div className="text-center mb-8 pt-4">
              <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl md:text-6xl font-bold text-white">$19.99</span>
                <span className="text-white/50 text-lg">/month</span>
              </div>
              <p className="text-white/40 text-sm mt-2">
                Cancel anytime. No questions asked.
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white/70">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-base py-6 h-auto font-semibold rounded-xl"
              asChild
            >
              <Link href="/sign-up">
                Start 3-Day Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>

            <p className="text-center text-white/30 text-xs mt-4">
              No credit card required to start. You&apos;ll only be charged after your trial ends.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// Final CTA section
function FinalCTASection() {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Your next offer is one<br />practice away.
          </h2>
          <p className="text-white/50 text-lg md:text-xl mb-10 max-w-xl mx-auto">
            Join 10,000+ engineers who&apos;ve transformed their interview performance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-white/90 text-base px-8 py-6 h-auto font-semibold rounded-full"
              asChild
            >
              <Link href="/sign-up">
                Start practicing free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <span className="text-white/30 text-sm">
              No credit card required
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black relative">
      {/* Animated grid background - fixed to viewport */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <AnimatedGridBackground />
        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
          aria-hidden="true"
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 container mx-auto px-6 py-6" role="navigation" aria-label="Main navigation">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Logo size={38} />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/sign-in" className="text-white/60 hover:text-white text-sm font-medium transition-colors">
              Sign in
            </Link>
            <Button
              className="bg-white text-black hover:bg-white/90 text-sm font-semibold rounded-full px-5"
              asChild
            >
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 container mx-auto px-6 pt-20 pb-24 md:pt-32 md:pb-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-white/60 text-sm font-medium">Trusted by engineers at top companies</span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight leading-[0.95]">
            Practice interviews.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
              Land offers.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed">
            AI-powered mock interviews for coding, system design, and behavioral.
            Get real feedback. Build real confidence.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-white/90 text-base px-8 py-6 h-auto font-semibold rounded-full"
              asChild
            >
              <Link href="/sign-up">
                Start practicing free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 text-white/40 text-sm">
            <span>3 free interviews</span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span>No credit card</span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </header>

      {/* Company logos */}
      <section className="relative z-10 container mx-auto px-6 pb-24">
        <p className="text-center text-white/30 text-sm mb-8 uppercase tracking-wider font-medium">
          Engineers preparing for
        </p>
        <CompanyLogos />
      </section>

      {/* Content sections */}
      <div className="relative z-10">
        {/* Stats */}
        <StatsSection />

        {/* Interview types */}
        <InterviewTypesSection />

        {/* Product preview */}
        <ProductPreviewSection />

        {/* How it works */}
        <HowItWorksSection />

        {/* Testimonials */}
        <TestimonialsSection />

        {/* Pricing */}
        <div className="border-t border-white/10">
          <PricingSection />
        </div>

        {/* Newsletter */}
        <div className="border-t border-white/10">
          <NewsletterSignup />
        </div>

        {/* Final CTA */}
        <div className="border-t border-white/10">
          <FinalCTASection />
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10">
        <div className="container mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2">
              <Link href="/">
                <Logo size={38} />
              </Link>
              <p className="text-white/40 text-sm mt-3 max-w-xs">
                AI-powered mock interviews for software engineers. Practice smarter. Interview better.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/sign-up" className="text-white/40 hover:text-white text-sm transition-colors">
                    Get started
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-white/40 hover:text-white text-sm transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://kodedit.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/40 hover:text-white text-sm transition-colors"
                  >
                    Kodedit LLC
                  </a>
                </li>
                <li>
                  <Link href="/contact" className="text-white/40 hover:text-white text-sm transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/terms" className="text-white/40 hover:text-white text-sm transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-white/40 hover:text-white text-sm transition-colors">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-sm">
              &copy; {new Date().getFullYear()} Kodedit LLC. All rights reserved.
            </p>
            <a
              href="https://twitter.com/interviewsstudy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-white text-sm transition-colors"
            >
              Twitter
            </a>
          </div>
        </div>
      </footer>
      </div>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                '@id': 'https://interviews.study/#organization',
                name: 'Kodedit LLC',
                url: 'https://kodedit.io',
                logo: 'https://interviews.study/logo.png',
                sameAs: [
                  'https://twitter.com/interviewsstudy',
                ],
              },
              {
                '@type': 'WebSite',
                '@id': 'https://interviews.study/#website',
                url: 'https://interviews.study',
                name: 'interviews.study',
                description: 'AI-powered mock interview platform for software engineers',
                publisher: {
                  '@id': 'https://interviews.study/#organization',
                },
              },
              {
                '@type': 'WebApplication',
                '@id': 'https://interviews.study/#webapp',
                name: 'interviews.study',
                applicationCategory: 'EducationalApplication',
                operatingSystem: 'Web Browser',
                description: 'AI-powered mock interview platform for coding, system design, and behavioral interviews. Practice with realistic simulations and get detailed feedback to land senior engineering roles at top tech companies.',
                url: 'https://interviews.study',
                provider: {
                  '@id': 'https://interviews.study/#organization',
                },
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
                  description: 'Free interviews to get started',
                },
              },
            ],
          }),
        }}
      />
    </div>
  )
}
