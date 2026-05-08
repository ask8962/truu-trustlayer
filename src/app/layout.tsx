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
  title: 'TRUU — The Global Trust Layer for Human Capability',
  description: 'TRUU replaces traditional resumes by automatically analyzing real GitHub activity and issuing mathematically verifiable Skill Credentials for developers.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
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