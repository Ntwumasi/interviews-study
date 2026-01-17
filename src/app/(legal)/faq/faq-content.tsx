'use client'

import { useState } from 'react'
import { ChevronDown, Send, Sparkles, Loader2 } from 'lucide-react'

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'What is interviews.study?',
        a: 'interviews.study is an AI-powered mock interview platform designed to help software engineers prepare for technical interviews at top tech companies like Google, Meta, Amazon, Apple, and more. We offer coding, system design, and behavioral interview practice with real-time AI feedback.',
      },
      {
        q: 'How does the AI interviewer work?',
        a: 'Our AI interviewer is powered by advanced language models that simulate a real interviewer. It asks contextual follow-up questions based on your responses, probes your thinking process, and adapts to your answers just like a human interviewer would. After each session, it provides detailed feedback on your performance.',
      },
      {
        q: 'How much does interviews.study cost?',
        a: 'We offer a 3-day free trial to get started. After your trial, Pro is $19.99/month for unlimited interviews, all company tracks, video recording, and more. You can cancel anytime during your trial and won\'t be charged. A credit card is required to start your trial so you can seamlessly continue if you love it.',
      },
      {
        q: 'What types of interviews can I practice?',
        a: 'We offer three types of interviews: Coding (60 minutes with a live code editor supporting 5 languages), System Design (45 minutes with an interactive whiteboard/diagramming canvas), and Behavioral (30 minutes using the STAR framework for structured storytelling).',
      },
      {
        q: 'What companies does this prepare me for?',
        a: 'Our platform is designed to prepare you for interviews at top tech companies including Google, Meta, Amazon, Apple, Microsoft, Netflix, and Stripe. We also offer company-specific preparation tracks that focus on each company\'s unique interview style and expectations.',
      },
    ],
  },
  {
    category: 'Interview Sessions',
    questions: [
      {
        q: 'How long are the interview sessions?',
        a: 'Session lengths match real interview formats: Coding interviews are 60 minutes, System Design interviews are 45 minutes, and Behavioral interviews are 30 minutes. These durations reflect what you\'ll experience in actual tech interviews.',
      },
      {
        q: 'Can I pause an interview?',
        a: 'Currently, interviews run continuously once started to simulate real interview conditions. We recommend ensuring you have uninterrupted time before starting a session. You can leave an interview early if needed, but you\'ll need to start a new session to continue practicing.',
      },
      {
        q: 'What programming languages are supported?',
        a: 'We support JavaScript, Python, Java, C++, and Go for coding interviews. You can select your preferred language when starting a coding session, and the editor provides syntax highlighting, auto-completion, and real-time code execution.',
      },
      {
        q: 'Do I need to turn on my camera?',
        a: 'Camera is optional but recommended. Using your camera helps simulate the real interview experience where you\'d typically be on a video call with your interviewer. It also allows you to review your body language and presentation when watching session recordings.',
      },
      {
        q: 'What difficulty levels are available?',
        a: 'Each interview type offers three difficulty levels: Easy (great for beginners or warm-ups), Medium (balanced challenge, recommended starting point), and Hard (advanced problems similar to senior-level interviews). We recommend starting with Medium to gauge your current level.',
      },
      {
        q: 'How realistic are the interview scenarios?',
        a: 'Our scenarios are based on real interview questions from top tech companies. The AI interviewer behaves like a real interviewer - asking clarifying questions, pushing back on assumptions, and evaluating your problem-solving process, not just your final answer.',
      },
    ],
  },
  {
    category: 'Feedback & Scoring',
    questions: [
      {
        q: 'How does the feedback system work?',
        a: 'After completing an interview, our AI analyzes your entire session including your responses, code quality (for coding interviews), communication style, and problem-solving approach. You receive an overall score, category-specific scores, key strengths, areas for improvement, and curated study resources.',
      },
      {
        q: 'How are interview scores calculated?',
        a: 'Scores are based on multiple factors: Technical Accuracy (correctness of your solution/answers), Communication (clarity of explanations), and Problem Solving (approach and methodology). Each category is scored from 1-10, and we provide an overall composite score along with detailed explanations.',
      },
      {
        q: 'Can I review my past interviews?',
        a: 'Yes! All your completed interviews are saved in your dashboard. You can review the full transcript, your code submissions with syntax highlighting, system design diagrams, video recordings (if enabled), and the complete feedback at any time.',
      },
      {
        q: 'How long does feedback take to generate?',
        a: 'Feedback is typically generated within 30-60 seconds after completing your interview. The AI analyzes your entire session to provide comprehensive, personalized feedback. You\'ll see a loading indicator while it\'s being generated.',
      },
      {
        q: 'What study resources are included in feedback?',
        a: 'Based on your performance, we provide curated links to relevant learning materials including video tutorials, documentation, practice problems, and courses. These are specifically chosen to address the areas where you need the most improvement.',
      },
    ],
  },
  {
    category: 'Features & Tools',
    questions: [
      {
        q: 'What is the Job Roadmap Generator?',
        a: 'The Job Roadmap Generator creates a personalized preparation plan based on a specific job posting. Paste a job URL or description, set your target interview date, and our AI generates a day-by-day study plan with focus areas, practice recommendations, and curated resources tailored to that role.',
      },
      {
        q: 'What are Company-Specific Tracks?',
        a: 'These are curated preparation paths for specific companies like Google, Meta, Amazon, Apple, and Microsoft. Each track focuses on that company\'s unique interview style, common question types, and evaluation criteria to help you prepare more effectively.',
      },
      {
        q: 'How does the Progress Dashboard work?',
        a: 'The Progress Dashboard shows your performance trends over time with interactive charts. You can track your overall scores, category-specific improvements (technical accuracy, communication, problem solving), and see how you\'re progressing across different interview types.',
      },
      {
        q: 'What is the STAR method for behavioral interviews?',
        a: 'STAR stands for Situation, Task, Action, Result - a framework for structuring behavioral interview responses. Our behavioral interview workspace guides you through each component, helping you craft compelling stories that demonstrate your skills and experiences effectively.',
      },
      {
        q: 'Can I use the whiteboard for system design?',
        a: 'Yes! Our system design interviews include an interactive whiteboard/diagramming canvas where you can draw architecture diagrams, flowcharts, and system components. The AI interviewer can see your designs and provide feedback on your architectural decisions.',
      },
    ],
  },
  {
    category: 'Technical Requirements',
    questions: [
      {
        q: 'What browsers are supported?',
        a: 'We recommend using the latest versions of Chrome, Firefox, Safari, or Edge for the best experience. The code editor and diagramming tools are optimized for modern browsers on desktop devices.',
      },
      {
        q: 'Can I use interviews.study on mobile?',
        a: 'While the site is responsive, we strongly recommend using a desktop or laptop for interview practice. Coding and system design interviews require the full editor and canvas experience. Mobile is fine for viewing your dashboard, progress, and past feedback.',
      },
      {
        q: 'Do I need to install anything?',
        a: 'No installations required! interviews.study runs entirely in your browser. Just sign up, log in, and start practicing. We recommend allowing microphone access for the best interview simulation experience.',
      },
      {
        q: 'Why does the code editor need certain permissions?',
        a: 'The code editor runs your code in a secure sandbox environment. We may request microphone access if you want to practice verbalizing your thought process, which is important for real interviews where communication is key.',
      },
    ],
  },
  {
    category: 'Account & Billing',
    questions: [
      {
        q: 'How do I upgrade to premium?',
        a: 'You can start a 3-day free trial from your dashboard - no charge until the trial ends. After the trial, Pro costs $19.99/month and includes unlimited interview sessions, access to all company-specific tracks, the job roadmap generator, and priority feedback generation. Cancel anytime.',
      },
      {
        q: 'How do I cancel my subscription?',
        a: 'You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period, and you\'ll retain access to all your past interview data.',
      },
      {
        q: 'Do you offer refunds?',
        a: 'We offer refunds on a case-by-case basis within 7 days of purchase. Please contact us at support@kodedit.io with your refund request and we\'ll be happy to help.',
      },
      {
        q: 'How do I delete my account?',
        a: 'To delete your account and all associated data, please contact us at privacy@kodedit.io. We\'ll process your request within 30 days and confirm once complete.',
      },
    ],
  },
  {
    category: 'Privacy & Security',
    questions: [
      {
        q: 'Is my interview data private?',
        a: 'Yes, your interview sessions are completely private and only visible to you. We use your data solely to generate feedback and improve our service. We never share individual interview data with third parties or other users.',
      },
      {
        q: 'Are my video recordings stored securely?',
        a: 'Yes, all video recordings are encrypted and stored securely. Only you can access your recordings through your account. You can delete recordings at any time from your dashboard.',
      },
      {
        q: 'How is my data protected?',
        a: 'We use industry-standard security measures including encryption in transit (HTTPS), encrypted database storage, secure authentication via Clerk, and strict access controls. See our Privacy Policy for complete details.',
      },
      {
        q: 'Do you sell my data?',
        a: 'No, we never sell your personal information to third parties. Your data is used only to provide and improve the service. See our Privacy Policy for complete details on how we handle your data.',
      },
    ],
  },
]

