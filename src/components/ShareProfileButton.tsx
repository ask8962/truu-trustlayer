'use client';

import React, { useState } from 'react';
import { Share2, Copy, CheckCircle2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const LinkedInIcon = ({ size = 14, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const TwitterIcon = ({ size = 14, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

interface ShareProfileButtonProps {
  username: string;
  trustScore?: number;
  variant?: 'full' | 'compact' | 'icon';
}

export default function ShareProfileButton({ username, trustScore, variant = 'full' }: ShareProfileButtonProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const profileUrl = `https://truu-trustlayer.vercel.app/profile/${username}`;
  
  const linkedInText = encodeURIComponent(`I just got my developer skills verified by AI on TRUU 🔒\n\nMy Trust Score: ${trustScore || 0}/1000\n\nCheck out my Capability Passport:`);
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
  
  const twitterText = encodeURIComponent(`Just got my developer skills AI-verified on @truu_id 🧠\n\nTrust Score: ${trustScore || 0}/1000\n\nCheck my Capability Passport 👇`);
  const twitterUrl = `https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(profileUrl)}`;

  const triggerShareEmail = () => {
    // Only trigger once per session per user to avoid spam
    if (typeof window !== 'undefined' && !sessionStorage.getItem(`shared_${username}`)) {
      sessionStorage.setItem(`shared_${username}`, 'true');
      fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'PROFILE_SHARED',
          targetUsername: username,
          data: {}
        })
      }).catch(console.error);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success('Profile link copied!', { description: profileUrl });
      triggerShareEmail();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={copyLink}
        className="p-2 rounded-lg btn-ghost text-muted-foreground hover:text-foreground"
        title="Copy profile link"
      >
        {copied ? <CheckCircle2 size={15} className="text-green-400" /> : <Copy size={15} />}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-2 rounded-xl font-semibold transition-all duration-200 ${
          variant === 'compact'
            ? 'px-3 py-2 text-xs btn-primary'
            : 'px-5 py-3 text-sm btn-primary'
        }`}
      >
        <Share2 size={variant === 'compact' ? 12 : 14} className="relative z-10" />
        <span className="relative z-10">Share Profile</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 z-50 glass-card-bright rounded-xl border border-border/50 p-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Share your passport</p>
            
            <button
              onClick={() => { copyLink(); setOpen(false); }}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-all text-left group"
            >
              {copied ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} className="text-muted-foreground group-hover:text-foreground" />}
              <div>
                <p className="text-xs font-semibold text-foreground">{copied ? 'Copied!' : 'Copy Link'}</p>
                <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">{profileUrl}</p>
              </div>
            </button>

            <div className="h-px bg-border/50 my-2" />

            <a
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { setOpen(false); triggerShareEmail(); }}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-all group"
            >
              <LinkedInIcon size={14} className="text-[#0A66C2]" />
              <div>
                <p className="text-xs font-semibold text-foreground">Share on LinkedIn</p>
                <p className="text-[10px] text-muted-foreground">Post with your trust score</p>
              </div>
              <ExternalLink size={10} className="ml-auto text-muted-foreground opacity-0 group-hover:opacity-100" />
            </a>

            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { setOpen(false); triggerShareEmail(); }}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-all group"
            >
              <TwitterIcon size={14} className="text-foreground" />
              <div>
                <p className="text-xs font-semibold text-foreground">Share on X (Twitter)</p>
                <p className="text-[10px] text-muted-foreground">Tweet your passport</p>
              </div>
              <ExternalLink size={10} className="ml-auto text-muted-foreground opacity-0 group-hover:opacity-100" />
            </a>
          </div>
        </>
      )}
    </div>
  );
}
