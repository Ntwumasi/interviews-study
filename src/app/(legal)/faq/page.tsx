import { Metadata } from 'next'
import { FAQContent } from './faq-content'

export const metadata: Metadata = {
  title: 'FAQ | interviews.study',
  description: 'Frequently asked questions about interviews.study - AI-powered mock interview platform',
}

export default function FAQPage() {
  return <FAQContent />
}
