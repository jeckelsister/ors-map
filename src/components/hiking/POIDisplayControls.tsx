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

// Configuration des options de filtre
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

// Configuration de la légende
const LEGEND_ITEMS = [
  { icon: '🏠', label: 'Gardé' },
  { icon: '🏚️', label: 'Libre' },
  { icon: '⛺', label: 'Bivouac' },
  { icon: '💧', label: 'Source' },
  { icon: '🚰', label: 'Fontaine' },
  { icon: '🌊', label: 'Rivière' },
  { icon: '🏔️', label: 'Lac' }
];

export default function POIDisplayControls({
  refuges,
  waterPoints,
  showRefuges,
  showWaterPoints,
  onToggleRefuges,
  onToggleWaterPoints,
  onRefugeSelect,
  onWaterPointSelect,
}: POIDisplayControlsProps): React.JSX.Element {
  const [filterRefugeType, setFilterRefugeType] = useState<string>('all');
  const [filterWaterType, setFilterWaterType] = useState<string>('all');

  // Helpers pour les types
  const getRefugeTypeInfo = useCallback((type: string) => {
    switch (type) {
      case 'gardé':
        return REFUGE_TYPES.GARDE;
      case 'libre':
        return REFUGE_TYPES.LIBRE;
      case 'bivouac':
        return REFUGE_TYPES.BIVOUAC;
      default:
        return { name: type, icon: '🏠', color: '#6b7280' };
    }
  }, []);

  const getWaterPointTypeInfo = useCallback((type: string) => {
    switch (type) {
      case 'source':
        return WATER_POINT_TYPES.SOURCE;
      case 'fontaine':
        return WATER_POINT_TYPES.FONTAINE;
      case 'rivière':
        return WATER_POINT_TYPES.RIVIERE;
      case 'lac':
        return WATER_POINT_TYPES.LAC;
      default:
        return { name: type, icon: '💧', color: '#6b7280' };
    }
  }, []);

  // Helpers pour la qualité de l'eau
  const getWaterQualityInfo = useCallback((quality: string) => {
    const qualityColor = {
      potable: 'text-green-600',
      treatable: 'text-yellow-600',
      'non-potable': 'text-red-600',
    }[quality] || 'text-gray-600';

    const qualityText = {
      potable: '✓ Potable',
      treatable: '⚠️ À traiter',
      'non-potable': '✗ Non potable',
    }[quality] || quality;

    return { color: qualityColor, text: qualityText };
  }, []);

  // Filtres memoizés
  const filteredRefuges = useMemo(
    () => refuges.filter(refuge => filterRefugeType === 'all' || refuge.type === filterRefugeType),
    [refuges, filterRefugeType]
  );

  const filteredWaterPoints = useMemo(
    () => waterPoints.filter(point => filterWaterType === 'all' || point.type === filterWaterType),
    [waterPoints, filterWaterType]
  );

  // Handlers
  const handleToggleRefuges = useCallback(() => {
    onToggleRefuges(!showRefuges);
  }, [showRefuges, onToggleRefuges]);

  const handleToggleWaterPoints = useCallback(() => {
    onToggleWaterPoints(!showWaterPoints);
  }, [showWaterPoints, onToggleWaterPoints]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Points d'intérêt</h3>
        <div className="text-xs text-gray-500 italic">
          📍 Cliquez pour zoomer
        </div>
      </div>

      {/* Section Refuges */}
      <ToggleSection
        title="Refuges"
        icon={<FaHome className="w-4 h-4 text-gray-600" />}
        count={refuges.length}
        isVisible={showRefuges}
        onToggle={handleToggleRefuges}
        accentColor="green"
      >
        {refuges.length > 0 ? (
          <div className="space-y-2">
            <FilterSelect
              value={filterRefugeType}
              onChange={setFilterRefugeType}
              options={REFUGE_FILTER_OPTIONS}
            />
            
            <ScrollableList isEmpty={filteredRefuges.length === 0}>
              {filteredRefuges.map(refuge => {
                const typeInfo = getRefugeTypeInfo(refuge.type);
                return (
                  <POIItem
                    key={refuge.id}
                    name={refuge.name}
                    typeIcon={typeInfo.icon}
                    typeName={typeInfo.name}
                    elevation={refuge.elevation}
                    onClick={() => onRefugeSelect?.(refuge)}
                  >
                    {refuge.capacity && (
                      <div className="text-xs text-gray-400">
                        Capacité: {refuge.capacity} places
                      </div>
                    )}
                  </POIItem>
                );
              })}
            </ScrollableList>
          </div>
        ) : (
          <div className="text-xs text-gray-500 italic">
            Aucun refuge trouvé près de l'itinéraire
          </div>
        )}
      </ToggleSection>

      {/* Section Points d'eau */}
      <ToggleSection
        title="Points d'eau"
        icon={<FaTint className="w-4 h-4 text-blue-600" />}
        count={waterPoints.length}
        isVisible={showWaterPoints}
        onToggle={handleToggleWaterPoints}
        accentColor="blue"
      >
        {waterPoints.length > 0 ? (
          <div className="space-y-2">
            <FilterSelect
              value={filterWaterType}
              onChange={setFilterWaterType}
              options={WATER_FILTER_OPTIONS}
            />
            
            <ScrollableList isEmpty={filteredWaterPoints.length === 0}>
              {filteredWaterPoints.map(waterPoint => {
                const typeInfo = getWaterPointTypeInfo(waterPoint.type);
                const qualityInfo = getWaterQualityInfo(waterPoint.quality);
                
                return (
                  <POIItem
                    key={waterPoint.id}
                    name={waterPoint.name}
                    typeIcon={typeInfo.icon}
                    typeName={typeInfo.name}
                    elevation={waterPoint.elevation}
                    onClick={() => onWaterPointSelect?.(waterPoint)}
                  >
                    <div className={`text-xs ${qualityInfo.color}`}>
                      {qualityInfo.text}
                      {waterPoint.reliability === 'seasonal' && ' • Saisonnier'}
                    </div>
                  </POIItem>
                );
              })}
            </ScrollableList>
          </div>
        ) : (
          <div className="text-xs text-gray-500 italic">
            Aucun point d'eau trouvé près de l'itinéraire
          </div>
        )}
      </ToggleSection>

      {/* Légende */}
      <Legend items={LEGEND_ITEMS} />
    </div>
  );
}
