import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import SkillDuelView from './SkillDuelView';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ users: string }>;
}

async function getUserData(username: string) {
  const supabase = await createClient();
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('github_username', username)
    .single();

  if (!user) return null;

  const { data: skills } = await supabase
    .from('skills')
    .select('*')
    .eq('user_id', user.id);

  return { user, skills: skills || [] };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { users } = await params;
  const [user1, user2] = users.split('-vs-');
  if (!user1 || !user2) return { title: 'Skill Duel — TRUU' };

  return {
    title: `${user1} vs ${user2} — Skill Duel | TRUU`,
    description: `Head-to-head AI-verified skill comparison between ${user1} and ${user2}. See who ranks higher across programming languages, frameworks, and tools.`,
    openGraph: {
      title: `${user1} vs ${user2} — Skill Duel`,
      description: `Who's the better developer? AI-verified comparison of ${user1} vs ${user2} on TRUU.`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${user1} vs ${user2} — Skill Duel`,
      description: `AI-verified developer showdown on TRUU.`,
    },
  };
}

export default async function SkillDuelPage({ params }: PageProps) {
  const { users } = await params;
  const parts = users.split('-vs-');

  if (parts.length !== 2) notFound();

  const [username1, username2] = parts;
  const [data1, data2] = await Promise.all([
    getUserData(username1),
    getUserData(username2),
  ]);

  if (!data1 || !data2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="glass-card rounded-2xl p-8 max-w-md text-center border border-border/50">
          <h1 className="text-2xl font-bold mb-3">Duel Not Found</h1>
          <p className="text-muted-foreground text-sm mb-6">
            {!data1 && <span><strong>@{username1}</strong> hasn&apos;t joined TRUU yet. </span>}
            {!data2 && <span><strong>@{username2}</strong> hasn&apos;t joined TRUU yet. </span>}
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Challenge them to join and see who ranks higher!
          </p>
          <a
            href="/"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold"
          >
            Create My Passport →
          </a>
        </div>
      </div>
    );
  }

  return <SkillDuelView data1={data1} data2={data2} username1={username1} username2={username2} />;
}
