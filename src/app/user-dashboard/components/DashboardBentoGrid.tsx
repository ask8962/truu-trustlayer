'use client';

import React from 'react';
import TrustScoreCard from './TrustScoreCard';
import GitHubIntegrationCard from './GitHubIntegrationCard';
import AmbientMinerCard from './AmbientMinerCard';
import RecentSkillDetections from './RecentSkillDetections';
import TrustAnalyticsCard from './TrustAnalyticsCard';
import ActivityTimelineCard from './ActivityTimelineCard';

export default function DashboardBentoGrid() {
  return (
    <div className="max-w-screen-2xl mx-auto">
      {/* Row 1: Trust Score (hero, 2-col) + GitHub Integration + Miner */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-4 mb-4">
        <div className="md:col-span-2 xl:col-span-2 2xl:col-span-2">
          <TrustScoreCard />
        </div>
        <div className="xl:col-span-1 2xl:col-span-1">
          <GitHubIntegrationCard />
        </div>
        <div className="xl:col-span-1 2xl:col-span-1">
          <AmbientMinerCard />
        </div>
      </div>

      {/* Row 2: Skill Detections (2-col) + Analytics (2-col) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 2xl:grid-cols-4 gap-4 mb-4">
        <div className="xl:col-span-2 2xl:col-span-2">
          <RecentSkillDetections />
        </div>
        <div className="xl:col-span-2 2xl:col-span-2">
          <TrustAnalyticsCard />
        </div>
      </div>

      {/* Row 3: Activity Timeline (full width) */}
      <div className="grid grid-cols-1">
        <ActivityTimelineCard />
      </div>
    </div>
  );
}