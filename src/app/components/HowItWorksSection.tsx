'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Share2 } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const GithubIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

const STEPS = [
  {
    id: 'step-connect',
    number: '01',
    icon: GithubIcon,
    title: 'Connect Tools',
    description: 'Link your GitHub account with one click. TRUU securely reads your public and private repository activity to build your proof base.',
    color: 'rgba(59,130,246,0.8)',
    glow: 'rgba(59,130,246,0.3)',
    border: 'rgba(59,130,246,0.25)',
  },
  {
    id: 'step-mine',
    number: '02',
    icon: Cpu,
    title: 'Ambient Mining',
    description: 'Our algorithm continuously analyzes commit patterns, code quality, language depth, and contribution consistency — no manual input required.',
    color: 'rgba(139,92,246,0.8)',
    glow: 'rgba(139,92,246,0.3)',
    border: 'rgba(139,92,246,0.25)',
  },
  {
    id: 'step-share',
    number: '03',
    icon: Share2,
    title: 'Share Proof',
    description: 'Your Capability Passport is a public URL backed by AI analysis of your real code. Share it instead of a resume — every skill is verified from your actual commits.',
    color: 'rgba(6,182,212,0.8)',
    glow: 'rgba(6,182,212,0.3)',
    border: 'rgba(6,182,212,0.25)',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">How TRUU Works</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">
            From code to{' '}
            <span className="text-gradient-blue">verifiable proof</span>
            <br />in three steps.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-base">
            No CVs, no self-assessments, no interviews required to establish baseline credibility.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                whileHover={{ y: -6 }}
                className="glass-card rounded-2xl p-8 group transition-all duration-300 relative overflow-hidden"
                style={{ borderColor: step.border }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 40px ${step.glow}, 0 20px 40px rgba(0,0,0,0.3)`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '';
                }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${step.color.replace('0.8', '0.15')}, ${step.color.replace('0.8', '0.05')})`, border: `1px solid ${step.border}` }}
                  >
                    <Icon size={20} style={{ color: step.color }} />
                  </div>
                  <span
                    className="text-4xl font-black font-mono opacity-20 group-hover:opacity-40 transition-opacity"
                    style={{ color: step.color }}
                  >
                    {step.number}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                    <div className="w-8 h-px bg-gradient-to-r from-border to-transparent" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}