export function FAQContent() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAskQuestion = async () => {
    if (!question.trim()) return

    setIsLoading(true)
    setError('')
    setAnswer('')

    try {
      const response = await fetch('/api/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get answer')
      }

      setAnswer(data.answer)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Frequently Asked Questions</h1>
      <p className="text-gray-400 mb-8">Find answers to common questions about interviews.study</p>

      {/* AI Q&A Section */}
      <div className="mb-12 p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Ask AI</h2>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Can&apos;t find your answer below? Ask our AI assistant anything about interviews.study.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleAskQuestion()}
            placeholder="e.g., How do I prepare for a Google interview?"
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            disabled={isLoading}
          />
          <button
            onClick={handleAskQuestion}
            disabled={isLoading || !question.trim()}
            className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* AI Response */}
        {(answer || error) && (
          <div className={`mt-4 p-4 rounded-xl ${error ? 'bg-red-500/10 border border-red-500/20' : 'bg-white/5 border border-white/10'}`}>
            {error ? (
              <p className="text-red-400 text-sm">{error}</p>
            ) : (
              <div>
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Response
                </p>
                <p className="text-gray-300 leading-relaxed">{answer}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAQ Categories */}
      <div className="space-y-8">
        {faqs.map((section) => (
          <section key={section.category}>
            <h2 className="text-xl font-semibold text-white mb-4 pb-2 border-b border-white/10">
              {section.category}
            </h2>
            <div className="space-y-3">
              {section.questions.map((faq, index) => (
                <details
                  key={index}
                  className="group bg-white/5 rounded-lg border border-white/10 overflow-hidden"
                >
                  <summary className="flex items-center justify-between cursor-pointer p-4 hover:bg-white/5 transition-colors">
                    <span className="font-medium text-white pr-4">{faq.q}</span>
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-4 pb-4 pt-0">
                    <p className="text-gray-300 leading-relaxed">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Contact Section */}
      <div className="mt-12 p-6 bg-white/5 rounded-xl border border-white/10 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Still have questions?</h3>
        <p className="text-gray-400 mb-4">
          Can&apos;t find what you&apos;re looking for? We&apos;re here to help.
        </p>
        <a
          href="/contact"
          className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
        >
          Contact Support
        </a>
      </div>
    </div>
  )
}
