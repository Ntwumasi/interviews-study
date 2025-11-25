import { Metadata } from 'next'
import { ChevronDown } from 'lucide-react'

export const metadata: Metadata = {
  title: 'FAQ | interviews.study',
  description: 'Frequently asked questions about interviews.study - AI-powered mock interview platform',
}

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'What is interviews.study?',
        a: 'interviews.study is an AI-powered mock interview platform designed to help software engineers prepare for technical interviews at top tech companies. We offer coding, system design, and behavioral interview practice with real-time AI feedback.',
      },
      {
        q: 'How does the AI interviewer work?',
        a: 'Our AI interviewer is powered by advanced language models that simulate a real interviewer. It asks follow-up questions based on your responses, probes your thinking process, and provides detailed feedback on your performance after each session.',
      },
      {
        q: 'Is interviews.study free to use?',
        a: 'We offer free interviews to help you get started. This allows you to experience the platform and see if it\'s right for you before committing to a paid plan.',
      },
      {
        q: 'What types of interviews can I practice?',
        a: 'We offer three types of interviews: Coding (60 minutes with a live code editor), System Design (45 minutes with a diagramming canvas), and Behavioral (30 minutes using the STAR framework).',
      },
    ],
  },
  {
    category: 'Interview Sessions',
    questions: [
      {
        q: 'How long are the interview sessions?',
        a: 'Session lengths match real interview formats: Coding interviews are 60 minutes, System Design interviews are 45 minutes, and Behavioral interviews are 30 minutes.',
      },
      {
        q: 'Can I pause an interview?',
        a: 'Currently, interviews run continuously once started to simulate real interview conditions. We recommend ensuring you have uninterrupted time before starting a session.',
      },
      {
        q: 'What programming languages are supported for coding interviews?',
        a: 'We support JavaScript, Python, Java, C++, and Go for coding interviews. You can select your preferred language when starting a coding session.',
      },
      {
        q: 'Do I need to turn on my camera?',
        a: 'Camera is optional but recommended. Using your camera helps simulate the real interview experience where you\'d typically be on a video call with your interviewer.',
      },
    ],
  },
  {
    category: 'Feedback & Progress',
    questions: [
      {
        q: 'How does the feedback system work?',
        a: 'After completing an interview, our AI analyzes your entire session including your responses, code quality (for coding interviews), and communication style. You receive an overall score, category scores, strengths, areas for improvement, and detailed recommendations.',
      },
      {
        q: 'Can I review my past interviews?',
        a: 'Yes! All your completed interviews are saved in your dashboard. You can review the transcript, your code or diagrams, and the feedback at any time.',
      },
      {
        q: 'How are interview scores calculated?',
        a: 'Scores are based on multiple factors including technical accuracy, problem-solving approach, communication clarity, and how well you handled follow-up questions. Each category is scored from 1-10, with an overall composite score.',
      },
    ],
  },
  {
    category: 'Technical Requirements',
    questions: [
      {
        q: 'What browsers are supported?',
        a: 'We recommend using the latest versions of Chrome, Firefox, Safari, or Edge for the best experience. The code editor and diagramming tools work best on desktop browsers.',
      },
      {
        q: 'Can I use interviews.study on mobile?',
        a: 'While the site is responsive, we recommend using a desktop or laptop for the best interview practice experience, especially for coding and system design interviews where you need the full editor and canvas.',
      },
      {
        q: 'Do I need to install anything?',
        a: 'No! interviews.study runs entirely in your browser. No downloads or installations required.',
      },
    ],
  },
  {
    category: 'Account & Billing',
    questions: [
      {
        q: 'How do I cancel my subscription?',
        a: 'You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period.',
      },
      {
        q: 'Do you offer refunds?',
        a: 'We offer refunds on a case-by-case basis within 7 days of purchase. Please contact us at support@kodedit.io with your refund request.',
      },
      {
        q: 'How do I delete my account?',
        a: 'To delete your account and all associated data, please contact us at privacy@kodedit.io. We\'ll process your request within 30 days.',
      },
    ],
  },
  {
    category: 'Privacy & Security',
    questions: [
      {
        q: 'Is my interview data private?',
        a: 'Yes, your interview sessions are private and only visible to you. We use your data to generate feedback and improve our service, but we never share individual interview data with third parties.',
      },
      {
        q: 'How is my data protected?',
        a: 'We use industry-standard security measures including encryption in transit (HTTPS), secure database storage, and strict access controls. See our Privacy Policy for more details.',
      },
      {
        q: 'Do you sell my data?',
        a: 'No, we never sell your personal information to third parties. See our Privacy Policy for complete details on how we handle your data.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Frequently Asked Questions</h1>
      <p className="text-gray-400 mb-8">Find answers to common questions about interviews.study</p>

      <div className="space-y-8">
        {faqs.map((section) => (
          <section key={section.category}>
            <h2 className="text-xl font-semibold text-white mb-4 pb-2 border-b border-white/10">
              {section.category}
            </h2>
            <div className="space-y-4">
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
