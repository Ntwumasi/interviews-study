import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | interviews.study',
  description: 'Terms of Service for interviews.study - AI-powered mock interview platform',
}

export default function TermsOfServicePage() {
  return (
    <article className="prose prose-invert prose-lg max-w-none">
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Terms of Service</h1>
      <p className="text-gray-400 text-sm mb-8">Last updated: November 25, 2025</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">1. Agreement to Terms</h2>
        <p className="text-gray-300 leading-relaxed">
          By accessing or using interviews.study (&quot;the Service&quot;), operated by Kodedit LLC (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;),
          you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">2. Description of Service</h2>
        <p className="text-gray-300 leading-relaxed">
          interviews.study is an AI-powered mock interview platform designed to help software engineers prepare for
          technical interviews. The Service provides simulated coding, system design, and behavioral interviews with
          AI-generated feedback.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">3. User Accounts</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          To access certain features of the Service, you must create an account. You agree to:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>Provide accurate and complete information when creating your account</li>
          <li>Maintain the security of your account credentials</li>
          <li>Notify us immediately of any unauthorized access to your account</li>
          <li>Accept responsibility for all activities that occur under your account</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">4. Acceptable Use</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          You agree not to use the Service to:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe upon the rights of others</li>
          <li>Submit malicious code or attempt to exploit system vulnerabilities</li>
          <li>Share your account credentials with others</li>
          <li>Attempt to reverse engineer or copy the Service</li>
          <li>Use the Service for any commercial purpose without our consent</li>
          <li>Abuse, harass, or harm other users or our staff</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">5. Intellectual Property</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          The Service and its original content, features, and functionality are owned by Kodedit LLC and are
          protected by international copyright, trademark, and other intellectual property laws.
        </p>
        <p className="text-gray-300 leading-relaxed">
          You retain ownership of any code or content you submit during interview sessions. However, you grant us
          a non-exclusive license to use anonymized and aggregated data to improve our Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">6. AI-Generated Content</h2>
        <p className="text-gray-300 leading-relaxed">
          The Service uses artificial intelligence to generate interview questions, provide feedback, and simulate
          interviewer responses. While we strive for accuracy, AI-generated content may contain errors or
          inaccuracies. The feedback provided should be used for educational purposes only and does not guarantee
          interview success.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">7. Payment and Subscriptions</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          Some features of the Service may require payment. By subscribing to a paid plan, you agree to:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>Pay all fees associated with your selected plan</li>
          <li>Provide accurate billing information</li>
          <li>Accept that subscriptions auto-renew unless cancelled</li>
        </ul>
        <p className="text-gray-300 leading-relaxed mt-4">
          Refunds are provided at our discretion. Contact us within 7 days of purchase for refund requests.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">8. Limitation of Liability</h2>
        <p className="text-gray-300 leading-relaxed">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, KODEDIT LLC SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
          SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR
          OPPORTUNITIES, ARISING FROM YOUR USE OF THE SERVICE.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">9. Disclaimer of Warranties</h2>
        <p className="text-gray-300 leading-relaxed">
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
          IMPLIED. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">10. Termination</h2>
        <p className="text-gray-300 leading-relaxed">
          We may terminate or suspend your account at any time, with or without cause, with or without notice.
          Upon termination, your right to use the Service will immediately cease.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">11. Governing Law</h2>
        <p className="text-gray-300 leading-relaxed">
          These Terms shall be governed by and construed in accordance with the laws of the State of Delaware,
          United States, without regard to its conflict of law provisions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">12. Changes to Terms</h2>
        <p className="text-gray-300 leading-relaxed">
          We reserve the right to modify these Terms at any time. We will notify users of any material changes
          by posting the updated Terms on this page with a new &quot;Last updated&quot; date. Your continued use of the
          Service after changes constitutes acceptance of the modified Terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">13. Contact Us</h2>
        <p className="text-gray-300 leading-relaxed">
          If you have any questions about these Terms, please contact us at:
        </p>
        <div className="mt-4 p-4 bg-white/5 rounded-lg">
          <p className="text-gray-300">
            <strong className="text-white">Kodedit LLC</strong><br />
            Email: legal@kodedit.io<br />
            Website: <a href="https://kodedit.io" className="text-blue-400 hover:text-blue-300">kodedit.io</a>
          </p>
        </div>
      </section>
    </article>
  )
}
