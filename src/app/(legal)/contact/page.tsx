'use client'

import { useState, FormEvent } from 'react'
import { Metadata } from 'next'
import { Mail, MessageSquare, Clock, Send, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // For now, just log the form data
    // In production, you'd send this to an API endpoint
    console.log('Contact form submission:', formData)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitted(true)
    setIsSubmitting(false)
    setFormData({ name: '', email: '', subject: '', message: '' })

    // Reset after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000)
  }

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Contact Us</h1>
      <p className="text-gray-400 mb-8">Have a question or feedback? We&apos;d love to hear from you.</p>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="font-semibold text-white mb-2">Email</h3>
          <p className="text-gray-400 text-sm mb-3">For general inquiries</p>
          <a href="mailto:support@kodedit.io" className="text-blue-400 hover:text-blue-300 text-sm">
            support@kodedit.io
          </a>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
            <MessageSquare className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="font-semibold text-white mb-2">Feedback</h3>
          <p className="text-gray-400 text-sm mb-3">Help us improve</p>
          <a href="mailto:feedback@kodedit.io" className="text-green-400 hover:text-green-300 text-sm">
            feedback@kodedit.io
          </a>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="font-semibold text-white mb-2">Response Time</h3>
          <p className="text-gray-400 text-sm mb-3">We typically respond within</p>
          <span className="text-purple-400 text-sm">24-48 hours</span>
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-6 sm:p-8 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-6">Send us a message</h2>

        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Message Sent!</h3>
            <p className="text-gray-400">We&apos;ll get back to you as soon as possible.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-400"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                Subject
              </label>
              <Input
                id="subject"
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-400"
                placeholder="How can we help?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder:text-gray-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/50 resize-none"
                placeholder="Tell us more about your question or feedback..."
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-8"
            >
              {isSubmitting ? (
                'Sending...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        )}
      </div>

      <div className="mt-12 p-6 bg-white/5 rounded-xl border border-white/10">
        <h3 className="font-semibold text-white mb-4">Company Information</h3>
        <div className="text-gray-300 space-y-2">
          <p><strong className="text-white">Kodedit LLC</strong></p>
          <p>A product by Kodedit LLC</p>
          <p>
            Website:{' '}
            <a href="https://kodedit.io" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
              kodedit.io
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
