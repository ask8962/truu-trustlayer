import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../styles/tailwind.css';
import { Toaster } from 'sonner';

const geist = Geist({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'TRUU — AI-Verified Developer Skill Credentials',
  description: 'TRUU replaces resumes by analyzing real GitHub activity and issuing AI-verified Skill Credentials. Get your Capability Passport in 30 seconds.',
  keywords: ['developer skills', 'AI verification', 'GitHub', 'skill credentials', 'developer portfolio', 'trust score', 'capability passport'],
  authors: [{ name: 'TRUU' }],
  openGraph: {
    title: 'TRUU — AI-Verified Developer Skill Credentials',
    description: 'Connect your GitHub. Get AI-verified skills. Share your Capability Passport.',
    url: 'https://truu-trustlayer.vercel.app',
    siteName: 'TRUU',
    type: 'website',
    images: [
      {
        url: '/api/og?username=ask8962',
        width: 1200,
        height: 630,
        alt: 'TRUU Capability Passport',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TRUU — AI-Verified Developer Skill Credentials',
    description: 'Connect your GitHub. Get AI-verified skills in 30 seconds.',
    images: ['/api/og?username=ask8962'],
  },
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
  metadataBase: new URL('https://truu-trustlayer.vercel.app'),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} dark`}>
      <body className={geist.className}>
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: 'rgba(24,24,27,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#FAFAFA',
              backdropFilter: 'blur(20px)',
            },
          }}
        />
</body>
    </html>
  );
}