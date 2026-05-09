import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PassportView from './components/PassportView';
import { ProfileProvider } from './ProfileContext';
import { TruuUser } from '@/lib/contexts/UserContext';

// Dynamic OG Images
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  return {
    title: `${resolvedParams.username} | TRUU Capability Passport`,
    description: `View ${resolvedParams.username}'s verified developer skills and trust score on TRUU.`,
    openGraph: {
      images: [
        {
          url: `/api/og?username=${resolvedParams.username}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  const username = resolvedParams.username;
  const supabase = await createClient();

  // Fetch user from Supabase users table by github_username
  // Requires "Anyone can view users" RLS policy
  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .ilike('github_username', username)
    .single();

  if (error || !userData) {
    return notFound();
  }

  // Fetch GitHub stats (repo count, commit count) using public API
  let repoCount = 0;
  let commitCount = 0;
  try {
    const ghRes = await fetch(`https://api.github.com/users/${username}`, { next: { revalidate: 3600 } });
    if (ghRes.ok) {
      const ghData = await ghRes.json();
      repoCount = ghData.public_repos;
    }
  } catch (e) {
    console.error('Failed to fetch github stats', e);
  }

  const profileUser: TruuUser = {
    uid: userData.id,
    githubUsername: userData.github_username || username,
    email: '',
    avatar: `https://github.com/${username}.png`,
    bio: '',
    trustScore: userData.trust_score || 0,
    createdAt: userData.created_at || new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    repoCount,
    commitCount,
  };

  return (
    <ProfileProvider profileUser={profileUser}>
      <PassportView />
    </ProfileProvider>
  );
}
