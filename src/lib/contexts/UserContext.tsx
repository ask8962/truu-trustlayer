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

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TruuUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError) {
          console.error('[UserContext] Auth error:', authError.message);
          setLoading(false);
          return;
        }

        if (!authUser) {
          console.log('[UserContext] No authenticated user found');
          setUser(null);
          setLoading(false);
          return;
        }

        console.log('[UserContext] Auth user found:', authUser.id);
        console.log('[UserContext] User metadata:', JSON.stringify(authUser.user_metadata));

        // 1. Get OAuth Metadata (GitHub)
        const githubUsername = authUser.user_metadata?.user_name
          || authUser.user_metadata?.preferred_username
          || authUser.user_metadata?.full_name
          || 'unknown_dev';
        const avatar = authUser.user_metadata?.avatar_url || '';
        const email = authUser.email || '';

        // 2. Query our public `users` table
        let { data: dbUser, error: selectError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (selectError) {
          console.log('[UserContext] User not in DB yet, will insert. Error:', selectError.message);
        }

        // 3. Auto-Upsert if user doesn't exist (first login)
        if (!dbUser) {
          console.log('[UserContext] Inserting new user into DB...');
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .upsert({
              id: authUser.id,
              github_username: githubUsername,
              trust_score: 0,
            }, { onConflict: 'id' })
            .select()
            .single();

          if (insertError) {
            console.error('[UserContext] Insert failed:', insertError.message);
            // Even if DB insert fails, still show the user from auth metadata
          } else {
            dbUser = newUser;
          }
        }

        // Build user object from auth metadata + DB (if available)
        setUser({
          uid: authUser.id,
          githubUsername: dbUser?.github_username || githubUsername,
          email: email,
          avatar: avatar,
          bio: 'Developer building the future.',
          trustScore: dbUser?.trust_score || 0,
          createdAt: dbUser?.created_at || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          repoCount: 0,
          commitCount: 0,
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
