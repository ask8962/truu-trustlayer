'use client';

import React from 'react';
import Link from 'next/link';
import { Share2, ExternalLink, ArrowLeft } from 'lucide-react';
import TruuLogo from '@/components/TruuLogo';
import { toast } from 'sonner';

export default function PassportNavbar() {
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location?.href : '';
    if (url) {
      await navigator.clipboard?.writeText(url);
      toast?.success('Passport URL copied to clipboard');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b h-16 flex items-center">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 w-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft size={14} />
            <span className="hidden sm:inline font-mono text-xs">Back</span>
          </Link>
          <div className="w-px h-5 bg-border" />
          <TruuLogo size={24} />
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground border border-border px-2.5 py-1.5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Public Capability Passport
          </span>
          <button
            onClick={handleShare}
            className="btn-ghost flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono"
          >
            <Share2 size={13} />
            Share
          </button>
          <Link
            href="/user-dashboard"
            className="btn-primary flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold relative z-10"
          >
            <span className="relative z-10">My Dashboard</span>
            <ExternalLink size={11} className="relative z-10" />
          </Link>
        </div>
      </div>
    </header>
  );
}