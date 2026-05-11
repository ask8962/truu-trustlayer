'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Swords, Award, GitCommit, BookOpen, Crown, ArrowRight, Share2, Copy, CheckCircle2, Zap } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface UserProfile {
  uid: string;
  github_username: string;
  display_name: string;
  avatar_url: string;
  repo_count: number;
  commit_count: number;
  trust_score?: number;
}

interface Skill {
  id: string;
  skill_name: string;
  proficiency_level: string;
  confidence: number;
}

interface UserData {
  user: UserProfile;
  skills: Skill[];
}

interface Props {
  data1: UserData;
  data2: UserData;
  username1: string;
  username2: string;
}

const TIER_RANK: Record<string, number> = {
  Master: 4,
  Expert: 3,
  Practitioner: 2,
  Novice: 1,
};

const TIER_COLOR: Record<string, string> = {
  Master: '#F59E0B',
  Expert: '#8B5CF6',
  Practitioner: '#3B82F6',
  Novice: '#10B981',
};

function getAvgConfidence(skills: Skill[]) {
  if (skills.length === 0) return 0;
  return Math.round((skills.reduce((acc, s) => acc + (s.confidence || 0), 0) / skills.length) * 10) / 10;
}

function getTrustScore(user: UserProfile, skills: Skill[]) {
  return user.trust_score || skills.length * 50;
}

function getWinner(v1: number, v2: number): 0 | 1 | 2 {
  if (v1 > v2) return 1;
  if (v2 > v1) return 2;
  return 0;
}

