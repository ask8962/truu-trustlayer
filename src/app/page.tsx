import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from './components/HeroSection';
import HowItWorksSection from './components/HowItWorksSection';
import CredentialShowcase from './components/CredentialShowcase';
import TrustMetricsSection from './components/TrustMetricsSection';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <CredentialShowcase />
        <TrustMetricsSection />
      </main>
      <Footer />
    </div>
  );
}