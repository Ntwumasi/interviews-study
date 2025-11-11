import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://interviews.study'),
  title: {
    default: "interviews.study - AI-Powered Mock Interviews for Senior Engineers",
    template: "%s | interviews.study",
  },
  description: "Practice system design interviews with AI-powered feedback. Prepare for FAANG interviews and land senior engineering roles at top tech companies. Free realistic mock interviews with detailed feedback.",
  keywords: [
    "system design interviews",
    "mock interviews",
    "AI feedback",
    "FAANG prep",
    "senior engineer",
    "interview preparation",
    "technical interviews",
    "software engineering interviews",
    "system design practice",
    "interview coaching",
    "AI interviewer",
    "Netflix system design",
    "Twitter system design",
    "URL shortener design"
  ],
  authors: [{ name: "kodedit.io", url: "https://kodedit.io" }],
  creator: "kodedit.io",
  publisher: "interviews.study",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://interviews.study",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://interviews.study",
    siteName: "interviews.study",
    title: "interviews.study - AI-Powered Mock Interviews for Senior Engineers",
    description: "Practice system design interviews with AI-powered feedback. Land your dream senior engineering role at FAANG and top tech companies.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "interviews.study - AI-Powered Mock Interviews",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@interviewsstudy",
    creator: "@interviewsstudy",
    title: "interviews.study - AI-Powered Mock Interviews",
    description: "Practice system design interviews with AI feedback. Land your dream senior engineering role.",
    images: ["/og-image.png"],
  },
  verification: {
    // Add these when you have them:
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className="font-sans antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
