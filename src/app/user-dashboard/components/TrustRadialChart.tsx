'use client';

import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

export default function TrustRadialChart({ score }: { score: number }) {
  const safeScore = typeof score === 'number' && !isNaN(score) ? score : 0;
  const data = [{ value: (safeScore / 1000) * 100, fill: 'url(#trustGradient)' }];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadialBarChart
        innerRadius="65%"
        outerRadius="100%"
        data={data}
        startAngle={90}
        endAngle={-270}
        barSize={8}
      >
        <defs>
          <linearGradient id="trustGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        <RadialBar
          dataKey="value"
          cornerRadius={4}
          background={{ fill: 'rgba(255,255,255,0.05)' }}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}