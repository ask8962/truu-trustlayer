'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Play, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateMiningSkills } from '@/lib/mockData';
import { createClient } from '@/lib/supabase/client';

type MiningState = 'idle' | 'running' | 'complete';

export default function AmbientMinerCard() {
  const [miningState, setMiningState] = useState<MiningState>('idle');
  const [progress, setProgress] = useState(0);
  const [detectedCount, setDetectedCount] = useState(0);

  const runMiner = async () => {
    setMiningState('running');
    setProgress(0);

    // Simulate progress
    const steps = [15, 32, 48, 65, 78, 91, 100];
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 400));
      setProgress(steps[i]);
    }

    const detected = generateMiningSkills();
    setDetectedCount(detected.length);

    // Backend integration point — save mining activity to Supabase
    try {
      const supabase = createClient();
      await supabase.from('activities').insert({
        user_id: 'user-dev-001', // Replace with real UUID when auth is connected
        type: 'mining',
        message: `Ambient miner completed — ${detected.length} new skill detections`,
      });
    } catch {
      // Supabase not configured or table missing — UI-only mode
    }

    setMiningState('complete');
    toast.success(`Mining complete — ${detected.length} new skill detections`, {
      description: 'Your Trust Score has been updated.',
    });

    setTimeout(() => {
      setMiningState('idle');
      setProgress(0);
    }, 4000);
  };

  return (
    <div className="glass-card rounded-2xl p-5 h-full border border-accent/20 relative overflow-hidden">
      {/* Background pulse when running */}
      <AnimatePresence>
        {miningState === 'running' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.08) 0%, transparent 70%)' }}
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-accent" />
          <span className="text-sm font-semibold">Ambient Miner</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider ${
          miningState === 'running' ?'bg-accent/10 border border-accent/30 text-accent'
            : miningState === 'complete' ?'bg-green-500/10 border border-green-500/30 text-green-400' :'bg-white/5 border border-border text-muted-foreground'
        }`}>
          {miningState === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />}
          {miningState === 'complete' && <CheckCircle2 size={9} />}
          {miningState === 'idle' && <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />}
          {miningState === 'idle' ? 'Ready' : miningState === 'running' ? 'Mining' : 'Done'}
        </div>
      </div>

      {/* Mining visualization */}
      <div className="relative h-24 mb-5 rounded-xl bg-white/[0.02] border border-border/50 overflow-hidden flex items-center justify-center">
        {miningState === 'idle' && (
          <div className="text-center">
            <Cpu size={24} className="text-muted-foreground mx-auto mb-1 opacity-40" />
            <p className="text-[10px] font-mono text-muted-foreground">Awaiting activation</p>
          </div>
        )}
        {miningState === 'running' && (
          <div className="w-full px-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-accent">Analyzing commits...</span>
              <span className="text-[10px] font-mono text-accent font-bold">{progress}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
              />
            </div>
            <div className="mt-3 flex gap-1 flex-wrap">
              {['TypeScript', 'React', 'Node.js', 'Go'].map((lang, i) => (
                <motion.span
                  key={`mining-lang-${lang}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: progress > i * 25 ? 1 : 0.2, scale: progress > i * 25 ? 1 : 0.8 }}
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-accent/15 border border-accent/30 text-accent"
                >
                  {lang}
                </motion.span>
              ))}
            </div>
          </div>
        )}
        {miningState === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <CheckCircle2 size={24} className="text-green-400 mx-auto mb-1" />
            <p className="text-xs font-mono text-green-400 font-bold">{detectedCount} skills detected</p>
          </motion.div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: 'Total Runs', value: '0', color: 'text-accent' },
          { label: 'Skills Found', value: '0', color: 'text-primary' },
        ].map(({ label, value, color }) => (
          <div key={`miner-stat-${label}`} className="p-2.5 rounded-lg bg-white/[0.02] border border-border/50 text-center">
            <p className={`text-lg font-black font-mono ${color}`}>{value}</p>
            <p className="text-[10px] text-muted-foreground font-mono">{label}</p>
          </div>
        ))}
      </div>

      <button
        onClick={runMiner}
        disabled={miningState !== 'idle'}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 relative z-10 ${
          miningState === 'idle' ?'btn-primary' :'bg-white/5 border border-border text-muted-foreground cursor-not-allowed'
        }`}
      >
        {miningState === 'idle' && (
          <>
            <Play size={14} className="relative z-10" />
            <span className="relative z-10">Run Ambient Miner</span>
          </>
        )}
        {miningState === 'running' && (
          <>
            <Loader2 size={14} className="animate-spin" />
            <span>Mining in progress...</span>
          </>
        )}
        {miningState === 'complete' && (
          <>
            <CheckCircle2 size={14} />
            <span>Mining Complete</span>
          </>
        )}
      </button>
    </div>
  );
}