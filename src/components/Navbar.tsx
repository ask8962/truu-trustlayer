'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ExternalLink } from 'lucide-react';
import TruuLogo from './TruuLogo';
import { createClient } from '@/lib/supabase/client';

const GithubIcon = ({ size = 15, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

const NAV_LINKS = [
  { label: 'Product', href: '#how-it-works' },
  { label: 'Dashboard', href: '/user-dashboard' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });

    // Check auth status
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));

    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-card border-b' : 'bg-transparent'
        }`}
    >
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <TruuLogo size={28} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS?.map((link) => (
            <Link
              key={`nav-${link?.href}`}
              href={link?.href}
              className={`text-sm font-medium transition-colors duration-200 ${pathname === link?.href
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {link?.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          >
            <GithubIcon size={15} />
            GitHub
          </a>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/user-dashboard"
                className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold relative z-10"
              >
                <span className="relative z-10">Dashboard</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="btn-ghost px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/user-dashboard"
              className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold relative z-10"
            >
              <span className="relative z-10">Launch App</span>
              <ExternalLink size={13} className="relative z-10" />
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg btn-ghost"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle mobile menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden glass-card border-t overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {NAV_LINKS?.map((link) => (
                <Link
                  key={`mobile-nav-${link?.href}`}
                  href={link?.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link?.label}
                </Link>
              ))}
              <Link
                href="/user-dashboard"
                onClick={() => setMobileOpen(false)}
                className="btn-primary text-center px-4 py-2 rounded-lg text-sm font-semibold relative z-10"
              >
                <span className="relative z-10">Launch App</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}