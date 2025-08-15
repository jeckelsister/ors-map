import type { Refuge, WaterPoint } from '../../types/hiking';
import { useState, useMemo, useCallback } from 'react';
import { FaHome, FaTint } from 'react-icons/fa';
import ToggleSection from '../../ui/ToggleSection';
import { FilterSelect, ScrollableList, POIItem } from '../../ui/POIComponents';
import Legend from '../../ui/Legend';

interface POIDisplayControlsProps {
  refuges: Refuge[];
  waterPoints: WaterPoint[];
  showRefuges: boolean;
  showWaterPoints: boolean;
  onToggleRefuges: (show: boolean) => void;
  onToggleWaterPoints: (show: boolean) => void;
  onRefugeSelect?: (refuge: Refuge) => void;
  onWaterPointSelect?: (waterPoint: WaterPoint) => void;
}

// Filter options configuration
const REFUGE_FILTER_OPTIONS = [
  { value: 'gardé', label: 'Refuges gardés' },
  { value: 'libre', label: 'Refuges libres' },
  { value: 'bivouac', label: 'Bivouacs' }
];

const WATER_FILTER_OPTIONS = [
  { value: 'source', label: 'Sources' },
  { value: 'fontaine', label: 'Fontaines' },
  { value: 'rivière', label: 'Rivières' },
  { value: 'lac', label: 'Lacs' }
];

// Legend configuration
const legendItems = [
  { icon: '🏠', label: 'Refuges' },
  { icon: '💧', label: 'Points d\'eau' },
];

export default function POIDisplayControls({
  refuges,
  waterPoints,
  showRefuges,
  showWaterPoints,
  onToggleRefuges,
  onToggleWaterPoints,
  onRefugeSelect,
  onWaterPointSelect
}: POIDisplayControlsProps) {
  const [refugeFilter, setRefugeFilter] = useState<string>('');
  const [waterFilter, setWaterFilter] = useState<string>('');

  // Filter refuges based on selected filter
  const filteredRefuges = useMemo(() => {
    if (!refugeFilter || refugeFilter === 'all') return refuges;
    return refuges.filter(refuge => refuge.type === refugeFilter);
  }, [refuges, refugeFilter]);

  // Filter water points based on selected filter
  const filteredWaterPoints = useMemo(() => {
    if (!waterFilter || waterFilter === 'all') return waterPoints;
    return waterPoints.filter(point => point.type === waterFilter);
  }, [waterPoints, waterFilter]);

  // Handle refuge selection
  const handleRefugeClick = useCallback((refuge: Refuge) => {
    onRefugeSelect?.(refuge);
  }, [onRefugeSelect]);

  // Handle water point selection
  const handleWaterPointClick = useCallback((waterPoint: WaterPoint) => {
    onWaterPointSelect?.(waterPoint);
  }, [onWaterPointSelect]);

  return (
    <div className="space-y-4">
      {/* Refuges section */}
      <ToggleSection
        title="Refuges"
        icon={<FaHome />}
        count={filteredRefuges.length}
        isVisible={showRefuges}
        onToggle={() => onToggleRefuges(!showRefuges)}
        accentColor="green"
      >
        <div className="space-y-3">
          {/* Filter */}
          <FilterSelect
            options={REFUGE_FILTER_OPTIONS}
            value={refugeFilter}
            onChange={setRefugeFilter}
            placeholder="Filtrer par type"
          />

          {/* List */}
          {filteredRefuges.length > 0 ? (
            <ScrollableList maxHeight="max-h-48 md:max-h-64">
              {filteredRefuges.map(refuge => (
                <POIItem
                  key={refuge.id}
                  name={refuge.name}
                  typeIcon="🏠"
                  typeName={refuge.type}
                  elevation={refuge.elevation}
                  onClick={() => handleRefugeClick(refuge)}
                />
              ))}
            </ScrollableList>
          ) : (
            <div className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              {refuges.length === 0 
                ? '🔍 Aucun refuge trouvé (possible timeout API)'
                : 'Aucun refuge ne correspond aux filtres'
              }
            </div>
          )}
        </div>
      </ToggleSection>

      {/* Water points section */}
      <ToggleSection
        title="Points d'eau"
        icon={<FaTint />}
        count={filteredWaterPoints.length}
        isVisible={showWaterPoints}
        onToggle={() => onToggleWaterPoints(!showWaterPoints)}
        accentColor="blue"
      >
        <div className="space-y-3">
          {/* Filter */}
          <FilterSelect
            options={WATER_FILTER_OPTIONS}
            value={waterFilter}
            onChange={setWaterFilter}
            placeholder="Filtrer par type"
          />

          {/* List */}
          {filteredWaterPoints.length > 0 ? (
            <ScrollableList maxHeight="max-h-48 md:max-h-64">
              {filteredWaterPoints.map(waterPoint => (
                <POIItem
                  key={waterPoint.id}
                  name={waterPoint.name}
                  typeIcon="💧"
                  typeName={waterPoint.type}
                  onClick={() => handleWaterPointClick(waterPoint)}
                />
              ))}
            </ScrollableList>
          ) : (
            <div className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              {waterPoints.length === 0 
                ? '🔍 Aucun point d\'eau trouvé (possible timeout API)'
                : 'Aucun point d\'eau ne correspond aux filtres'
              }
            </div>
          )}
        </div>
      </ToggleSection>

      {/* Legend */}
      <Legend items={legendItems} />
    </div>
  );
}
