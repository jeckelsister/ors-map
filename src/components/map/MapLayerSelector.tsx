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
        {availableLayers.map(
          (layer: {
            key: keyof typeof MAP_LAYERS;
            name: string;
            available: boolean;
          }) => (
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
                {layer.key === 'osmFrance' && (
                  <div className="text-xs text-blue-600 mt-1">
                    🥇 TOP Rando : GR/GRP + refuges + sources
                  </div>
                )}
                {layer.key === 'openTopoMap' && (
                  <div className="text-xs text-purple-600 mt-1">
                    🏔️ Style Suisse + courbes + relief
                  </div>
                )}
                {layer.key === 'cyclOSM' && (
                  <div className="text-xs text-orange-600 mt-1">
                    🚴 Pistes cyclables + sentiers
                  </div>
                )}
              </div>
            </label>
          )
        )}
      </div>

      {/* Information about map layers */}
      <div className="mt-4 p-3 bg-green-50 rounded-md">
        <h4 className="text-xs font-semibold text-green-800 mb-2">
          🎯 3 Cartes Parfaites pour la Randonnée
        </h4>
        <div className="space-y-1 text-xs text-green-700">
          <div>
            <strong>🥇 OSM France</strong> : LA référence rando (GR/GRP +
            refuges)
          </div>
          <div>
            <strong>🏔️ OpenTopoMap</strong> : Relief et courbes de niveau pros
          </div>
          <div>
            <strong>🚴 CyclOSM</strong> : VTT et tous sentiers balisés
          </div>
        </div>
        <div className="mt-2 text-xs text-green-600">
          ✨ Toutes gratuites, sans clé API requise
        </div>
      </div>
    </div>
  );
};

export default MapLayerSelector;
