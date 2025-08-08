import {
  changeMapLayer,
  getAvailableMapLayers,
  MAP_LAYERS,
} from '@/services/mapService';
import type L from 'leaflet';
import React from 'react';

interface MapLayerSelectorProps {
  map: L.Map | null;
  currentLayer: keyof typeof MAP_LAYERS;
  onLayerChange: (layer: keyof typeof MAP_LAYERS) => void;
  className?: string;
}

const MapLayerSelector: React.FC<MapLayerSelectorProps> = ({
  map,
  currentLayer,
  onLayerChange,
  className = '',
}) => {
  const availableLayers = getAvailableMapLayers();

  const handleLayerChange = (layerKey: keyof typeof MAP_LAYERS) => {
    if (map && layerKey !== currentLayer) {
      changeMapLayer(map, layerKey);
      onLayerChange(layerKey);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-800 mb-3">
        Fond de carte
      </h3>
      <div className="space-y-2">
        {availableLayers.map(layer => (
          <label
            key={layer.key}
            className={`
              flex items-center p-2 rounded-md border cursor-pointer transition-colors
              ${layer.available ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}
              ${
                currentLayer === layer.key && layer.available
                  ? 'bg-blue-50 border-blue-200'
                  : 'border-gray-200'
              }
            `}
          >
            <input
              type="radio"
              name="mapLayer"
              value={layer.key}
              checked={currentLayer === layer.key}
              onChange={() => handleLayerChange(layer.key)}
              disabled={!layer.available}
              className="sr-only"
            />
            <div
              className={`
              w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center
              ${
                currentLayer === layer.key && layer.available
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }
            `}
            >
              {currentLayer === layer.key && layer.available && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            <div className="flex-1">
              <div
                className={`
                text-sm font-medium
                ${layer.available ? 'text-gray-800' : 'text-gray-400'}
              `}
              >
                {layer.name}
              </div>
              {!layer.available && layer.key.startsWith('ign') && (
                <div className="text-xs text-gray-400 mt-1">
                  Clé API IGN requise
                </div>
              )}
              {layer.key === 'ignTopo' && layer.available && (
                <div className="text-xs text-green-600 mt-1">
                  ✓ Avec courbes de niveau
                </div>
              )}
              {layer.key === 'osmFrance' && (
                <div className="text-xs text-blue-600 mt-1">
                  ✓ Optimisé France + sentiers GR
                </div>
              )}
              {layer.key === 'cartoPositron' && (
                <div className="text-xs text-gray-600 mt-1">
                  ✓ Style épuré pour randonnée
                </div>
              )}
            </div>
          </label>
        ))}
      </div>

      {/* Information about map layers */}
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <h4 className="text-xs font-semibold text-blue-800 mb-1">
          🗺️ Cartes Optimisées France
        </h4>
        <p className="text-xs text-blue-700">
          <strong>OSM France</strong> : Excellent pour la randonnée avec
          sentiers GR/GRP.
          <strong>IGN</strong> : Cartes officielles (clé API requise).
          <strong>Carto</strong> : Style épuré et moderne.
        </p>
      </div>
    </div>
  );
};

export default MapLayerSelector;
