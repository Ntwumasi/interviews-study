import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import { Logo } from '@/components/logo'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Gradient orbs */}
      <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <nav className="relative z-10 container mx-auto px-6 py-6">
        <Link href="/">
          <Logo size={38} />
        </Link>
      </nav>

      {/* Sign up form */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 pb-20">
        <SignUp
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-white/5 border border-white/10 shadow-2xl backdrop-blur-sm',
              headerTitle: 'text-white',
              headerSubtitle: 'text-white/60',
              socialButtonsBlockButton: 'bg-white/10 border-white/10 text-white hover:bg-white/20',
              socialButtonsBlockButtonText: 'text-white',
              dividerLine: 'bg-white/10',
              dividerText: 'text-white/40',
              formFieldLabel: 'text-white/70',
              formFieldInput: 'bg-white/5 border-white/10 text-white placeholder:text-white/30',
              formButtonPrimary: 'bg-white text-black hover:bg-white/90',
              footerActionLink: 'text-emerald-400 hover:text-emerald-300',
              identityPreviewText: 'text-white',
              identityPreviewEditButton: 'text-emerald-400',
              formFieldInputShowPasswordButton: 'text-white/50',
              otpCodeFieldInput: 'bg-white/5 border-white/10 text-white',
              formResendCodeLink: 'text-emerald-400',
              alert: 'bg-red-500/10 border-red-500/20 text-red-400',
            },
          }}
          signInFallbackRedirectUrl="/dashboard"
          fallbackRedirectUrl="/dashboard"
        />
      </div>
    </div>
  )
}
