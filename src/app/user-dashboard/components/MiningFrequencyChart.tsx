'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { useUser } from '@/lib/contexts/UserContext';
import { createClient } from '@/lib/supabase/client';
import { Cpu } from 'lucide-react';

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
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface MiningDay {
  day: string;
  runs: number;
}

export default function MiningFrequencyChart() {
  const { user } = useUser();
  const [data, setData] = useState<MiningDay[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchMining = async () => {
      const supabase = createClient();
      const { data: activities } = await supabase
        .from('activities')
        .select('created_at')
        .eq('user_id', user.uid)
        .eq('type', 'mining');

      if (activities && activities.length > 0) {
        // Count mining runs per day of week
        const counts: Record<string, number> = {};
        DAYS.forEach(d => counts[d] = 0);
        activities.forEach((a: Record<string, string>) => {
          const dayIdx = new Date(a.created_at).getDay();
          counts[DAYS[dayIdx]]++;
        });
        setData(DAYS.map(d => ({ day: d, runs: counts[d] })));
      }
    };
    fetchMining();
  }, [user]);

  if (data.length === 0 || data.every(d => d.runs === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Cpu size={28} className="text-muted-foreground opacity-20 mb-3" />
        <p className="text-xs text-muted-foreground">No mining activity yet</p>
        <p className="text-[10px] text-muted-foreground mt-1">Run the Ambient Miner to see frequency</p>
      </div>
    );
  }

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
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="runs" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={`bar-cell-${i}`} fill={BAR_COLORS[i % BAR_COLORS.length]} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}