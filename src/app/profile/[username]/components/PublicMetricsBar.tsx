'use client';

import React, { useEffect, useState } from 'react';
import { Award, GitCommit, BookOpen, Zap, Target, Shield, Hexagon } from 'lucide-react';
import { useProfile } from '../ProfileContext';
import { createClient } from '@/lib/supabase/client';
import { SkillCredential } from '@/lib/types';
import Icon from '@/components/ui/AppIcon';

export default function PublicMetricsBar() {
  const { profileUser: user } = useProfile();
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
          category: '',
        })));
      }
    };
    fetchSkills();
  }, [user]);

  const masterCount = skills?.filter(s => s?.proficiency === 'Master')?.length || 0;
  const avgConfidence = skills?.length
    ? (skills.reduce((acc, s) => acc + s.confidence, 0) / skills.length).toFixed(1)
    : '0.0';

  const metrics = [
    { id: 'pm-credentials', icon: Award, label: 'Credentials', value: skills?.length?.toString() || '0', color: 'text-accent', border: 'border-accent/20', bg: 'bg-accent/5' },
    { id: 'pm-master', icon: Zap, label: 'Master Tier', value: masterCount?.toString(), color: 'text-yellow-400', border: 'border-yellow-400/20', bg: 'bg-yellow-400/5' },
    { id: 'pm-confidence', icon: Award, label: 'Avg Confidence', value: `${avgConfidence}%`, color: 'text-cyan', border: 'border-cyan/20', bg: 'bg-cyan/5' },
    { id: 'pm-repos', icon: BookOpen, label: 'Repositories', value: user?.repoCount?.toString() || '0', color: 'text-primary', border: 'border-primary/20', bg: 'bg-primary/5' },
    { id: 'pm-commits', icon: GitCommit, label: 'Total Commits', value: user?.commitCount?.toLocaleString() || '0', color: 'text-green-400', border: 'border-green-400/20', bg: 'bg-green-400/5' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {metrics?.map((m) => {
        const Icon = m?.icon;
        return (
          <div
            key={m?.id}
            className={`glass-card rounded-xl p-4 border ${m?.border} ${m?.bg} flex items-center gap-3`}
          >
            <Icon size={16} className={m?.color} />
            <div>
              <p className={`text-lg font-black font-mono tabular-nums ${m?.color}`}>{m?.value}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{m?.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}