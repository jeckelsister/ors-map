import React from 'react';

import type { HikingRoute } from '@/types/hiking';

import ElevationProfile from '../ElevationProfile';

interface ProfileTabProps {
  currentRoute: HikingRoute | null;
}

/**
 * Profile tab content - separated for better readability
 * Displays elevation profile for the current route
 */
export default function ProfileTab({
  currentRoute,
}: ProfileTabProps): React.JSX.Element {
  return (
    <div>
      <h3 className="font-semibold mb-3">Elevation Profile</h3>
      <ElevationProfile route={currentRoute} showStages={true} />
    </div>
  );
}
