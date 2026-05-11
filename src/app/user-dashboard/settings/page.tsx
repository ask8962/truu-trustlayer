'use client';

import React, { useState } from 'react';
import { Shield, AlertTriangle, Trash2 } from 'lucide-react';
import { useUser } from '@/lib/contexts/UserContext';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const GithubIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

export default function SettingsPage() {
  const { user } = useUser();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    
    setIsDeleting(true);
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete account');
      
      const supabase = createClient();
      await supabase.auth.signOut();
      
      toast.success('Account permanently deleted');
      window.location.href = '/';
    } catch (e: any) {
      toast.error('Error deleting account: ' + e.message);
      setIsDeleting(false);
      setShowModal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your TRUU account and privacy preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Connected Accounts */}
        <div className="glass-card rounded-2xl p-6 border border-border/50">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Shield size={18} className="text-primary" />
            Connected Accounts
          </h2>
          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-3">
              <GithubIcon size={20} />
              <div>
                <p className="font-medium text-sm">GitHub</p>
                <p className="text-xs text-muted-foreground">Connected as @{user?.githubUsername}</p>
              </div>
            </div>
            <span className="text-xs font-mono text-green-400 bg-green-400/10 px-2 py-1 rounded-md">Active</span>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass-card rounded-2xl border border-red-500/20 bg-red-500/5">
          <div className="p-6 border-b border-red-500/10">
            <h2 className="text-lg font-bold text-red-500 flex items-center gap-2">
              <AlertTriangle size={18} />
              Danger Zone
            </h2>
            <p className="text-sm text-red-400/80 mt-1">
              Irreversible and destructive actions. Proceed with caution.
            </p>
          </div>
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-sm">Delete Account</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-md">
                Permanently delete your profile, skills, mining history, and public passport. This action cannot be undone and your proof timeline will be erased.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex-shrink-0 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 border border-red-500/30 bg-red-950/20 shadow-2xl">
            <h3 className="text-xl font-bold text-red-500 mb-2">Delete Account?</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              This will permanently erase your TRUU profile, skills, and activities. It will instantly break any links to your public passport.
            </p>
            <div className="mb-6">
              <label className="block text-xs font-mono text-muted-foreground mb-2">
                Type <strong className="text-foreground">DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500 transition-colors"
                placeholder="DELETE"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setConfirmText('');
                }}
                className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={confirmText !== 'DELETE' || isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
