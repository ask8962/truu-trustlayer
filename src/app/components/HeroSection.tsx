'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, LayoutDashboard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';


const GithubIcon = ({ size = 18, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);


export default function HeroSection() {
  const [loading, setLoading] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();
  }, []);

  const handleGitHubConnect = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch {
      toast.error('GitHub connection failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="radial-glow-bg absolute inset-0" />

      {/* Floating blobs - Richer colors */}
      <div
        className="ambient-blob w-96 h-96 top-20 left-20 opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.8) 0%, transparent 70%)' }}
      />
      <div
        className="ambient-blob w-80 h-80 bottom-32 right-24 opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.8) 0%, transparent 70%)' }}
      />
      <div
        className="ambient-blob w-64 h-64 top-1/2 right-1/3 opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.6) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-8 border"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
          <span className="text-xs font-mono text-muted-foreground tracking-wider uppercase">
            AI Skill Verification — Now Live
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-6"
        >
          <span className="block text-foreground">The Definitive</span>
          <span className="block text-gradient-full">Proof of Skill</span>
          <span className="block text-foreground">for Engineers.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Stop writing resumes. Let your actual codebase prove your worth.
          TRUU analyzes your GitHub repositories, code complexity, and commits to issue{' '}
          <span className="text-foreground font-medium border-b border-cyan/50 pb-0.5">empirical, AI-verified</span>{' '}
          Skill Credentials.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {isLoggedIn ? (
            <Link
              href="/user-dashboard"
              className="btn-primary flex items-center gap-3 px-8 py-4 rounded-xl text-base font-semibold relative z-10 w-full sm:w-auto"
            >
              <LayoutDashboard size={18} className="relative z-10" />
              <span className="relative z-10">Go to Dashboard</span>
              <ArrowRight size={16} className="relative z-10" />
            </Link>
          ) : (
            <button
              onClick={handleGitHubConnect}
              disabled={loading}
              className="btn-primary flex items-center gap-3 px-8 py-4 rounded-xl text-base font-semibold relative z-10 w-full sm:w-auto"
            >
              <GithubIcon size={18} className="relative z-10" />
              <span className="relative z-10">Connect GitHub to Start Mining</span>
              <ArrowRight size={16} className="relative z-10" />
            </button>
          )}
          <a
            href="#how-it-works"
            className="btn-ghost flex items-center gap-2 px-8 py-4 rounded-xl text-base font-medium w-full sm:w-auto"
          >
            <Zap size={16} />
            See How It Works
          </a>
        </motion.div>

        {/* Privacy Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center max-w-sm mx-auto"
        >
          <p className="text-[11px] text-muted-foreground/70 font-mono leading-relaxed">
            <Shield size={10} className="inline mr-1 text-primary/70" />
            We only read your public commit metadata and READMEs to verify skills. We <strong className="text-foreground/80">never</strong> store your source code. You can revoke access and delete your data instantly at any time.
          </p>
        </motion.div>

        {/* Social proof pill */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground font-mono"
        >
          {[
            { icon: Shield, text: 'AI-verified from code' },
            { icon: GithubIcon, text: 'GitHub-native' },
            { icon: Zap, text: 'Real-time mining' },
          ].map(({ icon: Icon, text }) => (
            <span key={`pill-${text}`} className="flex items-center gap-1.5">
              <Icon size={11} className="text-cyan" />
              {text}
            </span>
          ))}
        </motion.div>

        {/* Hero credential preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 max-w-md mx-auto"
        >
          <div className="animate-float">
            <div
              className="glass-card-bright rounded-2xl p-6 animate-neon-pulse relative overflow-hidden"
            >
              {/* Scan line */}
              <div
                className="absolute left-0 right-0 h-px animate-scan"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.6), transparent)' }}
              />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Zap size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">TRUU Credential</p>
                    <p className="text-sm font-bold text-foreground">TypeScript</p>
                  </div>
                </div>
                <span className="bg-tier-expert border tier-expert text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  EXPERT
                </span>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-1">
                  <span>CONFIDENCE SCORE</span>
                  <span className="text-accent font-bold">96.4%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[96.4%] rounded-full bg-gradient-to-r from-accent to-primary" />
                </div>
              </div>

              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest mb-1">PROOF HASH</p>
                <p className="proof-hash text-muted-foreground">0x7f4a9c2e1b8d3f6a0e5c2b9d4a1f8e3c7b0d5a2e</p>
              </div>

              <div className="flex items-center justify-between mt-3">
                <p className="text-[10px] font-mono text-muted-foreground">Verified 2026-05-07</p>
                <div className="flex items-center gap-1 text-cyan text-[10px] font-mono">
                  <Shield size={9} />
                  <span>VERIFIED</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Trust Score Scale Guide Section */}
    <section className="py-24 relative overflow-hidden border-t border-white/[0.05] bg-black/40">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="max-w-screen-xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
            The <span className="text-gradient-full">Universal Standard</span> for Engineering.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            TRUU issues a global Trust Score from 0 to 1000 based on the empirical reality of your code, consistency, and system complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tier 1: Learner */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <span className="text-6xl font-black">1</span>
            </div>
            <div className="text-xs font-mono text-muted-foreground mb-2 tracking-wider">0 - 300 SCORE</div>
            <h3 className="text-xl font-bold text-white mb-2">Learner</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Building foundational skills. Low commit volume or primarily working on forks and basic projects.
            </p>
          </div>

          {/* Tier 2: Practitioner */}
          <div className="glass-card rounded-2xl p-6 border border-cyan/20 relative overflow-hidden group hover:border-cyan/40 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-cyan">
              <span className="text-6xl font-black">2</span>
            </div>
            <div className="text-xs font-mono text-cyan mb-2 tracking-wider">300 - 600 SCORE</div>
            <h3 className="text-xl font-bold text-white mb-2">Practitioner</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Active contributor. Consistent commits, multiple solid repositories, and empirical proof of working code.
            </p>
          </div>

          {/* Tier 3: Expert */}
          <div className="glass-card rounded-2xl p-6 border border-purple-500/30 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-purple-500">
              <span className="text-6xl font-black">3</span>
            </div>
            <div className="text-xs font-mono text-purple-400 mb-2 tracking-wider">600 - 900 SCORE</div>
            <h3 className="text-xl font-bold text-white mb-2">Expert</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              High-impact engineer. Complex architectures, deep language proficiency, and high-quality open-source presence.
            </p>
          </div>

          {/* Tier 4: Elite */}
          <div className="glass-card rounded-2xl p-6 border border-amber-500/40 relative overflow-hidden group hover:border-amber-500/60 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-amber-500">
              <span className="text-6xl font-black">4</span>
            </div>
            <div className="text-xs font-mono text-amber-500 mb-2 font-bold flex items-center gap-2 tracking-wider">
              900 - 1000 SCORE <Zap size={12} className="fill-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-amber-500 mb-2 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">Elite</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Top 1% open-source masters. Flawless consistency, master-level system design, and massive repository impact.
            </p>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}