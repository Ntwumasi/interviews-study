import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | interviews.study',
  description: 'Privacy Policy for interviews.study - Learn how we collect, use, and protect your data',
}

export default function PrivacyPolicyPage() {
  return (
    <article className="prose prose-invert prose-lg max-w-none">
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Privacy Policy</h1>
      <p className="text-gray-400 text-sm mb-8">Last updated: November 25, 2025</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">1. Introduction</h2>
        <p className="text-gray-300 leading-relaxed">
          Kodedit LLC (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates interviews.study. This Privacy Policy
          explains how we collect, use, disclose, and safeguard your information when you use our Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">2. Information We Collect</h2>

        <h3 className="text-lg font-medium text-white mt-6 mb-3">2.1 Information You Provide</h3>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li><strong>Account Information:</strong> Email address, name, and authentication data when you create an account</li>
          <li><strong>Interview Data:</strong> Code submissions, chat transcripts, diagram data, and responses during mock interviews</li>
          <li><strong>Payment Information:</strong> Billing details processed through our secure payment providers</li>
          <li><strong>Communications:</strong> Information you provide when contacting us for support</li>
        </ul>

        <h3 className="text-lg font-medium text-white mt-6 mb-3">2.2 Information Collected Automatically</h3>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the Service</li>
          <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
          <li><strong>Log Data:</strong> IP address, access times, referring URLs</li>
          <li><strong>Cookies:</strong> Session cookies and analytics cookies (see Section 6)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
        <p className="text-gray-300 leading-relaxed mb-4">We use the collected information to:</p>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>Provide, maintain, and improve the Service</li>
          <li>Generate AI-powered interview feedback</li>
          <li>Process transactions and send related information</li>
          <li>Send you technical notices, updates, and support messages</li>
          <li>Respond to your comments, questions, and requests</li>
          <li>Monitor and analyze trends, usage, and activities</li>
          <li>Detect, investigate, and prevent fraudulent or unauthorized activities</li>
          <li>Personalize and improve your experience</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">4. Data Sharing and Disclosure</h2>
        <p className="text-gray-300 leading-relaxed mb-4">We may share your information with:</p>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li><strong>Service Providers:</strong> Third-party vendors who assist in providing the Service (e.g., hosting, analytics, payment processing)</li>
          <li><strong>AI Providers:</strong> We use Anthropic&apos;s Claude AI to power our interview simulations. Your interview data is processed by their systems according to their privacy practices</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
          <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
        </ul>
        <p className="text-gray-300 leading-relaxed mt-4">
          <strong>We do not sell your personal information to third parties.</strong>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">5. Data Retention</h2>
        <p className="text-gray-300 leading-relaxed">
          We retain your information for as long as your account is active or as needed to provide you services.
          Interview transcripts and feedback are retained to allow you to review your progress. You may request
          deletion of your data at any time by contacting us.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">6. Cookies and Tracking Technologies</h2>
        <p className="text-gray-300 leading-relaxed mb-4">We use cookies and similar technologies to:</p>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>Keep you signed in</li>
          <li>Remember your preferences</li>
          <li>Understand how you use the Service</li>
          <li>Improve and personalize your experience</li>
        </ul>
        <p className="text-gray-300 leading-relaxed mt-4">
          We use PostHog for analytics. You can opt out of analytics tracking by using browser privacy settings
          or extensions that block tracking scripts.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">7. Data Security</h2>
        <p className="text-gray-300 leading-relaxed">
          We implement appropriate technical and organizational measures to protect your personal information, including:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4">
          <li>Encryption of data in transit (HTTPS/TLS)</li>
          <li>Secure database storage with access controls</li>
          <li>Regular security assessments</li>
          <li>Employee access restrictions</li>
        </ul>
        <p className="text-gray-300 leading-relaxed mt-4">
          However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">8. Your Rights and Choices</h2>
        <p className="text-gray-300 leading-relaxed mb-4">Depending on your location, you may have the right to:</p>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
          <li><strong>Correction:</strong> Request correction of inaccurate data</li>
          <li><strong>Deletion:</strong> Request deletion of your personal data</li>
          <li><strong>Portability:</strong> Request a portable copy of your data</li>
          <li><strong>Opt-out:</strong> Opt out of marketing communications</li>
        </ul>
        <p className="text-gray-300 leading-relaxed mt-4">
          To exercise these rights, please contact us at privacy@kodedit.io.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">9. International Data Transfers</h2>
        <p className="text-gray-300 leading-relaxed">
          Your information may be transferred to and processed in countries other than your own. We ensure
          appropriate safeguards are in place for such transfers in compliance with applicable data protection laws.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">10. Children&apos;s Privacy</h2>
        <p className="text-gray-300 leading-relaxed">
          The Service is not intended for individuals under 16 years of age. We do not knowingly collect
          personal information from children. If you believe we have collected information from a child,
          please contact us immediately.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">11. California Privacy Rights (CCPA)</h2>
        <p className="text-gray-300 leading-relaxed">
          California residents have additional rights under the California Consumer Privacy Act (CCPA), including
          the right to know what personal information is collected, the right to delete, and the right to opt-out
          of the sale of personal information. As noted above, we do not sell personal information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">12. Changes to This Policy</h2>
        <p className="text-gray-300 leading-relaxed">
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the
          new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">13. Contact Us</h2>
        <p className="text-gray-300 leading-relaxed">
          If you have questions about this Privacy Policy, please contact us:
        </p>
        <div className="mt-4 p-4 bg-white/5 rounded-lg">
          <p className="text-gray-300">
            <strong className="text-white">Kodedit LLC</strong><br />
            Email: privacy@kodedit.io<br />
            Website: <a href="https://kodedit.io" className="text-blue-400 hover:text-blue-300">kodedit.io</a>
          </p>
        </div>
      </section>
    </article>
  )
}
