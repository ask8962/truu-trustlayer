'use client';

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { SKILL_GROWTH_DATA } from '@/lib/mockData';

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-bright rounded-xl p-3 border shadow-card-dark text-xs font-mono">
      <p className="text-muted-foreground mb-2 uppercase tracking-wider text-[10px]">{label}</p>
      {payload.map((entry) => (
        <div key={`tooltip-${entry.name}`} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-muted-foreground capitalize">{entry.name}:</span>
          <span className="text-foreground font-bold">{entry.value}{entry.name === 'confidence' ? '%' : ''}</span>
        </div>
      ))}
    </div>
  );
}

export default function SkillGrowthChart() {
  // Analytics data will be populated once the AI miner runs
  const data = SKILL_GROWTH_DATA.length > 0 ? SKILL_GROWTH_DATA : [{ week: 'Now', skills: 0, confidence: 0 }];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="skillsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--cyan)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--cyan)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="week"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted-foreground)' }}
        />
        <Area
          type="monotone"
          dataKey="skills"
          stroke="var(--accent)"
          strokeWidth={2}
          fill="url(#skillsGradient)"
          dot={{ fill: 'var(--accent)', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: 'var(--accent)' }}
        />
        <Area
          type="monotone"
          dataKey="confidence"
          stroke="var(--cyan)"
          strokeWidth={2}
          fill="url(#confidenceGradient)"
          dot={{ fill: 'var(--cyan)', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: 'var(--cyan)' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}