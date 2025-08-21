import React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TAB_CONFIGS } from '@/constants/hikingPlanner';
import type { GPXHandlers } from '@/hooks/hiking/useGPXHandlers';
import type { POIHandlers } from '@/hooks/hiking/usePOIHandlers';
import type { TabType } from '@/hooks/hiking/useTabManagement';
import type {
  Coordinates,
  EnrichedPOIs,
  HikingProfile,
  HikingRoute,
  Refuge,
  WaterPoint,
} from '@/types/hiking';

// Import the new tab components
import ExportTab from './sidebar/ExportTab';
import ImportTab from './sidebar/ImportTab';
import PlanningTab from './sidebar/PlanningTab';
import POITab from './sidebar/POITab';
import ProfileTab from './sidebar/ProfileTab';

interface HikingPlannerSidebarProps {
  // Tab management
  selectedTab: TabType;
  onTabChange: (tab: TabType) => void;

  // Route planning
  waypoints: Coordinates[];
  onWaypointsChange: (waypoints: Coordinates[]) => void;
  isLoop: boolean;
  onLoopChange: (isLoop: boolean) => void;
  stageCount: number;
  onStageCountChange: (count: number) => void;
  hikingProfile?: HikingProfile | null;
  onProfileChange?: (profile: HikingProfile) => void;

  // Route data
  currentRoute: HikingRoute | null;
  refuges: Refuge[];
  waterPoints: WaterPoint[];
  enrichedPOIs: EnrichedPOIs;

  // UI state
  isLoading: boolean;
  showRefuges: boolean;
  setShowRefuges: (show: boolean) => void;
  showWaterPoints: boolean;
  setShowWaterPoints: (show: boolean) => void;
  showPeaks: boolean;
  setShowPeaks: (show: boolean) => void;
  showPasses: boolean;
  setShowPasses: (show: boolean) => void;
  showViewpoints: boolean;
  setShowViewpoints: (show: boolean) => void;
  showHeritage: boolean;
  setShowHeritage: (show: boolean) => void;
  showLakes: boolean;
  setShowLakes: (show: boolean) => void;

  // Actions
  onCreateRoute: () => void;
  onReset: () => void;

  // Handlers
  gpxHandlers: GPXHandlers;
  poiHandlers: POIHandlers;
}

/**
 * Sidebar component for the hiking planner
 * Now uses smaller, focused tab components for better readability and maintainability
 */
export default function HikingPlannerSidebar({
  selectedTab,
  onTabChange,
  waypoints,
  onWaypointsChange,
  isLoop,
  onLoopChange,
  stageCount,
  onStageCountChange,
  hikingProfile,
  onProfileChange,
  currentRoute,
  refuges,
  waterPoints,
  enrichedPOIs,
  isLoading,
  showRefuges,
  setShowRefuges,
  showWaterPoints,
  setShowWaterPoints,
  showPeaks,
  setShowPeaks,
  showPasses,
  setShowPasses,
  showViewpoints,
  setShowViewpoints,
  showHeritage,
  setShowHeritage,
  showLakes,
  setShowLakes,
  onCreateRoute,
  onReset,
  gpxHandlers,
  poiHandlers,
}: HikingPlannerSidebarProps): React.JSX.Element {
  return (
    <div className="lg:col-span-1 space-y-4 md:space-y-6 order-2 lg:order-1">
      {/* Tab Navigation */}
      <Tabs
        value={selectedTab}
        onValueChange={value => onTabChange(value as TabType)}
      >
        <TabsList className="grid grid-cols-5 w-full">
          {TAB_CONFIGS.map(({ id, icon: Icon }) => (
            <TabsTrigger key={id} value={id} className="p-2">
              <Icon className="w-4 h-4" />
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Tab Content */}
      <Card>
        <CardContent className="p-4">
          <Tabs value={selectedTab}>
            {/* Planning Tab */}
            <TabsContent value="planning" className="mt-0">
              <PlanningTab
                waypoints={waypoints}
                onWaypointsChange={onWaypointsChange}
                isLoop={isLoop}
                onLoopChange={onLoopChange}
                stageCount={stageCount}
                onStageCountChange={onStageCountChange}
                hikingProfile={hikingProfile}
                onProfileChange={onProfileChange}
                onCreateRoute={onCreateRoute}
                onReset={onReset}
                isLoading={isLoading}
              />
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-0">
              <ProfileTab currentRoute={currentRoute} />
            </TabsContent>

            {/* POI Tab */}
            <TabsContent value="poi" className="mt-0">
              <POITab
                refuges={refuges}
                waterPoints={waterPoints}
                enrichedPOIs={enrichedPOIs}
                showRefuges={showRefuges}
                showWaterPoints={showWaterPoints}
                onToggleRefuges={setShowRefuges}
                onToggleWaterPoints={setShowWaterPoints}
                showPeaks={showPeaks}
                showPasses={showPasses}
                showViewpoints={showViewpoints}
                showHeritage={showHeritage}
                showLakes={showLakes}
                onTogglePeaks={setShowPeaks}
                onTogglePasses={setShowPasses}
                onToggleViewpoints={setShowViewpoints}
                onToggleHeritage={setShowHeritage}
                onToggleLakes={setShowLakes}
                poiHandlers={poiHandlers}
              />
            </TabsContent>

            {/* GPX Import Tab */}
            <TabsContent value="gpx" className="mt-0">
              <ImportTab gpxHandlers={gpxHandlers} />
            </TabsContent>

            {/* Export Tab */}
            <TabsContent value="export" className="mt-0">
              <ExportTab
                currentRoute={currentRoute}
                refuges={refuges}
                waterPoints={waterPoints}
                gpxHandlers={gpxHandlers}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
