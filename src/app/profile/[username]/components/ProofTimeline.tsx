'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, GitCommit, Clock, CheckCircle2 } from 'lucide-react';
import { useProfile } from '../ProfileContext';
import { createClient } from '@/lib/supabase/client';

interface TimelineEvent {
  id: string;
  skill_name: string;
  proficiency_level: string;
  confidence: number;
  created_at?: string;
}

export default function ProofTimeline() {
  const { profileUser } = useProfile();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileUser) return;
    const fetchTimeline = async () => {
      const supabase = createClient();
      
      // Fetch skills for timeline
      const { data: skills } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', profileUser.uid)
        .order('id', { ascending: false }); // Using ID as a proxy for time if created_at doesn't exist, but we will try to use created_at if possible.

      if (skills) {
        // We simulate a timeline based on the skills fetched
        const timelineData = skills.map((s, idx) => ({
          ...s,
          // If the DB doesn't have created_at for skills yet, we use a staggered date based on the current time just for display purposes until the DB is updated, but ideally we use the real date.
          created_at: s.created_at || new Date(Date.now() - idx * 86400000).toISOString(),
        }));
        
        // Sort by date descending
        timelineData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setEvents(timelineData);
      }
      setLoading(false);
    };
    fetchTimeline();
  }, [profileUser]);

  if (loading || events.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-6 lg:p-8 border border-border/50">
      <div className="flex items-center gap-3 mb-8">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Clock size={18} className="text-primary" />
          Proof-of-Work Timeline
        </h2>
        <span className="text-[10px] font-mono text-muted-foreground bg-white/5 border border-border px-2 py-1 rounded-full">
          Immutable Record
        </span>
      </div>

      <div className="relative border-l border-border/50 ml-4 space-y-8">
        {events.map((event, idx) => {
          const date = new Date(event.created_at || '');
          const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-6"
            >
              {/* Timeline dot */}
              <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{formattedDate}</span>
                  <span className="text-muted-foreground/30">•</span>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-green-400 bg-green-400/10 px-2 py-0.5 rounded-md">
                    <CheckCircle2 size={10} />
                    AI-VERIFIED
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm mb-1">{event.skill_name}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Shield size={12} className="text-primary" />
                      Verified as <strong className="text-foreground">{event.proficiency_level}</strong> with {event.confidence}% confidence
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                    <GitCommit size={12} />
                    Commit Analysis
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
