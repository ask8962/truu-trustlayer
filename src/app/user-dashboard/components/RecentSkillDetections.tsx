'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Filter, ExternalLink } from 'lucide-react';
import { useUser } from '@/lib/contexts/UserContext';
import { createClient } from '@/lib/supabase/client';
import { SkillCredential } from '@/lib/types';
import TierBadge from '@/components/TierBadge';
import ProofHashDisplay from '@/components/ProofHashDisplay';
import Link from 'next/link';

const TIER_FILTERS = ['All', 'Novice', 'Practitioner', 'Expert', 'Master'] as const;
type TierFilter = typeof TIER_FILTERS[number];

function formatDateShort(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function RecentSkillDetections() {
  const { user } = useUser();
  const [filter, setFilter] = useState<TierFilter>('All');
  const [skills, setSkills] = useState<SkillCredential[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchSkills = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', user.uid);
      if (data) {
        setSkills(data.map((s: Record<string, any>) => ({
          id: s.id as string,
          userId: s.user_id as string,
          skillName: s.skill_name as string,
          proficiency: s.proficiency_level as SkillCredential['proficiency'],
          verificationTier: (s.verification_tier as SkillCredential['verificationTier']) || 'Moderate',
          evidenceLog: s.evidence_log,
          proofHash: (s.proof_jwt as string) || '',
          verifiedAt: s.created_at as string,
          category: (s.category as string) || 'Language',
        })));
      }
    };
    fetchSkills();
  }, [user]);

  const filtered = filter === 'All' ? skills : skills.filter(s => s.proficiency === filter);

  return (
    <div className="glass-card rounded-2xl p-5 border border-border/50 flex flex-col h-full min-h-[420px]">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Award size={16} className="text-accent" />
          <span className="text-sm font-semibold">Skill Credentials</span>
          <span className="text-[10px] font-mono text-muted-foreground bg-white/5 border border-border px-1.5 py-0.5 rounded-full">
            {skills.length}
          </span>
        </div>
        <Link
          href={`/profile/${user?.githubUsername || 'unknown'}`}
          className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-primary transition-colors"
        >
          View Passport
          <ExternalLink size={10} />
        </Link>
      </div>

      {/* Tier filter */}
      <div className="flex items-center gap-1.5 mb-4 flex-shrink-0 overflow-x-auto pb-1">
        <Filter size={11} className="text-muted-foreground flex-shrink-0" />
        {TIER_FILTERS.map((tier) => (
          <button
            key={`tier-filter-${tier}`}
            onClick={() => setFilter(tier)}
            className={`flex-shrink-0 text-[10px] font-mono px-2.5 py-1 rounded-full border transition-all duration-150 ${filter === tier
                ? 'bg-primary/15 border-primary/40 text-primary' : 'border-border text-muted-foreground hover:text-foreground hover:border-border-bright'
              }`}
          >
            {tier}
          </button>
        ))}
      </div>

      {/* Skills list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Award size={24} className="text-muted-foreground opacity-30 mb-2" />
            <p className="text-xs text-muted-foreground">No {filter === 'All' ? '' : filter} credentials yet</p>
            <p className="text-[10px] text-muted-foreground mt-1">Run the miner to detect new skills</p>
          </div>
        ) : (
          filtered.map((skill, i) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.02] border border-border/50 hover:border-border-bright hover:bg-white/[0.04] transition-all duration-150 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground truncate">{skill.skillName}</span>
                    <TierBadge tier={skill.proficiency} />
                  </div>
                  <ProofHashDisplay hash={skill.proofHash} />
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center justify-end gap-1 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${skill.verificationTier === 'Strong' ? 'bg-green-400' : skill.verificationTier === 'Moderate' ? 'bg-yellow-400' : 'bg-red-400'}`} />
                    <p className="text-[11px] font-bold font-mono text-foreground uppercase">{skill.verificationTier}</p>
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground">{formatDateShort(skill.verifiedAt)}</p>
                </div>
              </div>
              
              {/* Evidence Log */}
              {skill.evidenceLog?.reason && (
                <div className="mt-1 p-2 rounded-lg bg-black/20 border border-border/30">
                  <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                    <span className="text-accent mr-1">Evidence:</span> 
                    {skill.evidenceLog.reason}
                  </p>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}