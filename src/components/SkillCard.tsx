'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SkillCredential } from '@/lib/types';
import TierBadge from './TierBadge';
import ProofHashDisplay from './ProofHashDisplay';
import { CheckCircle2, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

function ProofToggle({ hash }: { hash: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
      >
        {open ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        {open ? 'Hide Proof' : 'View Proof'}
      </button>
      {open && (
        <div className="mt-1.5 p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <ProofHashDisplay hash={hash} />
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const TIER_GLOW: Record<string, string> = {
  Novice: 'rgba(16,185,129,0.25)',
  Practitioner: 'rgba(59,130,246,0.25)',
  Expert: 'rgba(139,92,246,0.25)',
  Master: 'rgba(245,158,11,0.25)',
};

const TIER_BORDER: Record<string, string> = {
  Novice: 'rgba(16,185,129,0.3)',
  Practitioner: 'rgba(59,130,246,0.3)',
  Expert: 'rgba(139,92,246,0.3)',
  Master: 'rgba(245,158,11,0.3)',
};

export default function SkillCard({ skill, index }: { skill: SkillCredential; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass-card rounded-xl p-4 cursor-default group transition-all duration-300 relative overflow-hidden"
      style={{
        borderColor: TIER_BORDER[skill.proficiency],
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${TIER_GLOW[skill.proficiency]}, 0 0 60px ${TIER_GLOW[skill.proficiency].replace('0.25', '0.1')}`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '';
      }}
    >
      {/* Subtle top gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${TIER_BORDER[skill.proficiency]}, transparent)`,
        }}
      />

      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{skill.skillName}</p>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mt-0.5">{skill.category}</p>
        </div>
        <TierBadge tier={skill.proficiency} size="md" />
      </div>

      {/* Confidence bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-muted-foreground font-mono">CONFIDENCE</span>
          <span className="text-xs font-bold font-mono" style={{ color: TIER_BORDER[skill.proficiency].replace('0.3', '1') }}>
            {skill.confidence.toFixed(1)}%
          </span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${skill.confidence}%` }}
            transition={{ delay: index * 0.07 + 0.3, duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${TIER_BORDER[skill.proficiency].replace('0.3', '0.8')}, ${TIER_BORDER[skill.proficiency].replace('0.3', '1')})`,
            }}
          />
        </div>
      </div>

      {/* Proof hash — collapsible to reduce clutter */}
      <ProofToggle hash={skill.proofHash} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
          <Calendar size={9} />
          <span>{formatDate(skill.verifiedAt)}</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 size={10} className="text-cyan" />
          <span className="text-[10px] font-mono text-cyan uppercase tracking-wider">Verified</span>
        </div>
      </div>
    </motion.div>
  );
}