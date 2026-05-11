'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Globe as GlobeIcon, Shield, CheckCircle2, MapPin, Calendar
} from 'lucide-react';
import { useProfile } from '../ProfileContext';
import AppImage from '@/components/ui/AppImage';
import ShareProfileButton from '@/components/ShareProfileButton';



const GithubIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

const TwitterIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedinIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const LeetcodeIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.414l-9.774 9.774a1.358 1.358 0 0 0 0 1.923l9.11 9.11a1.358 1.358 0 0 0 1.923 0L23.565 11.45a1.358 1.358 0 0 0 0-1.923L13.483 0zm-1.077 4.793l3.665 3.665-3.665 3.665-3.665-3.665 3.665-3.665zM4.793 11.077l3.665 3.665-3.665 3.665-3.665-3.665 3.665-3.665z"/>
  </svg>
);



export default function PassportHeader() {
  const { profileUser: user } = useProfile();
  const scorePercent = (user?.trustScore / 1000) * 100;

  return (
    <div className="glass-card-bright rounded-2xl p-6 lg:p-8 border border-accent/20 relative overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute top-0 right-0 w-80 h-60 opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.8) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-60 h-40 opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.6) 0%, transparent 70%)' }}
      />
      {/* Top gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), rgba(59,130,246,0.6), transparent)' }}
      />
      <div className="relative z-10 flex flex-col lg:flex-row items-start gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="relative">
            <AppImage
              src={user?.avatar}
              alt={`${user?.githubUsername} developer profile avatar on TRUU Capability Passport`}
              width={96}
              height={96}
              className="rounded-2xl ring-2 ring-accent/40"
              priority
            />
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ boxShadow: '0 0 20px rgba(139,92,246,0.3)' }}
            />
          </div>
          <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <CheckCircle2 size={12} className="text-white" />
          </div>
        </div>

        {/* Identity info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl lg:text-3xl font-black text-foreground">{user?.fullName}</h1>
            <span className="text-muted-foreground font-mono text-sm opacity-50">@{user?.githubUsername}</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/30">
              <Shield size={11} className="text-accent" />
              <span className="text-[10px] font-mono text-accent uppercase tracking-wider font-bold">TRUU Verified</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-xl">{user?.bio}</p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-mono mb-5">
            <span className="flex items-center gap-1.5">
              <MapPin size={11} />
              {user?.location || 'Unknown Location'}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={11} />
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'}
            </span>
            <span className="flex items-center gap-1.5">
              <GithubIcon size={11} />
              {user?.githubUsername}
            </span>
          </div>

          {/* Social links + Share */}
          <div className="flex items-center gap-2">
            {[
              { icon: GithubIcon, href: `https://github.com/${user?.githubUsername}`, label: 'GitHub', show: true },
              { icon: TwitterIcon, href: user?.socials?.twitter, label: 'Twitter', show: !!user?.socials?.twitter },
              { icon: LinkedinIcon, href: user?.socials?.linkedin, label: 'LinkedIn', show: !!user?.socials?.linkedin },
              { icon: LeetcodeIcon, href: user?.socials?.leetcode, label: 'LeetCode', show: !!user?.socials?.leetcode },
              { icon: GlobeIcon, href: user?.socials?.website, label: 'Website', show: !!user?.socials?.website },
            ]?.filter(s => s.show).map(({ icon: SocialIcon, href, label }) => (
              <a
                key={`passport-social-${label}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="p-2 rounded-lg btn-ghost text-muted-foreground hover:text-foreground"
              >
                <SocialIcon size={15} />
              </a>
            ))}
            <div className="w-px h-5 bg-border/50 mx-1" />
            <ShareProfileButton username={user?.githubUsername || ''} trustScore={user?.trustScore} variant="compact" />
          </div>
        </div>

        {/* Trust Score panel */}
        <div className="flex-shrink-0 w-full lg:w-48">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-border/50 text-center">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Trust Score</p>
            <motion.p
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="text-4xl font-black font-mono tabular-nums text-gradient-blue mb-1"
            >
              {user?.trustScore}
            </motion.p>
            <p className="text-[10px] font-mono text-muted-foreground mb-3">out of 1000</p>

            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${scorePercent}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Repos', value: user?.repoCount },
                { label: 'Commits', value: user?.commitCount >= 1000 ? `${(user?.commitCount / 1000)?.toFixed(1)}k` : user?.commitCount },
              ]?.map(({ label, value }) => (
                <div key={`header-stat-${label}`} className="p-2 rounded-lg bg-white/[0.03] border border-border/50">
                  <p className="text-sm font-black font-mono text-foreground">{value}</p>
                  <p className="text-[9px] text-muted-foreground font-mono">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}