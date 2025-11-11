'use client'

import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2, Mail } from 'lucide-react'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email) return

    setIsLoading(true)

    // Log the email for now (will connect to a service later)
    console.log('Newsletter signup email:', email)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    setIsSubmitted(true)
    setIsLoading(false)
    setEmail('')

    // Reset success message after 5 seconds
    setTimeout(() => {
      setIsSubmitted(false)
    }, 5000)
  }

  return (
    <section className="container mx-auto px-6 py-20">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-full mb-6">
            <Mail className="w-8 h-8 text-blue-400" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Get interview tips, new scenarios, and product updates delivered weekly.
          </p>

          {isSubmitted ? (
            <div className="flex items-center justify-center gap-3 text-green-400 bg-green-500/10 rounded-lg py-4 px-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Thanks for subscribing! Check your inbox.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20 h-12"
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 h-12 whitespace-nowrap"
              >
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          )}

          <p className="text-gray-500 text-sm mt-4">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  )
}
