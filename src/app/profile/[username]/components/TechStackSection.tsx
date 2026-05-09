'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import { useUser } from '@/lib/contexts/UserContext';
import { createClient } from '@/lib/supabase/client';
import { SkillCredential } from '@/lib/types';

const CATEGORY_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  Language: { text: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/25' },
  Framework: { text: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/25' },
  Architecture: { text: 'text-cyan', bg: 'bg-cyan/10', border: 'border-cyan/25' },
  Database: { text: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/25' },
  DevOps: { text: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/25' },
  Runtime: { text: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/25' },
  API: { text: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/25' },
};

const TIER_SIZE: Record<string, string> = {
  Master: 'text-sm px-4 py-2',
  Expert: 'text-xs px-3.5 py-1.5',
  Practitioner: 'text-xs px-3 py-1.5',
  Novice: 'text-[11px] px-2.5 py-1',
};

export default function TechStackSection() {
  const { user } = useUser();
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
        setSkills(data.map((s: Record<string, string | number>) => ({
          id: s.id as string,
          userId: s.user_id as string,
          skillName: s.skill_name as string,
          proficiency: s.proficiency_level as SkillCredential['proficiency'],
          confidence: (s.confidence as number) || 0,
          proofHash: (s.proof_jwt as string) || '',
          verifiedAt: s.created_at as string,
          category: (s.category as string) || 'Language',
        })));
      }
    };
    fetchSkills();
  }, [user]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <Layers size={16} className="text-muted-foreground" />
        <h2 className="text-lg font-bold text-foreground">Verified Tech Stack</h2>
        <span className="text-[10px] font-mono text-muted-foreground bg-white/5 border border-border px-2 py-1 rounded-full">
          {skills.length} technologies
        </span>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-border/50">
        {skills.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 text-center">
            <Layers size={24} className="text-muted-foreground opacity-30 mb-2" />
            <p className="text-xs text-muted-foreground">No verified skills yet. Run the Ambient Miner to detect your tech stack.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill, i) => {
                const colors = CATEGORY_COLORS[skill.category] || CATEGORY_COLORS['Language'];
                const sizeClass = TIER_SIZE[skill.proficiency] || TIER_SIZE['Practitioner'];
                return (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.08, y: -2 }}
                    className={`inline-flex items-center gap-2 rounded-xl border font-mono font-semibold cursor-default transition-all duration-150 ${colors.text} ${colors.bg} ${colors.border} ${sizeClass}`}
                    title={`${skill.proficiency} — ${skill.confidence.toFixed(1)}% confidence`}
                  >
                    <span>{skill.skillName}</span>
                    <span className="opacity-60 text-[9px] font-bold uppercase tracking-wider">
                      {skill.confidence.toFixed(0)}%
                    </span>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 pt-5 border-t border-border/50 flex flex-wrap gap-4">
              {Object.entries(CATEGORY_COLORS).slice(0, 5).map(([cat, colors]) => {
                const count = skills.filter(s => s.category === cat).length;
                if (count === 0) return null;
                return (
                  <div key={`tech-cat-${cat}`} className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${colors.bg} border ${colors.border}`} style={{ background: 'currentColor' }} />
                    <span className="text-[11px] font-mono text-muted-foreground">{cat}: {count}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}