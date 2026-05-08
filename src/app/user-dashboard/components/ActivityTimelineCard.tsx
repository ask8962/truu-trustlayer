'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, Award, RefreshCw, TrendingUp } from 'lucide-react';
import { ActivityEvent } from '@/lib/types';
import Icon from '@/components/ui/AppIcon';


const EVENT_CONFIG: Record<ActivityEvent['type'], { icon: React.ElementType; color: string; bg: string; border: string }> = {
  mining: { icon: Cpu, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/25' },
  credential: { icon: Award, color: 'text-cyan', bg: 'bg-cyan/10', border: 'border-cyan/25' },
  sync: { icon: RefreshCw, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/25' },
  upgrade: { icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/25' },
};

function formatRelativeTime(iso: string) {
  const now = new Date();
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export default function ActivityTimelineCard() {
  // Activities will be populated once the AI miner runs and generates events
  const activities: ActivityEvent[] = [];

  return (
    <div className="glass-card rounded-2xl p-5 border border-border/50">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-primary" />
          <span className="text-sm font-semibold">Activity Timeline</span>
          <span className="text-[10px] font-mono text-muted-foreground bg-white/5 border border-border px-1.5 py-0.5 rounded-full">
            {activities.length} events
          </span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">Last 7 days</span>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <Activity size={24} className="text-muted-foreground opacity-30 mb-2" />
          <p className="text-xs text-muted-foreground">No activity yet</p>
          <p className="text-[10px] text-muted-foreground mt-1">Run the Ambient Miner to generate activity</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
          {activities.map((event, i) => {
            const config = EVENT_CONFIG[event.type];
            const Icon = config.icon;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`p-3 rounded-xl border ${config.border} ${config.bg} group hover:scale-[1.01] transition-transform duration-150`}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg} border ${config.border}`}>
                    <Icon size={13} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-foreground leading-relaxed">{event.message}</p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-1.5">{formatRelativeTime(event.createdAt)}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}