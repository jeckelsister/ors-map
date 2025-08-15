import { REFUGE_TYPES, WATER_POINT_TYPES } from '@/constants/hiking';
import type { Refuge, WaterPoint } from '@/types/hiking';
import React, { useState, useMemo, useCallback } from 'react';
import { FaHome, FaTint } from 'react-icons/fa';
import ToggleSection from '@/ui/ToggleSection';
import { FilterSelect, ScrollableList, POIItem } from '@/ui/POIComponents';
import Legend from '@/ui/Legend';

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
  { value: 'gardé', label: 'Guarded refuges' },
  { value: 'libre', label: 'Free refuges' },
  { value: 'bivouac', label: 'Bivouacs' }
];

const WATER_FILTER_OPTIONS = [
  { value: 'source', label: 'Springs' },
  { value: 'fontaine', label: 'Fountains' },
  { value: 'rivière', label: 'Rivers' },
  { value: 'lac', label: 'Lakes' }
];

// Legend configuration
const legendItems = [
  { type: 'refuge', name: 'Refuges', color: '#e53e3e' },
  { type: 'waterPoint', name: 'Water points', color: '#3182ce' },
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
    if (!refugeFilter) return refuges;
    return refuges.filter(refuge => {
      const type = REFUGE_TYPES[refuge.type as keyof typeof REFUGE_TYPES];
      return type === refugeFilter;
    });
  }, [refuges, refugeFilter]);

  // Filter water points based on selected filter
  const filteredWaterPoints = useMemo(() => {
    if (!waterFilter) return waterPoints;
    return waterPoints.filter(point => {
      const type = WATER_POINT_TYPES[point.type as keyof typeof WATER_POINT_TYPES];
      return type === waterFilter;
    });
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
        isOpen={showRefuges}
        onToggle={onToggleRefuges}
      >
        <div className="space-y-3">
          {/* Filter */}
          <FilterSelect
            options={REFUGE_FILTER_OPTIONS}
            value={refugeFilter}
            onChange={setRefugeFilter}
            placeholder="Filter by type"
          />

          {/* List */}
          <ScrollableList maxHeight="200px">
            {filteredRefuges.map(refuge => (
              <POIItem
                key={refuge.id}
                poi={refuge}
                type="refuge"
                onClick={handleRefugeClick}
              />
            ))}
            {filteredRefuges.length === 0 && (
              <div className="text-gray-500 text-sm text-center py-4">
                {refuges.length === 0 
                  ? '🔍 Aucun refuge trouvé (possible timeout API)'
                  : 'Aucun refuge ne correspond aux filtres'
                }
              </div>
            )}
          </ScrollableList>
        </div>
      </ToggleSection>

      {/* Water points section */}
      <ToggleSection
        title="Water points"
        icon={<FaTint />}
        isOpen={showWaterPoints}
        onToggle={onToggleWaterPoints}
      >
        <div className="space-y-3">
          {/* Filter */}
          <FilterSelect
            options={WATER_FILTER_OPTIONS}
            value={waterFilter}
            onChange={setWaterFilter}
            placeholder="Filter by type"
          />

          {/* List */}
          <ScrollableList maxHeight="200px">
            {filteredWaterPoints.map(waterPoint => (
              <POIItem
                key={waterPoint.id}
                poi={waterPoint}
                type="waterPoint"
                onClick={handleWaterPointClick}
              />
            ))}
            {filteredWaterPoints.length === 0 && (
              <div className="text-gray-500 text-sm text-center py-4">
                {waterPoints.length === 0 
                  ? '🔍 Aucun point d\'eau trouvé (possible timeout API)'
                  : 'Aucun point d\'eau ne correspond aux filtres'
                }
              </div>
            )}
          </ScrollableList>
        </div>
      </ToggleSection>

      {/* Legend */}
      <Legend items={legendItems} />
    </div>
  );
}
