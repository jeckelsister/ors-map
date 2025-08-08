import { REFUGE_TYPES, WATER_POINT_TYPES } from '@/constants/hiking';
import type { Refuge, WaterPoint } from '@/types/hiking';
import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaFilter, FaHome, FaTint } from 'react-icons/fa';

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

  const filteredRefuges = refuges.filter(
    refuge => filterRefugeType === 'all' || refuge.type === filterRefugeType
  );

  const filteredWaterPoints = waterPoints.filter(
    point => filterWaterType === 'all' || point.type === filterWaterType
  );

  const getRefugeTypeInfo = (type: string) => {
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
  };

  const getWaterPointTypeInfo = (type: string) => {
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
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Points d'intérêt</h3>

      {/* Refuges Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaHome className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium">
              Refuges ({refuges.length})
            </span>
          </div>

          <button
            onClick={() => onToggleRefuges(!showRefuges)}
            className={`p-2 rounded-lg transition-colors ${
              showRefuges
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {showRefuges ? (
              <FaEye className="w-3 h-3" />
            ) : (
              <FaEyeSlash className="w-3 h-3" />
            )}
          </button>
        </div>

        {showRefuges && refuges.length > 0 && (
          <div className="space-y-2">
            {/* Refuge Filter */}
            <div className="flex items-center gap-2">
              <FaFilter className="w-3 h-3 text-gray-500" />
              <select
                value={filterRefugeType}
                onChange={e => setFilterRefugeType(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              >
                <option value="all">Tous les types</option>
                <option value="gardé">Refuges gardés</option>
                <option value="libre">Refuges libres</option>
                <option value="bivouac">Bivouacs</option>
              </select>
            </div>

            {/* Refuges List */}
            <div className="max-h-32 overflow-y-auto space-y-1">
              {filteredRefuges.map(refuge => {
                const typeInfo = getRefugeTypeInfo(refuge.type);
                return (
                  <button
                    key={refuge.id}
                    onClick={() => onRefugeSelect?.(refuge)}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-sm">{typeInfo.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-800 truncate">
                          {refuge.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {typeInfo.name}
                          {refuge.elevation > 0 && ` • ${refuge.elevation}m`}
                        </div>
                        {refuge.capacity && (
                          <div className="text-xs text-gray-400">
                            Capacité: {refuge.capacity} places
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {showRefuges && refuges.length === 0 && (
          <div className="text-xs text-gray-500 italic">
            Aucun refuge trouvé près de l'itinéraire
          </div>
        )}
      </div>

      {/* Water Points Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaTint className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">
              Points d'eau ({waterPoints.length})
            </span>
          </div>

          <button
            onClick={() => onToggleWaterPoints(!showWaterPoints)}
            className={`p-2 rounded-lg transition-colors ${
              showWaterPoints
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {showWaterPoints ? (
              <FaEye className="w-3 h-3" />
            ) : (
              <FaEyeSlash className="w-3 h-3" />
            )}
          </button>
        </div>

        {showWaterPoints && waterPoints.length > 0 && (
          <div className="space-y-2">
            {/* Water Points Filter */}
            <div className="flex items-center gap-2">
              <FaFilter className="w-3 h-3 text-gray-500" />
              <select
                value={filterWaterType}
                onChange={e => setFilterWaterType(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              >
                <option value="all">Tous les types</option>
                <option value="source">Sources</option>
                <option value="fontaine">Fontaines</option>
                <option value="rivière">Rivières</option>
                <option value="lac">Lacs</option>
              </select>
            </div>

            {/* Water Points List */}
            <div className="max-h-32 overflow-y-auto space-y-1">
              {filteredWaterPoints.map(waterPoint => {
                const typeInfo = getWaterPointTypeInfo(waterPoint.type);
                const qualityColor = {
                  potable: 'text-green-600',
                  treatable: 'text-yellow-600',
                  'non-potable': 'text-red-600',
                }[waterPoint.quality];

                return (
                  <button
                    key={waterPoint.id}
                    onClick={() => onWaterPointSelect?.(waterPoint)}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-sm">{typeInfo.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-800 truncate">
                          {waterPoint.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {typeInfo.name}
                          {waterPoint.elevation > 0 &&
                            ` • ${waterPoint.elevation}m`}
                        </div>
                        <div className={`text-xs ${qualityColor}`}>
                          {waterPoint.quality === 'potable' && '✓ Potable'}
                          {waterPoint.quality === 'treatable' && '⚠️ À traiter'}
                          {waterPoint.quality === 'non-potable' &&
                            '✗ Non potable'}
                          {waterPoint.reliability === 'seasonal' &&
                            ' • Saisonnier'}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {showWaterPoints && waterPoints.length === 0 && (
          <div className="text-xs text-gray-500 italic">
            Aucun point d'eau trouvé près de l'itinéraire
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="text-xs font-medium text-gray-700 mb-2">Légende</div>
        <div className="space-y-1 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>🏠 Gardé</div>
            <div>🏚️ Libre</div>
            <div>⛺ Bivouac</div>
            <div>💧 Source</div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>🚰 Fontaine</div>
            <div>🌊 Rivière</div>
            <div>🏔️ Lac</div>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
