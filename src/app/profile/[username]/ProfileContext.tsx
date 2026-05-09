'use client';
import { createContext, useContext, ReactNode } from 'react';
import { TruuUser } from '@/lib/contexts/UserContext';

export const ProfileContext = createContext<{ profileUser: TruuUser | null }>({ profileUser: null });

export const useProfile = () => useContext(ProfileContext);

export function ProfileProvider({ children, profileUser }: { children: ReactNode, profileUser: TruuUser }) {
  return (
    <ProfileContext.Provider value={{ profileUser }}>
      {children}
    </ProfileContext.Provider>
  );
}
