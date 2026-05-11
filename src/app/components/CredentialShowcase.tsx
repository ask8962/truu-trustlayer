'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, Copy, Zap, Star, Crown } from 'lucide-react';
import { toast } from 'sonner';

const SHOWCASE_CREDENTIALS = [
  { skill: 'TypeScript', tier: 'Expert', tierIcon: Star, confidence: 96.4, hash: '0x7f4a9c2e1b8d3f6a0e5c2b9d4a1f8e3c7b0d5a2e', date: '2026-05-07', color: 'rgba(139,92,246,0.5)', glow: 'rgba(139,92,246,0.2)' },
  { skill: 'React', tier: 'Master', tierIcon: Crown, confidence: 98.1, hash: '0x1c4e7a0f3b6d9c2e5a8b1d4f7c0e3a6b9d2f5c8e', date: '2026-05-05', color: 'rgba(6,182,212,0.5)', glow: 'rgba(6,182,212,0.2)' },
  { skill: 'Distributed Systems', tier: 'Expert', tierIcon: Star, confidence: 89.7, hash: '0x5e8c1f4a7b0e3d6c9f2a5b8e1c4f7a0d3b6e9c2f', date: '2026-05-03', color: 'rgba(59,130,246,0.5)', glow: 'rgba(59,130,246,0.2)' },
];

export default function CredentialShowcase() {
  const handleCopyHash = async (hash: string) => {
    await navigator.clipboard.writeText(hash);
    toast.success('Proof hash copied');
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div
        className="ambient-blob w-[600px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10"
        style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.5) 0%, transparent 70%)' }}
      />

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Verified Skill Credentials</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">
            Not a certificate.{' '}
            <span className="text-gradient-purple">AI-verified proof.</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-base">
            Every credential is backed by AI analysis of your actual commit history, code patterns, and contribution quality. Verifiable by anyone, forever.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SHOWCASE_CREDENTIALS.map((cred, i) => {
            const TierIcon = cred.tierIcon;
            return (
              <motion.div
                key={`showcase-${cred.skill}`}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="glass-card-bright rounded-2xl p-6 cursor-default relative overflow-hidden transition-all duration-300"
                style={{ borderColor: cred.color }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 40px ${cred.glow}, 0 20px 60px rgba(0,0,0,0.4)`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '';
                }}
              >
                {/* Top gradient */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${cred.color}, transparent)` }}
                />

                {/* Scan line animation */}
                <div
                  className="absolute left-0 right-0 h-px animate-scan opacity-60"
                  style={{ background: `linear-gradient(90deg, transparent, ${cred.color}, transparent)`, animationDelay: `${i * 0.8}s` }}
                />

                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">TRUU CREDENTIAL</p>
                    <p className="text-lg font-bold text-foreground">{cred.skill}</p>
                  </div>
                  <div
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider"
                    style={{ background: `${cred.color.replace('0.5', '0.15')}`, border: `1px solid ${cred.color}`, color: cred.color.replace('rgba(', '').replace(', 0.5)', '') }}
                  >
                    <TierIcon size={9} />
                    {cred.tier}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-1.5">
                    <span>CONFIDENCE</span>
                    <span className="font-bold" style={{ color: cred.color.replace('0.5', '1') }}>{cred.confidence}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${cred.confidence}%`, background: `linear-gradient(90deg, ${cred.color.replace('0.5', '0.6')}, ${cred.color.replace('0.5', '1')})` }}
                    />
                  </div>
                </div>

                <div
                  className="p-3 rounded-xl mb-4 group cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  onClick={() => handleCopyHash(cred.hash)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">PROOF HASH</p>
                    <Copy size={10} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <p className="proof-hash text-muted-foreground break-all leading-relaxed">{cred.hash}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                    <Shield size={9} />
                    <span>Verified {cred.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-cyan">
                    <CheckCircle2 size={9} />
                    <span className="uppercase tracking-wider">Valid</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-10"
        >
          <p className="text-xs text-muted-foreground font-mono flex items-center justify-center gap-2">
            <Zap size={11} className="text-cyan" />
            Credentials are generated by AI analysis of your commit history, language usage, and code patterns
          </p>
        </motion.div>
      </div>
    </section>
  );
}