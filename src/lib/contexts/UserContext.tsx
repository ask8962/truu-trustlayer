'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TruuUser } from '@/lib/types';

interface UserContextType {
  user: TruuUser | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
});

// Fetch real GitHub stats using the public API
async function fetchGitHubStats(username: string) {
  try {
    // Get user profile (includes public_repos count)
    const profileRes = await fetch(`https://api.github.com/users/${username}`);
    if (!profileRes.ok) return { repoCount: 0, commitCount: 0, bio: '' };
    const profile = await profileRes.json();

    // Get repos to estimate total commits
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    const repos = reposRes.ok ? await reposRes.json() : [];

    // Sum up stargazers as a rough activity metric, and count repos
    let totalStars = 0;
    let totalForks = 0;
    for (const repo of repos) {
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;
    }

    return {
      repoCount: profile.public_repos || repos.length || 0,
      commitCount: totalStars + totalForks, // We'll show actual event count below
      bio: profile.bio || '',
      location: profile.location || '',
      followers: profile.followers || 0,
      following: profile.following || 0,
    };
  } catch (err) {
    console.error('[UserContext] GitHub API error:', err);
    return { repoCount: 0, commitCount: 0, bio: '', location: '', followers: 0, following: 0 };
  }
}

// Fetch contribution events to estimate commit count
async function fetchGitHubEvents(username: string) {
  try {
    const res = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`);
    if (!res.ok) return 0;
    const events = await res.json();
    // Count PushEvents — each push can have multiple commits
    let commitCount = 0;
    for (const event of events) {
      if (event.type === 'PushEvent' && event.payload?.commits) {
        commitCount += event.payload.commits.length;
      }
    }
    return commitCount;
  } catch {
    return 0;
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TruuUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          console.log('[UserContext] No authenticated user');
          setUser(null);
          setLoading(false);
          return;
        }

        // 1. Get OAuth Metadata (GitHub)
        const githubUsername = authUser.user_metadata?.user_name
          || authUser.user_metadata?.preferred_username
          || authUser.user_metadata?.full_name
          || 'unknown_dev';
        const avatar = authUser.user_metadata?.avatar_url || '';
        const email = authUser.email || '';

        // 2. Fetch REAL GitHub stats
        const [ghStats, commitCount] = await Promise.all([
          fetchGitHubStats(githubUsername),
          fetchGitHubEvents(githubUsername),
        ]);

        // 3. Query our public `users` table
        let { data: dbUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        // 4. Auto-Upsert if user doesn't exist (first login)
        if (!dbUser) {
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .upsert({
              id: authUser.id,
              github_username: githubUsername,
              trust_score: 0,
            }, { onConflict: 'id' })
            .select()
            .single();

          if (!insertError) {
            dbUser = newUser;
          } else {
            console.error('[UserContext] Insert failed:', insertError.message);
          }
        }

        // 5. Build user object with REAL GitHub data
        setUser({
          uid: authUser.id,
          githubUsername: dbUser?.github_username || githubUsername,
          email: email,
          avatar: avatar,
          bio: ghStats.bio || 'Developer building the future.',
          trustScore: dbUser?.trust_score || 0,
          createdAt: dbUser?.created_at || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          repoCount: ghStats.repoCount,
          commitCount: commitCount || ghStats.commitCount,
        });
      } catch (err) {
        console.error('[UserContext] Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
