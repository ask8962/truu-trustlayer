'use client';

import React from 'react';
import { Menu, Bell, Search, RefreshCw } from 'lucide-react';
import { useUser } from '@/lib/contexts/UserContext';
import AppImage from '@/components/ui/AppImage';

export default function DashboardTopbar({ onMobileMenuOpen }: { onMobileMenuOpen: () => void }) {
  const { user } = useUser();

  if (!user) return null;

  return (
    <header className="h-16 border-b border-border/50 glass-card flex items-center px-6 gap-4 flex-shrink-0 sticky top-0 z-30">
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden p-2 rounded-lg btn-ghost"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-foreground">Developer Dashboard</h1>
          <span className="text-[10px] font-mono text-muted-foreground border border-border/50 px-2 py-0.5 rounded-full">
            @{user.githubUsername}
          </span>
        </div>
        <p className="text-xs text-muted-foreground font-mono">
          Last updated: {new Date(user.lastLogin || new Date()).toISOString().split('T')[0]} {new Date(user.lastLogin || new Date()).toISOString().split('T')[1].substring(0, 5)} UTC
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg btn-ghost" aria-label="Search">
          <Search size={16} />
        </button>

        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg btn-ghost text-xs font-mono" aria-label="Sync GitHub">
          <RefreshCw size={13} />
          <span className="hidden sm:inline">Sync GitHub</span>
        </button>

        <button className="relative p-2 rounded-lg btn-ghost" aria-label="Notifications">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>

        <div className="w-px h-6 bg-border" />

        <AppImage
          src={user.avatar}
          alt={`${user.githubUsername} profile avatar`}
          width={32}
          height={32}
          className="rounded-full ring-1 ring-border cursor-pointer hover:ring-primary/50 transition-all"
        />
      </div>
    </header>
  );
}