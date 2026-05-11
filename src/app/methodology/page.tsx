import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Cpu, Shield, Search } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Methodology — How TRUU Works',
  description: 'Understand how TRUU AI analyzes your GitHub activity to generate verified skill credentials.',
};

const GithubIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12">
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <h1 className="text-4xl font-black tracking-tight mb-4">How TRUU Works</h1>
        <p className="text-xl text-muted-foreground mb-12">
          A transparent look at how we turn your code history into verifiable credentials. No hype, no buzzwords.
        </p>

        <div className="space-y-12">
          <section className="glass-card rounded-2xl p-8 border border-border/50">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Search size={24} className="text-primary" />
              1. Data Collection
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you connect your GitHub account, we read your commit history, repository metadata, and language statistics. We analyze both public and private repositories.
            </p>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3">
              <Shield size={20} className="text-red-400 shrink-0" />
              <p className="text-sm text-red-400">
                <strong>Privacy Note:</strong> We do NOT store your source code. We only process metadata (commit timestamps, lines changed, file types) and temporarily read snippets to evaluate code complexity.
              </p>
            </div>
          </section>

          <section className="glass-card rounded-2xl p-8 border border-border/50">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Cpu size={24} className="text-accent" />
              2. AI Analysis
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We pass your code metadata through advanced LLMs (currently powered by Groq and Llama 3) to evaluate your proficiency across different technologies. The AI looks for:
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                <span className="text-muted-foreground"><strong>Commit Frequency:</strong> Consistency of contributions over time.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                <span className="text-muted-foreground"><strong>Project Complexity:</strong> Identifying if you're building simple scripts or complex distributed systems.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                <span className="text-muted-foreground"><strong>Language Depth:</strong> Differentiating between someone who copied a React tutorial vs someone who writes custom hooks.</span>
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Based on this analysis, the AI generates a confidence score and assigns a tier (Novice, Practitioner, Expert, Master).
            </p>
          </section>

          <section className="glass-card rounded-2xl p-8 border border-border/50">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <GithubIcon size={24} className="text-cyan" />
              3. Verification & Proof
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We issue a TRUU Capability Passport that serves as public proof of your skills. Every skill card includes a verification hash that uniquely identifies the snapshot of your GitHub data at the time of analysis.
            </p>
            <p className="text-muted-foreground leading-relaxed font-mono text-sm bg-white/5 p-4 rounded-xl border border-white/10">
              TRUU relies on AI inference, not cryptographic zero-knowledge proofs. Our goal is to provide a highly accurate, third-party assessment of your capabilities based entirely on your provable work history.
            </p>
          </section>
        </div>

        <div className="mt-16 text-center">
          <Link href="/" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold">
            Create Your Passport
          </Link>
        </div>
      </div>
    </div>
  );
}
