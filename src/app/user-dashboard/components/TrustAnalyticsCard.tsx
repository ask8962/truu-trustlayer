'use client';

import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import dynamic from 'next/dynamic';

const SkillGrowthChart = dynamic(() => import('./SkillGrowthChart'), { ssr: false });
const MiningFrequencyChart = dynamic(() => import('./MiningFrequencyChart'), { ssr: false });

const CHART_TABS = [
  { id: 'tab-growth', label: 'Skill Growth' },
  { id: 'tab-mining', label: 'Mining Activity' },
];

export default function TrustAnalyticsCard() {
  const [activeTab, setActiveTab] = useState('tab-growth');

  return (
    <div className="glass-card rounded-2xl p-5 border border-border/50 flex flex-col h-full min-h-[420px]">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-primary" />
          <span className="text-sm font-semibold">Trust Analytics</span>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.03] border border-border/50">
          {CHART_TABS?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-mono transition-all duration-150 ${
                activeTab === tab?.id
                  ? 'bg-primary/20 text-primary border border-primary/30' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab?.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {activeTab === 'tab-growth' ? <SkillGrowthChart /> : <MiningFrequencyChart />}
      </div>
    </div>
  );
}