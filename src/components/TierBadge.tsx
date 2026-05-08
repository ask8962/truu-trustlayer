import React from 'react';
import { Shield, Zap, Star, Crown } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';



type Tier = 'Novice' | 'Practitioner' | 'Expert' | 'Master';

const TIER_CONFIG: Record<Tier, { icon: React.ElementType; label: string; className: string; glow: string }> = {
  Novice: {
    icon: Shield,
    label: 'Novice',
    className: 'bg-tier-novice border tier-novice',
    glow: 'rgba(16,185,129,0.4)',
  },
  Practitioner: {
    icon: Zap,
    label: 'Practitioner',
    className: 'bg-tier-practitioner border tier-practitioner',
    glow: 'rgba(59,130,246,0.4)',
  },
  Expert: {
    icon: Star,
    label: 'Expert',
    className: 'bg-tier-expert border tier-expert',
    glow: 'rgba(139,92,246,0.4)',
  },
  Master: {
    icon: Crown,
    label: 'Master',
    className: 'bg-tier-master border tier-master',
    glow: 'rgba(245,158,11,0.4)',
  },
};

export default function TierBadge({ tier, size = 'sm' }: { tier: Tier; size?: 'sm' | 'md' }) {
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;
  const isLg = size === 'md';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono font-semibold ${config.className} ${isLg ? 'text-xs' : 'text-[10px]'}`}
      style={{ fontSize: isLg ? '0.7rem' : '0.6rem', letterSpacing: '0.08em' }}
    >
      <Icon size={isLg ? 10 : 8} />
      {config.label.toUpperCase()}
    </span>
  );
}