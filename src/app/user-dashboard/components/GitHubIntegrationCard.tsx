'use client';

import React from 'react';
import { GitCommit, BookOpen, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useUser } from '@/lib/contexts/UserContext';
import AppImage from '@/components/ui/AppImage';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';

const GithubIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

export default function GitHubIntegrationCard() {
  const { user } = useUser();

  const handleSync = () => {
    // Backend integration point — trigger GitHub re-sync, update Firestore integrations collection
    toast?.info('GitHub sync initiated...', { duration: 2000 });
  };

  return (
    <div className="glass-card rounded-2xl p-5 h-full border border-green-500/20 relative overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <GithubIcon size={16} className="text-foreground" />
          <span className="text-sm font-semibold">GitHub Integration</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-mono text-green-400 uppercase tracking-wider">Connected</span>
        </div>
      </div>
      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/[0.03] border border-border/50">
        <AppImage
          src={user?.avatar}
          alt={`${user?.githubUsername} GitHub profile avatar`}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <p className="text-sm font-semibold">@{user?.githubUsername}</p>
          <p className="text-xs text-muted-foreground font-mono">{user?.email}</p>
        </div>
        <CheckCircle2 size={16} className="ml-auto text-green-400" />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { icon: BookOpen, label: 'Repositories', value: user?.repoCount, color: 'text-primary' },
          { icon: GitCommit, label: 'Commits', value: user?.commitCount?.toLocaleString(), color: 'text-accent' },
        ]?.map(({ icon: Icon, label, value, color }) => (
          <div key={`gh-stat-${label}`} className="p-3 rounded-xl bg-white/[0.03] border border-border/50">
            <Icon size={13} className={`${color} mb-1.5`} />
            <p className={`text-xl font-black font-mono tabular-nums ${color}`}>{value}</p>
            <p className="text-[10px] text-muted-foreground font-mono">{label}</p>
          </div>
        ))}
      </div>
      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-border/50 mb-3">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-0.5">Last Sync</p>
        <p className="text-xs font-mono text-foreground">2026-05-08 16:56 UTC</p>
      </div>
      <button
        onClick={handleSync}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl btn-ghost text-xs font-mono font-medium"
      >
        <RefreshCw size={13} />
        Sync Now
      </button>
    </div>
  );
}