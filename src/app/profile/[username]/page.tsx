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

  // Fetch real heatmap data and profile details from GitHub GraphQL
  let heatmapData: any[] = [];
  let ghProfile: any = null;
  try {
    const token = process.env.GITHUB_TOKEN;
    if (token) {
      const query = `
        query {
          user(login: "${username}") {
            name
            bio
            location
            websiteUrl
            twitterUsername
            createdAt
            socialAccounts(first: 10) {
              nodes {
                provider
                url
              }
            }
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                    date
                    weekday
                  }
                }
              }
            }
          }
        }
      `;
      const res = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
        next: { revalidate: 3600 }
      });
      if (res.ok) {
        const json = await res.json();
        const user = json.data?.user;
        if (user) {
          ghProfile = user;
          const weeks = user.contributionsCollection?.contributionCalendar?.weeks || [];
          weeks.forEach((w: any, weekIdx: number) => {
            w.contributionDays.forEach((day: any) => {
              heatmapData.push({
                week: weekIdx,
                day: day.weekday,
                value: day.contributionCount,
                date: day.date
              });
            });
          });
          if (user.contributionsCollection?.contributionCalendar?.totalContributions) {
            commitCount = user.contributionsCollection.contributionCalendar.totalContributions;
          }
        }
      }
    }
  } catch (e) {
    console.error('Failed to fetch github data', e);
  }

  // Parse social links
  const socials: any = {};
  if (ghProfile) {
    socials.website = ghProfile.websiteUrl || '';
    socials.twitter = ghProfile.twitterUsername ? `https://twitter.com/${ghProfile.twitterUsername}` : '';
    
    ghProfile.socialAccounts?.nodes?.forEach((node: any) => {
      const url = node.url.toLowerCase();
      if (url.includes('linkedin.com')) socials.linkedin = node.url;
      if (url.includes('leetcode.com')) socials.leetcode = node.url;
    });
  }

  const profileUser: TruuUser = {
    uid: userData.id,
    githubUsername: userData.github_username || username,
    fullName: ghProfile?.name || userData.github_username || username,
    email: '',
    avatar: `https://github.com/${username}.png`,
    bio: ghProfile?.bio || '',
    location: ghProfile?.location || 'Unknown',
    trustScore: userData.trust_score || 0,
    createdAt: ghProfile?.createdAt || userData.created_at || new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    repoCount,
    commitCount,
    socials,
  };

  return (
    <ProfileProvider profileUser={profileUser} heatmapData={heatmapData}>
      <PassportView />
    </ProfileProvider>
  );
}
