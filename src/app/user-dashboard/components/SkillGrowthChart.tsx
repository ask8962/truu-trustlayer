'use client';

import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { useUser } from '@/lib/contexts/UserContext';
import { createClient } from '@/lib/supabase/client';
import { Cpu } from 'lucide-react';

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

interface GrowthPoint {
  date: string;
  skills: number;
  confidence: number;
}

export default function SkillGrowthChart() {
  const { user } = useUser();
  const [data, setData] = useState<GrowthPoint[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchGrowth = async () => {
      const supabase = createClient();
      const { data: skills } = await supabase
        .from('skills')
        .select('created_at, confidence')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: true });

      if (skills && skills.length > 0) {
        // Group skills by date and build cumulative growth
        const grouped: Record<string, { count: number; totalConf: number }> = {};
        skills.forEach((s: Record<string, string | number>) => {
          const date = new Date(s.created_at as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (!grouped[date]) grouped[date] = { count: 0, totalConf: 0 };
          grouped[date].count++;
          grouped[date].totalConf += (s.confidence as number) || 0;
        });

        let cumulative = 0;
        const points: GrowthPoint[] = Object.entries(grouped).map(([date, { count, totalConf }]) => {
          cumulative += count;
          return {
            date,
            skills: cumulative,
            confidence: Math.round(totalConf / count),
          };
        });
        setData(points);
      }
    };
    fetchGrowth();
  }, [user]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Cpu size={28} className="text-muted-foreground opacity-20 mb-3" />
        <p className="text-xs text-muted-foreground">No skill data yet</p>
        <p className="text-[10px] text-muted-foreground mt-1">Run the Ambient Miner to see growth trends</p>
      </div>
    );
  }

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
          dataKey="date"
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