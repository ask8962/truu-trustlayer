'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PassportNavbar from './PassportNavbar';
import PassportHeader from './PassportHeader';
import CredentialGrid from './CredentialGrid';
import TechStackSection from './TechStackSection';
import ContributionHeatmap from './ContributionHeatmap';
import PublicMetricsBar from './PublicMetricsBar';
import ProofTimeline from './ProofTimeline';
import Footer from '@/components/Footer';
import { useProfile } from '../ProfileContext';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function PassportView() {
  const { profileUser: user } = useProfile();
  const [skillCount, setSkillCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('skills')
        .select('id')
        .eq('user_id', user.uid);
      setSkillCount(data?.length || 0);
    };
    fetchCount();
  }, [user]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 grid-bg opacity-20 pointer-events-none" />
      <div
        className="fixed top-0 left-0 right-0 h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 100% 60% at 50% -20%, rgba(139,92,246,0.12), transparent)' }}
      />
      <PassportNavbar />
      <main className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PassportHeader />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8"
        >
          <PublicMetricsBar />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-bold text-foreground">Verified Skill Credentials</h2>
            <span className="text-[10px] font-mono text-muted-foreground bg-white/5 border border-border px-2 py-1 rounded-full">
              {skillCount} credentials
            </span>
          </div>
          <CredentialGrid />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12"
        >
          <TechStackSection />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12"
        >
          <ContributionHeatmap />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-12"
        >
          <ProofTimeline />
        </motion.div>

        {/* CTA for visitors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="glass-card-bright rounded-2xl p-8 border border-accent/20 max-w-xl mx-auto">
            <p className="text-xs font-mono uppercase tracking-widest text-accent mb-2">Verified by TRUU</p>
            <p className="text-lg font-bold text-foreground mb-4">Get your own Capability Passport</p>
            <p className="text-sm text-muted-foreground mb-6">Connect your GitHub and let AI verify your skills in 30 seconds. Free forever.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-primary text-sm font-semibold"
            >
              Create My Passport →
            </Link>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}