'use client';

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { MINING_FREQUENCY_DATA } from '@/lib/mockData';

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-bright rounded-xl p-3 border shadow-card-dark text-xs font-mono">
      <p className="text-muted-foreground mb-2 uppercase tracking-wider text-[10px]">{label}</p>
      {payload.map((entry) => (
        <div key={`bar-tooltip-${entry.name}`} className="flex items-center gap-2 mb-1">
          <span className="text-muted-foreground capitalize">{entry.name}:</span>
          <span className="text-foreground font-bold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

const BAR_COLORS = ['#3B82F6', '#8B5CF6', '#3B82F6', '#06B6D4', '#8B5CF6', '#3B82F6', '#06B6D4'];

export default function MiningFrequencyChart() {
  const data = MINING_FREQUENCY_DATA.length > 0 ? MINING_FREQUENCY_DATA : [{ day: 'Mon', events: 0, commits: 0 }];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="commits" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={`bar-cell-${i}`} fill={BAR_COLORS[i % BAR_COLORS.length]} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}