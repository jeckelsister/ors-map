import React from 'react';

import { Rocket, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Coordinates, HikingProfile } from '@/types/hiking';

import RouteStagesPlanner from '../RouteStagesPlanner';

interface PlanningTabProps {
  // Route planning
  waypoints: Coordinates[];
  onWaypointsChange: (waypoints: Coordinates[]) => void;
  isLoop: boolean;
  onLoopChange: (isLoop: boolean) => void;
  stageCount: number;
  onStageCountChange: (count: number) => void;
  hikingProfile?: HikingProfile | null;
  onProfileChange?: (profile: HikingProfile) => void;

  // Actions
  onCreateRoute: () => void;
  onReset: () => void;
  isLoading: boolean;
}

/**
 * Planning tab content - separated for better readability
 * Handles route configuration and waypoint management
 */
export default function PlanningTab({
  waypoints,
  onWaypointsChange,
  isLoop,
  onLoopChange,
  stageCount,
  onStageCountChange,
  hikingProfile,
  onProfileChange,
  onCreateRoute,
  onReset,
  isLoading,
}: PlanningTabProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-3">Route Configuration</h3>
        <RouteStagesPlanner
          waypoints={waypoints}
          onWaypointsChange={onWaypointsChange}
          isLoop={isLoop}
          onLoopChange={onLoopChange}
          stageCount={stageCount}
          onStageCountChange={onStageCountChange}
          hikingProfile={hikingProfile}
          onProfileChange={onProfileChange}
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onCreateRoute}
          disabled={isLoading || waypoints.length < 2}
          className="flex-1"
        >
          {isLoading ? (
            'Creating...'
          ) : (
            <>
              <Rocket className="w-4 h-4 mr-2" />
              Create Route
            </>
          )}
        </Button>

        <Button onClick={onReset} variant="outline">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
