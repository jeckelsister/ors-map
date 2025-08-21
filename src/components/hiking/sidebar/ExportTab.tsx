import React from 'react';

import type { GPXHandlers } from '@/hooks/hiking/useGPXHandlers';
import type { HikingRoute, Refuge, WaterPoint } from '@/types/hiking';

import GPXExportControls from '../GPXExportControls';

interface ExportTabProps {
  currentRoute: HikingRoute | null;
  refuges: Refuge[];
  waterPoints: WaterPoint[];
  gpxHandlers: GPXHandlers;
}

/**
 * Export tab content - separated for better readability
 * Handles GPX file export functionality
 */
export default function ExportTab({
  currentRoute,
  refuges,
  waterPoints,
  gpxHandlers,
}: ExportTabProps): React.JSX.Element {
  return (
    <div>
      <h3 className="font-semibold mb-3">Export GPX</h3>
      <GPXExportControls
        route={currentRoute}
        refuges={refuges}
        waterPoints={waterPoints}
        onExport={gpxHandlers.handleGPXExport}
      />
    </div>
  );
}