export default function SkillDuelView({ data1, data2, username1, username2 }: Props) {
  const [copied, setCopied] = useState(false);
  const { user: u1, skills: s1 } = data1;
  const { user: u2, skills: s2 } = data2;

  const score1 = getTrustScore(u1, s1);
  const score2 = getTrustScore(u2, s2);
  const conf1 = getAvgConfidence(s1);
  const conf2 = getAvgConfidence(s2);

  // Build unified skill comparison
  const allSkillNames = new Set([...s1.map(s => s.skill_name), ...s2.map(s => s.skill_name)]);
  const skillComparisons = Array.from(allSkillNames).map(name => {
    const skill1 = s1.find(s => s.skill_name === name);
    const skill2 = s2.find(s => s.skill_name === name);
    return { name, skill1, skill2 };
  }).sort((a, b) => {
    const maxA = Math.max(TIER_RANK[a.skill1?.proficiency_level || ''] || 0, TIER_RANK[a.skill2?.proficiency_level || ''] || 0);
    const maxB = Math.max(TIER_RANK[b.skill1?.proficiency_level || ''] || 0, TIER_RANK[b.skill2?.proficiency_level || ''] || 0);
    return maxB - maxA;
  });

  // Count wins
  let wins1 = 0, wins2 = 0;
  skillComparisons.forEach(({ skill1, skill2 }) => {
    const r1 = TIER_RANK[skill1?.proficiency_level || ''] || 0;
    const r2 = TIER_RANK[skill2?.proficiency_level || ''] || 0;
    if (r1 > r2) wins1++;
    if (r2 > r1) wins2++;
  });

  const overallWinner = score1 > score2 ? 1 : score2 > score1 ? 2 : 0;
  const duelUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/compare/${username1}-vs-${username2}`
    : '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(duelUrl);
    setCopied(true);
    toast.success('Duel link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const text = `⚔️ Skill Duel: @${username1} vs @${username2}\n\nWho's the better developer? AI-verified comparison on @truu_id 👇`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(duelUrl)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="border-b border-border/50 bg-[var(--background)]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Swords size={18} className="text-primary" />
            <span className="font-bold text-sm">TRUU Skill Duel</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-muted-foreground hover:text-foreground border border-border/50 hover:border-border transition-all"
            >
              {copied ? <CheckCircle2 size={12} className="text-green-400" /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={handleShareTwitter}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
            >
              <Share2 size={12} />
              Share
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-5 border border-border/50">
            <Swords size={14} className="text-primary" />
            <span className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">AI-Verified Skill Comparison</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            <span className="text-primary">{u1.display_name || username1}</span>
            <span className="text-muted-foreground mx-3">vs</span>
            <span className="text-accent">{u2.display_name || username2}</span>
          </h1>
        </motion.div>

        {/* Score Cards */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mb-10">
          {/* Player 1 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`glass-card rounded-2xl p-6 border ${overallWinner === 1 ? 'border-primary/50 glow-blue' : 'border-border/50'}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <img src={u1.avatar_url} alt={username1} className="w-12 h-12 rounded-full border-2 border-primary/30" />
              <div>
                <p className="font-bold text-sm">{u1.display_name || username1}</p>
                <p className="text-[10px] font-mono text-muted-foreground">@{username1}</p>
              </div>
              {overallWinner === 1 && <Crown size={18} className="text-yellow-400 ml-auto" />}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className={`text-xl font-black font-mono ${getWinner(score1, score2) === 1 ? 'text-primary' : 'text-muted-foreground'}`}>{score1}</p>
                <p className="text-[9px] font-mono text-muted-foreground">Trust Score</p>
              </div>
              <div className="text-center">
                <p className={`text-xl font-black font-mono ${getWinner(s1.length, s2.length) === 1 ? 'text-primary' : 'text-muted-foreground'}`}>{s1.length}</p>
                <p className="text-[9px] font-mono text-muted-foreground">Skills</p>
              </div>
              <div className="text-center">
                <p className={`text-xl font-black font-mono ${getWinner(conf1, conf2) === 1 ? 'text-primary' : 'text-muted-foreground'}`}>{conf1}%</p>
                <p className="text-[9px] font-mono text-muted-foreground">Confidence</p>
              </div>
            </div>
          </motion.div>

          {/* VS Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="flex items-center justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-border flex items-center justify-center">
              <span className="text-lg font-black text-gradient-full">VS</span>
            </div>
          </motion.div>

          {/* Player 2 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`glass-card rounded-2xl p-6 border ${overallWinner === 2 ? 'border-accent/50 glow-purple' : 'border-border/50'}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <img src={u2.avatar_url} alt={username2} className="w-12 h-12 rounded-full border-2 border-accent/30" />
              <div>
                <p className="font-bold text-sm">{u2.display_name || username2}</p>
                <p className="text-[10px] font-mono text-muted-foreground">@{username2}</p>
              </div>
              {overallWinner === 2 && <Crown size={18} className="text-yellow-400 ml-auto" />}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className={`text-xl font-black font-mono ${getWinner(score1, score2) === 2 ? 'text-accent' : 'text-muted-foreground'}`}>{score2}</p>
                <p className="text-[9px] font-mono text-muted-foreground">Trust Score</p>
              </div>
              <div className="text-center">
                <p className={`text-xl font-black font-mono ${getWinner(s1.length, s2.length) === 2 ? 'text-accent' : 'text-muted-foreground'}`}>{s2.length}</p>
                <p className="text-[9px] font-mono text-muted-foreground">Skills</p>
              </div>
              <div className="text-center">
                <p className={`text-xl font-black font-mono ${getWinner(conf1, conf2) === 2 ? 'text-accent' : 'text-muted-foreground'}`}>{conf2}%</p>
                <p className="text-[9px] font-mono text-muted-foreground">Confidence</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10"
        >
          <StatCard
            label="Repos"
            v1={u1.repo_count || 0}
            v2={u2.repo_count || 0}
          />
          <StatCard
            label="Commits"
            v1={u1.commit_count || 0}
            v2={u2.commit_count || 0}
          />
          <StatCard
            label="Skill Wins"
            v1={wins1}
            v2={wins2}
          />
          <StatCard
            label="Avg Confidence"
            v1={conf1}
            v2={conf2}
            suffix="%"
          />
        </motion.div>

        {/* Skill-by-Skill Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Award size={16} className="text-primary" />
            <h2 className="text-lg font-bold">Skill-by-Skill Breakdown</h2>
            <span className="text-[10px] font-mono text-muted-foreground bg-white/5 border border-border px-2 py-0.5 rounded-full">
              {skillComparisons.length} skills
            </span>
          </div>

          <div className="space-y-2">
            {skillComparisons.map(({ name, skill1, skill2 }, i) => {
              const r1 = TIER_RANK[skill1?.proficiency_level || ''] || 0;
              const r2 = TIER_RANK[skill2?.proficiency_level || ''] || 0;
              const winner = r1 > r2 ? 1 : r2 > r1 ? 2 : r1 === r2 && r1 > 0 ? 0 : -1;

              return (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.03 }}
                  className="glass-card rounded-xl p-4 border border-border/50 grid grid-cols-[1fr_auto_1fr] gap-3 items-center"
                >
                  {/* Player 1 skill */}
                  <div className="text-right">
                    {skill1 ? (
                      <div className="flex items-center justify-end gap-2">
                        {winner === 1 && <Trophy size={12} className="text-yellow-400" />}
                        <span className="text-xs font-mono" style={{ color: TIER_COLOR[skill1.proficiency_level] || 'var(--muted-foreground)' }}>
                          {skill1.proficiency_level}
                        </span>
                        <div className="w-12 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${skill1.confidence}%`,
                              background: TIER_COLOR[skill1.proficiency_level] || 'var(--primary)',
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-muted-foreground/40">—</span>
                    )}
                  </div>

                  {/* Skill Name */}
                  <div className="text-center min-w-[100px]">
                    <span className="text-xs font-semibold">{name}</span>
                  </div>

                  {/* Player 2 skill */}
                  <div className="text-left">
                    {skill2 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${skill2.confidence}%`,
                              background: TIER_COLOR[skill2.proficiency_level] || 'var(--accent)',
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono" style={{ color: TIER_COLOR[skill2.proficiency_level] || 'var(--muted-foreground)' }}>
                          {skill2.proficiency_level}
                        </span>
                        {winner === 2 && <Trophy size={12} className="text-yellow-400" />}
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-muted-foreground/40">—</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="glass-card rounded-2xl p-8 border border-border/50 max-w-lg mx-auto">
            <Zap size={24} className="text-primary mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-2">Challenge a Friend</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Send them this link and see how you compare. Every duel starts with a TRUU passport.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleCopy}
                className="btn-ghost flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
              >
                <Copy size={14} />
                Copy Duel Link
              </button>
              <a
                href="/"
                className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
              >
                Create My Passport
                <ArrowRight size={14} className="relative z-10" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <Link href="/" className="text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors">
            ← Back to TRUU
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, v1, v2, suffix = '' }: { label: string; v1: number; v2: number; suffix?: string }) {
  const winner = v1 > v2 ? 1 : v2 > v1 ? 2 : 0;
  return (
    <div className="glass-card rounded-xl p-4 border border-border/50">
      <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
      <div className="flex items-center justify-between">
        <span className={`text-lg font-black font-mono ${winner === 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          {v1.toLocaleString()}{suffix}
        </span>
        <span className="text-[9px] font-mono text-muted-foreground/50">vs</span>
        <span className={`text-lg font-black font-mono ${winner === 2 ? 'text-accent' : 'text-muted-foreground'}`}>
          {v2.toLocaleString()}{suffix}
        </span>
      </div>
    </div>
  );
}
