'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Award, Zap, CheckCircle2 } from 'lucide-react';
import { useUser } from '@/lib/contexts/UserContext';
import { createClient } from '@/lib/supabase/client';
import dynamic from 'next/dynamic';

const TrustRadialChart = dynamic(() => import('./TrustRadialChart'), { ssr: false });

export default function TrustScoreCard() {
  const { user } = useUser();
  const [skillCount, setSkillCount] = useState(0);
  const [miningRuns, setMiningRuns] = useState(0);
  const scorePercent = ((user?.trustScore || 0) / 1000) * 100;

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const supabase = createClient();
      const { data: skills } = await supabase
        .from('skills')
        .select('id')
        .eq('user_id', user.uid);
      setSkillCount(skills?.length || 0);

      const { data: activities } = await supabase
        .from('activities')
        .select('id')
        .eq('user_id', user.uid)
        .eq('type', 'mining');
      setMiningRuns(activities?.length || 0);
    };
    fetchStats();
  }, [user]);

  const verifiedPct = skillCount > 0 ? '100%' : '0%';

  return (
    <div className="glass-card rounded-2xl p-6 h-full relative overflow-hidden border border-primary/20 glow-border-blue">
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-48 h-48 opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.8) 0%, transparent 70%)' }}
      />
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">TRUU Trust Score</p>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black font-mono tabular-nums text-gradient-blue">{user?.trustScore || 0}</span>
            <span className="text-lg font-mono text-muted-foreground mb-1">/1000</span>
          </div>
          {miningRuns > 0 ? (
            <div className="flex items-center gap-1.5 mt-1">
              <CheckCircle2 size={12} className="text-green-400" />
              <span className="text-xs font-mono text-green-400">Last mined today</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-1">
              <TrendingUp size={12} className="text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground">Run miner to build score</span>
            </div>
          )}
        </div>
        <div className="w-28 h-28">
          <TrustRadialChart score={user?.trustScore} />
        </div>
      </div>
      {/* Score breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Award, label: 'Credentials', value: skillCount.toString(), color: 'text-accent' },
          { icon: Shield, label: 'Verified', value: verifiedPct, color: 'text-cyan' },
          { icon: Zap, label: 'Mining Runs', value: miningRuns.toString(), color: 'text-primary' },
        ]?.map(({ icon: Icon, label, value, color }) => (
          <div key={`score-breakdown-${label}`} className="p-3 rounded-xl bg-white/[0.03] border border-border/50 text-center">
            <Icon size={14} className={`${color} mx-auto mb-1`} />
            <p className={`text-base font-black font-mono tabular-nums ${color}`}>{value}</p>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{label}</p>
          </div>
        ))}
      </div>
      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-1.5">
          <span>PROGRESS TO ELITE (900+)</span>
          <span className="text-primary">{scorePercent?.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${scorePercent}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          />
        </div>
      </div>
    </div>
  );
}