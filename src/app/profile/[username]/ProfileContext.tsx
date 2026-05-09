'use client';
import { createContext, useContext, ReactNode } from 'react';
import { TruuUser } from '@/lib/contexts/UserContext';

export type HeatmapData = { week: number; day: number; value: number; date: string }[];

export const ProfileContext = createContext<{ 
  profileUser: TruuUser | null;
  heatmapData: HeatmapData;
}>({ 
  profileUser: null,
  heatmapData: []
});

export const useProfile = () => useContext(ProfileContext);

export function ProfileProvider({ children, profileUser, heatmapData }: { children: ReactNode, profileUser: TruuUser, heatmapData: HeatmapData }) {
  return (
    <ProfileContext.Provider value={{ profileUser, heatmapData }}>
      {children}
    </ProfileContext.Provider>
  );
}
