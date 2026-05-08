'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Award, Zap } from 'lucide-react';
import { useUser } from '@/lib/contexts/UserContext';
import dynamic from 'next/dynamic';
import Icon from '@/components/ui/AppIcon';


const TrustRadialChart = dynamic(() => import('./TrustRadialChart'), { ssr: false });

export default function TrustScoreCard() {
  const { user } = useUser();
  const scorePercent = (user?.trustScore / 1000) * 100;

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
            <span className="text-5xl font-black font-mono tabular-nums text-gradient-blue">{user?.trustScore}</span>
            <span className="text-lg font-mono text-muted-foreground mb-1">/1000</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <TrendingUp size={12} className="text-green-400" />
            <span className="text-xs font-mono text-green-400">+23 pts this week</span>
          </div>
        </div>
        <div className="w-28 h-28">
          <TrustRadialChart score={user?.trustScore} />
        </div>
      </div>
      {/* Score breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Award, label: 'Credentials', value: '0', color: 'text-accent' },
          { icon: Shield, label: 'Verified', value: '0%', color: 'text-cyan' },
          { icon: Zap, label: 'Mining Runs', value: '0', color: 'text-primary' },
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