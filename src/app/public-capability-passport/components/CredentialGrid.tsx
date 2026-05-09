'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/lib/contexts/UserContext';
import { createClient } from '@/lib/supabase/client';
import { SkillCredential } from '@/lib/types';
import SkillCard from '@/components/SkillCard';
import { Filter } from 'lucide-react';

const CATEGORIES = ['All', 'Language', 'Framework', 'Architecture', 'Database', 'DevOps'] as const;
type Category = typeof CATEGORIES[number];

export default function CredentialGrid() {
  const { user } = useUser();
  const [category, setCategory] = useState<Category>('All');
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

  const filtered = category === 'All'
    ? skills
    : skills.filter(s => s.category === category);

  return (
    <div>
      {/* Category filter */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <Filter size={12} className="text-muted-foreground" />
        {CATEGORIES.map((cat) => (
          <button
            key={`cred-cat-${cat}`}
            onClick={() => setCategory(cat)}
            className={`text-[11px] font-mono px-3 py-1.5 rounded-full border transition-all duration-150 ${
              category === cat
                ? 'bg-accent/15 border-accent/40 text-accent' :'border-border text-muted-foreground hover:text-foreground hover:border-white/20'
            }`}
          >
            {cat}
            {cat !== 'All' && (
              <span className="ml-1.5 opacity-60">
                {skills.filter(s => s.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl border border-border/50">
          <p className="text-sm text-muted-foreground">No {category === 'All' ? '' : category} credentials yet</p>
          <p className="text-[10px] text-muted-foreground mt-1">Run the Ambient Miner to discover skills</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
          {filtered.map((skill, i) => (
            <SkillCard key={skill.id} skill={skill} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}