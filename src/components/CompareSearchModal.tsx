'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Swords, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
}

export default function CompareSearchModal({ isOpen, onClose, currentUsername }: Props) {
  const [challenger, setChallenger] = useState('');
  const router = useRouter();

  const handleChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenger.trim()) return;
    const cleanUsername = challenger.trim().replace('@', '');
    onClose();
    router.push(`/compare/${currentUsername}-vs-${cleanUsername}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[var(--background)] glass-card-bright border border-border/50 rounded-2xl w-full max-w-md shadow-2xl pointer-events-auto overflow-hidden relative"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="p-8 text-center border-b border-border/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-50" />
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center border border-primary/30 mb-4 relative z-10">
                  <Swords size={28} className="text-primary" />
                </div>
                <h2 className="text-2xl font-black text-foreground relative z-10">Skill Duel</h2>
                <p className="text-sm text-muted-foreground mt-2 relative z-10">
                  Challenge another developer to an AI-verified capability comparison.
                </p>
              </div>

              <form onSubmit={handleChallenge} className="p-6">
                <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
                  Opponent's GitHub Username
                </label>
                <div className="relative mb-6">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={challenger}
                    onChange={(e) => setChallenger(e.target.value)}
                    placeholder="e.g., torvalds, gaearon..."
                    className="w-full bg-black/20 border border-border/50 rounded-xl py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={!challenger.trim()}
                  className="w-full btn-primary py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Swords size={16} />
                  Start Duel
                </button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
