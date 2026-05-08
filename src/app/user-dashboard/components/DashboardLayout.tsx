'use client';

import React, { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopbar from './DashboardTopbar';
import DashboardBentoGrid from './DashboardBentoGrid';
import { UserProvider } from '@/lib/contexts/UserContext';

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <UserProvider>
      <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
        {/* Ambient background */}
        <div className="fixed inset-0 grid-bg opacity-20 pointer-events-none" />
        <div
          className="fixed top-0 right-0 w-[600px] h-[400px] pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.4) 0%, transparent 70%)' }}
        />

        <DashboardSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div
          className="flex-1 flex flex-col min-w-0 transition-all duration-300"
          style={{ marginLeft: sidebarCollapsed ? '64px' : '240px' }}
        >
          <DashboardTopbar onMobileMenuOpen={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-auto p-6 lg:p-8">
            <DashboardBentoGrid />
          </main>
        </div>
      </div>
    </UserProvider>
  );
}