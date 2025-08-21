import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type {
  EnrichedPOIs,
  Heritage,
  NotableLake,
  Pass,
  Peak,
  Viewpoint,
} from '@/types/hiking';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Landmark,
  MapPin,
  Milestone,
  Mountain,
  Waves,
} from 'lucide-react';
import React, { useState } from 'react';

// Simple Switch component
const Switch = ({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={`inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
      checked ? 'bg-primary' : 'bg-gray-200'
    }`}
  >
    <div
      className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

interface EnrichedPOIControlsProps {
  enrichedPOIs: EnrichedPOIs;
  showPeaks: boolean;
  showPasses: boolean;
  showViewpoints: boolean;
  showHeritage: boolean;
  showLakes: boolean;
  onTogglePeaks: (show: boolean) => void;
  onTogglePasses: (show: boolean) => void;
  onToggleViewpoints: (show: boolean) => void;
  onToggleHeritage: (show: boolean) => void;
  onToggleLakes: (show: boolean) => void;
  onPeakSelect?: (peak: Peak) => void;
  onPassSelect?: (pass: Pass) => void;
  onViewpointSelect?: (viewpoint: Viewpoint) => void;
  onHeritageSelect?: (heritage: Heritage) => void;
  onLakeSelect?: (lake: NotableLake) => void;
}

export default function EnrichedPOIControls({
  enrichedPOIs,
  showPeaks,
  showPasses,
  showViewpoints,
  showHeritage,
  showLakes,
  onTogglePeaks,
  onTogglePasses,
  onToggleViewpoints,
  onToggleHeritage,
  onToggleLakes,
  onPeakSelect,
  onPassSelect,
  onViewpointSelect,
  onHeritageSelect,
  onLakeSelect,
}: EnrichedPOIControlsProps): React.JSX.Element {
  const [expandedSections, setExpandedSections] = useState<{
    peaks: boolean;
    passes: boolean;
    viewpoints: boolean;
    heritage: boolean;
    lakes: boolean;
  }>({
    peaks: false,
    passes: false,
    viewpoints: false,
    heritage: false,
    lakes: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const POISection = ({
    title,
    icon: Icon,
    count,
    isVisible,
    onToggle,
    isExpanded,
    onToggleExpanded,
    children,
  }: {
    title: string;
    icon: React.ElementType;
    count: number;
    isVisible: boolean;
    onToggle: (show: boolean) => void;
    isExpanded: boolean;
    onToggleExpanded: () => void;
    children: React.ReactNode;
  }) => (
    <Card className="mb-3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            <CardTitle className="text-sm">{title}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {count}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isVisible} onCheckedChange={onToggle} />
            {count > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpanded}
                className="p-1 h-6 w-6"
              >
                {isExpanded ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      {count > 0 && isExpanded && (
        <CardContent className="pt-0 pb-2">{children}</CardContent>
      )}
    </Card>
  );

  const PeakItem = ({ peak }: { peak: Peak }) => (
    <div
      className="p-2 bg-gray-50 rounded-lg mb-2 cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => onPeakSelect?.(peak)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-sm">{peak.name}</h4>
          <div className="flex gap-1 mt-1">
            <Badge variant="outline" className="text-xs">
              {peak.elevation}m
            </Badge>
            {peak.difficulty && (
              <Badge
                variant={
                  peak.difficulty === 'très difficile'
                    ? 'destructive'
                    : peak.difficulty === 'difficile'
                      ? 'secondary'
                      : 'outline'
                }
                className="text-xs"
              >
                {peak.difficulty}
              </Badge>
            )}
          </div>
        </div>
        <MapPin className="w-4 h-4 text-gray-400" />
      </div>
      {peak.climbing_grade && (
        <p className="text-xs text-gray-600 mt-1">
          Grade: {peak.climbing_grade}
        </p>
      )}
    </div>
  );

  const PassItem = ({ pass }: { pass: Pass }) => (
    <div
      className="p-2 bg-amber-50 rounded-lg mb-2 cursor-pointer hover:bg-amber-100 transition-colors"
      onClick={() => onPassSelect?.(pass)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-sm">{pass.name}</h4>
          <div className="flex gap-1 mt-1">
            <Badge variant="outline" className="text-xs">
              {pass.elevation}m
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {pass.type}
            </Badge>
          </div>
        </div>
        <MapPin className="w-4 h-4 text-amber-400" />
      </div>
      {pass.seasonal_access && (
        <p className="text-xs text-gray-600 mt-1">
          Accès: {pass.seasonal_access}
        </p>
      )}
    </div>
  );

  const ViewpointItem = ({ viewpoint }: { viewpoint: Viewpoint }) => (
    <div
      className="p-2 bg-purple-50 rounded-lg mb-2 cursor-pointer hover:bg-purple-100 transition-colors"
      onClick={() => onViewpointSelect?.(viewpoint)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-sm">{viewpoint.name}</h4>
          <div className="flex gap-1 mt-1">
            <Badge variant="outline" className="text-xs">
              {viewpoint.elevation}m
            </Badge>
            {viewpoint.panoramic && (
              <Badge variant="secondary" className="text-xs">
                Panoramique
              </Badge>
            )}
          </div>
        </div>
        <MapPin className="w-4 h-4 text-purple-400" />
      </div>
      {viewpoint.best_time && (
        <p className="text-xs text-gray-600 mt-1">
          Meilleur moment: {viewpoint.best_time}
        </p>
      )}
    </div>
  );

  const HeritageItem = ({ heritage }: { heritage: Heritage }) => (
    <div
      className="p-2 bg-orange-50 rounded-lg mb-2 cursor-pointer hover:bg-orange-100 transition-colors"
      onClick={() => onHeritageSelect?.(heritage)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-sm">{heritage.name}</h4>
          <div className="flex gap-1 mt-1">
            <Badge variant="outline" className="text-xs">
              {heritage.type}
            </Badge>
            {heritage.unesco && (
              <Badge variant="secondary" className="text-xs">
                UNESCO
              </Badge>
            )}
          </div>
        </div>
        <MapPin className="w-4 h-4 text-orange-400" />
      </div>
      {heritage.period && (
        <p className="text-xs text-gray-600 mt-1">Période: {heritage.period}</p>
      )}
    </div>
  );

  const LakeItem = ({ lake }: { lake: NotableLake }) => (
    <div
      className="p-2 bg-blue-50 rounded-lg mb-2 cursor-pointer hover:bg-blue-100 transition-colors"
      onClick={() => onLakeSelect?.(lake)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-sm">{lake.name}</h4>
          <div className="flex gap-1 mt-1">
            {lake.elevation > 0 && (
              <Badge variant="outline" className="text-xs">
                {lake.elevation}m
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {lake.type.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        <MapPin className="w-4 h-4 text-blue-400" />
      </div>
      {lake.activities && lake.activities.length > 0 && (
        <p className="text-xs text-gray-600 mt-1">
          Activités: {lake.activities.join(', ')}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      <POISection
        title="Sommets"
        icon={Mountain}
        count={enrichedPOIs.peaks.length}
        isVisible={showPeaks}
        onToggle={onTogglePeaks}
        isExpanded={expandedSections.peaks}
        onToggleExpanded={() => toggleSection('peaks')}
      >
        <div className="space-y-2">
          {enrichedPOIs.peaks.map(peak => (
            <PeakItem key={peak.id} peak={peak} />
          ))}
        </div>
      </POISection>

      <POISection
        title="Cols et Passages"
        icon={Milestone}
        count={enrichedPOIs.passes.length}
        isVisible={showPasses}
        onToggle={onTogglePasses}
        isExpanded={expandedSections.passes}
        onToggleExpanded={() => toggleSection('passes')}
      >
        <div className="space-y-2">
          {enrichedPOIs.passes.map(pass => (
            <PassItem key={pass.id} pass={pass} />
          ))}
        </div>
      </POISection>

      <POISection
        title="Points de Vue"
        icon={Eye}
        count={enrichedPOIs.viewpoints.length}
        isVisible={showViewpoints}
        onToggle={onToggleViewpoints}
        isExpanded={expandedSections.viewpoints}
        onToggleExpanded={() => toggleSection('viewpoints')}
      >
        <div className="space-y-2">
          {enrichedPOIs.viewpoints.map(viewpoint => (
            <ViewpointItem key={viewpoint.id} viewpoint={viewpoint} />
          ))}
        </div>
      </POISection>

      <POISection
        title="Patrimoine"
        icon={Landmark}
        count={enrichedPOIs.heritage.length}
        isVisible={showHeritage}
        onToggle={onToggleHeritage}
        isExpanded={expandedSections.heritage}
        onToggleExpanded={() => toggleSection('heritage')}
      >
        <div className="space-y-2">
          {enrichedPOIs.heritage.map(heritage => (
            <HeritageItem key={heritage.id} heritage={heritage} />
          ))}
        </div>
      </POISection>

      <POISection
        title="Lacs Remarquables"
        icon={Waves}
        count={enrichedPOIs.lakes.length}
        isVisible={showLakes}
        onToggle={onToggleLakes}
        isExpanded={expandedSections.lakes}
        onToggleExpanded={() => toggleSection('lakes')}
      >
        <div className="space-y-2">
          {enrichedPOIs.lakes.map(lake => (
            <LakeItem key={lake.id} lake={lake} />
          ))}
        </div>
      </POISection>
    </div>
  );
}
