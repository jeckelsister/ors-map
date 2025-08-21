import { Rocket, RotateCcw } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TAB_CONFIGS } from '@/constants/hikingPlanner';


import ElevationProfile from './ElevationProfile';
import EnrichedPOIControls from './EnrichedPOIControls';
import GPXExportControls from './GPXExportControls';
import GPXUpload from './GPXUpload';
import POIDisplayControls from './POIDisplayControls';
import RouteStagesPlanner from './RouteStagesPlanner';

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
 * Sidebar component containing all tabs and controls for the hiking planner
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
            <TabsContent value="planning" className="space-y-4 mt-0">
              <div>
                <h3 className="font-semibold mb-3">
                  Configuration de l'itinéraire
                </h3>
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
                    'Création...'
                  ) : (
                    <>
                      <Rocket className="w-4 h-4 mr-2" />
                      Créer l'itinéraire
                    </>
                  )}
                </Button>

                <Button onClick={onReset} variant="outline">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-0">
              <div>
                <h3 className="font-semibold mb-3">Profil altimétrique</h3>
                <ElevationProfile route={currentRoute} showStages={true} />
              </div>
            </TabsContent>

            {/* POI Tab */}
            <TabsContent value="poi" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Refuges & Points d'eau</h3>
                  <POIDisplayControls
                    refuges={refuges}
                    waterPoints={waterPoints}
                    showRefuges={showRefuges}
                    showWaterPoints={showWaterPoints}
                    onToggleRefuges={setShowRefuges}
                    onToggleWaterPoints={setShowWaterPoints}
                    onRefugeSelect={poiHandlers.handleRefugeSelect}
                    onWaterPointSelect={poiHandlers.handleWaterPointSelect}
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-3">
                    Points d'intérêt enrichis
                  </h3>
                  <EnrichedPOIControls
                    enrichedPOIs={enrichedPOIs}
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
                    onPeakSelect={poiHandlers.handlePeakSelect}
                    onPassSelect={poiHandlers.handlePassSelect}
                    onViewpointSelect={poiHandlers.handleViewpointSelect}
                    onHeritageSelect={poiHandlers.handleHeritageSelect}
                    onLakeSelect={poiHandlers.handleLakeSelect}
                  />
                </div>
              </div>
            </TabsContent>

            {/* GPX Import Tab */}
            <TabsContent value="gpx" className="mt-0">
              <div>
                <h3 className="font-semibold mb-3">Import GPX</h3>
                <GPXUpload
                  onGPXImported={gpxHandlers.handleGPXImport}
                  onError={gpxHandlers.handleGPXImportError}
                />
              </div>
            </TabsContent>

            {/* Export Tab */}
            <TabsContent value="export" className="mt-0">
              <div>
                <h3 className="font-semibold mb-3">Export GPX</h3>
                <GPXExportControls
                  route={currentRoute}
                  refuges={refuges}
                  waterPoints={waterPoints}
                  onExport={gpxHandlers.handleGPXExport}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
