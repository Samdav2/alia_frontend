import React from 'react';
import { Navigation } from '@/components/Homepage/Navigation';
import { HeroSection } from '@/components/Homepage/HeroSection';
import { PathCards } from '@/components/Homepage/PathCards';
import { FeatureShowcase } from '@/components/Homepage/FeatureShowcase';
import { AgentShowcase } from '@/components/Homepage/AgentShowcase';
import { ImportanceSection } from '@/components/Homepage/ImportanceSection';
import { TrustSection } from '@/components/Homepage/TrustSection';
import { Footer } from '@/components/Homepage/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white" data-alia-version="ALIA-V1">
      <Navigation />
      <HeroSection />
      <PathCards />
      <FeatureShowcase />
      <AgentShowcase />
      <ImportanceSection />
      <TrustSection />
      <Footer />
    </main>
  );
}
