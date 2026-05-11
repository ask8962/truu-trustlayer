'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Play, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/lib/contexts/UserContext';
import { createClient } from '@/lib/supabase/client';
import ShareProfileButton from '@/components/ShareProfileButton';

type MiningState = 'idle' | 'running' | 'complete' | 'error';

export default function AmbientMinerCard() {
  const { user } = useUser();
  const [miningState, setMiningState] = useState<MiningState>('idle');
  const [progress, setProgress] = useState(0);
  const [detectedCount, setDetectedCount] = useState(0);
  const [totalRuns, setTotalRuns] = useState(0);
  const [skillsFound, setSkillsFound] = useState(0);
  const [liveSkills, setLiveSkills] = useState<string[]>([]);
  const [showShareCta, setShowShareCta] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<string | null>(null);

  // Fetch stats from Supabase on mount
  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const supabase = createClient();
      // Count mining activities (total runs)
      const { data: activities } = await supabase
        .from('activities')
        .select('id')
        .eq('user_id', user.uid)
        .eq('type', 'mining');
      const runs = activities?.length || 0;
      setTotalRuns(runs);

      // Count skills
      const { data: skills } = await supabase
        .from('skills')
        .select('id')
        .eq('user_id', user.uid);
      const found = skills?.length || 0;
      setSkillsFound(found);

      // Check cache
      const { data: cache } = await supabase
        .from('mined_profiles')
        .select('mined_at')
        .eq('user_id', user.uid)
        .single();
      
      if (cache) {
        setLastAnalyzed(new Date(cache.mined_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }));
      }

      // Auto-mine on first visit (no runs + no skills = brand new user)
      if (runs === 0 && found === 0 && !cache && miningState === 'idle') {
        // Small delay so UI renders first
        setTimeout(() => runMiner(false), 1500);
      }
    };
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const runMiner = async (force = true) => {
    setMiningState('running');
    setProgress(0);
    setLiveSkills([]);

    // Animate progress while the API works
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev; // Hold at 90% until API responds
        return prev + Math.random() * 8;
      });
    }, 600);

    try {
      const res = await fetch('/api/mine', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force })
      });
      const data = await res.json();

      clearInterval(progressInterval);

      if (!res.ok) {
        throw new Error(data.error || 'Mining failed');
      }

      // Animate to 100%
      setProgress(100);
      setDetectedCount(data.skills_detected);
      setSkillsFound(data.skills_detected);
      setLastAnalyzed(new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }));
      if (!data.cached) {
        setTotalRuns(prev => prev + 1);
      }
      setShowShareCta(true);

      // Show detected skill names in the animation
      if (data.skills) {
        const skillNames = data.skills.map((s: { skillName: string }) => s.skillName);
        setLiveSkills(skillNames.slice(0, 4));
      }

      setMiningState('complete');
      toast.success(`Mining complete — ${data.skills_detected} skills detected`, {
        description: `Trust Score updated to ${data.trust_score}/1000`,
      });

      setTimeout(() => {
        setMiningState('idle');
        setProgress(0);
        setLiveSkills([]);
      }, 5000);
    } catch (err) {
      clearInterval(progressInterval);
      setMiningState('error');
      const message = err instanceof Error ? err.message : 'Mining failed';
      
      // If it's our strict validation error, show a more prominent warning
      if (message.includes('Insufficient activity')) {
        toast.warning('Verification Rejected', { 
          description: message,
          duration: 8000,
        });
      } else {
        toast.error('Mining failed', { description: message });
      }

      setTimeout(() => {
        setMiningState('idle');
        setProgress(0);
      }, message.includes('Insufficient activity') ? 8000 : 3000);
    }
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
          {lastAnalyzed && miningState === 'idle' && (
            <span className="text-[10px] font-mono text-muted-foreground ml-2 px-2 py-0.5 bg-white/5 rounded-full">
              Analyzed {lastAnalyzed}
            </span>
          )}
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider ${
          miningState === 'running' ?'bg-accent/10 border border-accent/30 text-accent'
            : miningState === 'complete' ?'bg-green-500/10 border border-green-500/30 text-green-400'
            : miningState === 'error' ?'bg-red-500/10 border border-red-500/30 text-red-400'
            :'bg-white/5 border border-border text-muted-foreground'
        }`}>
          {miningState === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />}
          {miningState === 'complete' && <CheckCircle2 size={9} />}
          {miningState === 'idle' && <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />}
          {miningState === 'error' && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
          {miningState === 'idle' ? 'Ready' : miningState === 'running' ? 'Mining' : miningState === 'complete' ? 'Done' : 'Error'}
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
              <span className="text-[10px] font-mono text-accent">Analyzing repos with Groq AI...</span>
              <span className="text-[10px] font-mono text-accent font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
              />
            </div>
            <div className="mt-3 flex gap-1 flex-wrap">
              {(liveSkills.length > 0 ? liveSkills : ['Scanning...', 'Analyzing...', 'Extracting...', 'Verifying...']).map((label, i) => (
                <motion.span
                  key={`mining-lang-${label}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: progress > i * 20 ? 1 : 0.2, scale: progress > i * 20 ? 1 : 0.8 }}
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-accent/15 border border-accent/30 text-accent"
                >
                  {label}
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
        {miningState === 'error' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center px-4"
          >
            <Cpu size={24} className="text-red-400 mx-auto mb-1 opacity-60" />
            <p className="text-[10px] font-mono text-red-400 leading-tight">Verification Failed. Too little activity or too many forks.</p>
          </motion.div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: 'Total Runs', value: totalRuns.toString(), color: 'text-accent' },
          { label: 'Skills Found', value: skillsFound.toString(), color: 'text-primary' },
        ].map(({ label, value, color }) => (
          <div key={`miner-stat-${label}`} className="p-2.5 rounded-lg bg-white/[0.02] border border-border/50 text-center">
            <p className={`text-lg font-black font-mono ${color}`}>{value}</p>
            <p className="text-[10px] text-muted-foreground font-mono">{label}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => runMiner(true)}
        disabled={miningState !== 'idle'}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 relative z-10 ${
          miningState === 'idle' ?'btn-primary' :'bg-white/5 border border-border text-muted-foreground cursor-not-allowed'
        }`}
      >
        {miningState === 'idle' && (
          <>
            <Play size={14} className="relative z-10" />
            <span className="relative z-10">{lastAnalyzed ? 'Re-analyze Profile' : 'Run Ambient Miner'}</span>
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
        {miningState === 'error' && (
          <span>Retry</span>
        )}
      </button>

      {/* Post-mining share CTA */}
      {showShareCta && miningState !== 'running' && (
        <div className="mt-3 p-3 rounded-xl bg-accent/5 border border-accent/20 text-center">
          <p className="text-[11px] font-mono text-accent mb-2">🎉 Skills verified! Share your passport</p>
          <ShareProfileButton username={user?.githubUsername || ''} trustScore={user?.trustScore} variant="compact" />
        </div>
      )}
    </div>
  );
}