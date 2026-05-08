import React from 'react';
import PassportView from './components/PassportView';
import { UserProvider } from '@/lib/contexts/UserContext';

export default function PublicCapabilityPassportPage() {
  return (
    <UserProvider>
      <PassportView />
    </UserProvider>
  );
}