'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Cpu, Award, Activity, Settings,
  ChevronLeft, ChevronRight, LogOut, User, ExternalLink, X
} from 'lucide-react';
import { useUser } from '@/lib/contexts/UserContext';
import { createClient } from '@/lib/supabase/client';
import TruuLogo from '@/components/TruuLogo';
import AppImage from '@/components/ui/AppImage';

const GithubIcon = ({ size = 13, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

const NAV_ITEMS = [
  { id: 'nav-dashboard', icon: LayoutDashboard, label: 'Dashboard', href: '/user-dashboard', badge: null },
  { id: 'nav-miner', icon: Cpu, label: 'Ambient Miner', href: '/user-dashboard', badge: 'Active' },
  { id: 'nav-credentials', icon: Award, label: 'Credentials', href: '/user-dashboard', badge: null },
  { id: 'nav-activity', icon: Activity, label: 'Activity', href: '/user-dashboard', badge: null },
  { id: 'nav-passport', icon: ExternalLink, label: 'My Passport', href: '/public-capability-passport', badge: null },
  { id: 'nav-settings', icon: Settings, label: 'Settings', href: '/user-dashboard', badge: null },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function NavItem({ item, collapsed, active }: { item: typeof NAV_ITEMS[0]; collapsed: boolean; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} title={collapsed ? item.label : undefined}>
      <div
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
          active
            ? 'bg-primary/15 text-primary' :'text-muted-foreground hover:text-foreground hover:bg-white/5'
        }`}
      >
        {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />}
        <Icon size={17} className="flex-shrink-0" />
        {!collapsed && (
          <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
        )}
        {!collapsed && item.badge && (
          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
            item.badge === 'Active' ?'bg-green-500/15 text-green-400 border border-green-500/30' :'bg-primary/15 text-primary border border-primary/30'
          }`}>
            {item.badge}
          </span>
        )}
        {collapsed && item.badge && (
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
        )}
      </div>
    </Link>
  );
}

export default function DashboardSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const supabase = createClient();
  const { user, loading } = useUser();
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-border/50 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && <TruuLogo size={24} />}
        {collapsed && <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent" />}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg btn-ghost text-muted-foreground hover:text-foreground hidden lg:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* User card */}
      {!collapsed && user && (
        <div className="mx-3 mt-4 p-3 rounded-xl bg-white/[0.03] border border-border/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              {user.avatar ? (
                <AppImage
                  src={user.avatar}
                  alt={`${user.githubUsername} GitHub avatar`}
                  width={36}
                  height={36}
                  className="rounded-full ring-2 ring-primary/30"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/20 ring-2 ring-primary/30 flex items-center justify-center">
                  <User size={16} className="text-primary" />
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-background" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user.githubUsername}</p>
              <p className="text-[10px] text-muted-foreground font-mono truncate">{user.email}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Trust Score</span>
              <span className="text-sm font-black font-mono text-gradient-blue">{user.trustScore}</span>
            </div>
            <div className="mt-1.5 h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                style={{ width: `${(user.trustScore / 1000) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="flex justify-center mt-4">
          <div className="relative">
            <AppImage
              src={user.avatar}
              alt={`${user.githubUsername} avatar`}
              width={32}
              height={32}
              className="rounded-full ring-1 ring-primary/30"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400 border border-background" />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-3 mb-2">Navigation</p>
        )}
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.id} item={item} collapsed={collapsed} active={pathname === item.href && item.href === '/user-dashboard'} />
        ))}
      </nav>

      {/* GitHub sync status */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
          <div className="flex items-center gap-2">
            <GithubIcon size={13} className="text-green-400" />
            <span className="text-[11px] font-mono text-green-400">GitHub Connected</span>
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 font-mono">Last sync: 47m ago</p>
        </div>
      )}

      {/* Logout */}
      <div className="p-3 border-t border-border/50">
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sign out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full z-40 glass-card border-r transition-all duration-300 hidden lg:block`}
        style={{ width: collapsed ? '64px' : '240px' }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-60 z-50 glass-card border-r lg:hidden"
            >
              <button
                onClick={onMobileClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg btn-ghost"
              >
                <X size={16} />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}