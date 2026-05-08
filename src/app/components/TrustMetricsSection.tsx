'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Cpu, ShieldCheck, TrendingUp } from 'lucide-react';
import { TRUST_METRICS } from '@/lib/mockData';
import Icon from '@/components/ui/AppIcon';



// Backend integration point — replace TRUST_METRICS with Firestore real-time listener on 'platform_metrics' doc

function CountUp({ target, duration = 2000, decimals = 0, suffix = '' }: { target: number; duration?: number; decimals?: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((target * eased).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration, decimals]);

  return <span ref={ref}>{decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString()}{suffix}</span>;
}

const METRICS = [
  {
    id: 'metric-devs',
    icon: Users,
    label: 'Developers Verified',
    value: TRUST_METRICS.developersVerified,
    suffix: '+',
    decimals: 0,
    color: 'text-primary',
    glow: 'rgba(59,130,246,0.3)',
  },
  {
    id: 'metric-skills',
    icon: Cpu,
    label: 'Skills Mined',
    value: TRUST_METRICS.skillsMined,
    suffix: '+',
    decimals: 0,
    color: 'text-accent',
    glow: 'rgba(139,92,246,0.3)',
  },
  {
    id: 'metric-accuracy',
    icon: ShieldCheck,
    label: 'Verification Accuracy',
    value: TRUST_METRICS.verificationAccuracy,
    suffix: '%',
    decimals: 1,
    color: 'text-cyan',
    glow: 'rgba(6,182,212,0.3)',
  },
  {
    id: 'metric-growth',
    icon: TrendingUp,
    label: 'Weekly Growth Rate',
    value: 23.7,
    suffix: '%',
    decimals: 1,
    color: 'text-green-400',
    glow: 'rgba(74,222,128,0.3)',
  },
];

export default function TrustMetricsSection() {
  return (
    <section className="py-24 relative">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Platform Metrics</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">
            Trust at{' '}
            <span className="text-gradient-full">global scale.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {METRICS.map((metric, i) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="glass-card rounded-2xl p-6 text-center group transition-all duration-300 relative overflow-hidden"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${metric.glow}`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '';
                }}
              >
                <div className={`w-10 h-10 rounded-xl mx-auto mb-4 flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors`}>
                  <Icon size={18} className={metric.color} />
                </div>
                <p className={`text-3xl font-black font-mono tabular-nums ${metric.color} mb-1`}>
                  <CountUp target={metric.value} decimals={metric.decimals} suffix={metric.suffix} />
                </p>
                <p className="text-xs text-muted-foreground font-medium">{metric.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}