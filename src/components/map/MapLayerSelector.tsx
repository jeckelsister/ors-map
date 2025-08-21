import { MAP_LAYERS, type MapLayerKey } from '@/utils/map/mapLayers';
import { useState } from 'react';

interface MapLayerSelectorProps {
  currentLayer: MapLayerKey;
  onLayerChange: (layer: MapLayerKey) => void;
}

/**
 * Map layer selector component for switching between different hiking map types
 */
export const MapLayerSelector = ({
  currentLayer,
  onLayerChange,
}: MapLayerSelectorProps) => {
  const [showLayerSelector, setShowLayerSelector] = useState(false);

  return (
    <div className="absolute top-4 left-4 z-10">
      <button
        onClick={() => setShowLayerSelector(!showLayerSelector)}
        className={`
          relative bg-white hover:bg-blue-50 border-2 rounded-xl p-3 shadow-xl
          transition-all duration-200 group
          ${showLayerSelector ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
        `}
        title="🗺️ Sélectionner les cartes de randonnée"
      >
        <svg
          className={`w-6 h-6 transition-colors ${
            showLayerSelector
              ? 'text-blue-600'
              : 'text-gray-600 group-hover:text-blue-600'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
      </button>

      {showLayerSelector && (
        <div className="absolute top-16 left-0 min-w-[280px] bg-white rounded-lg shadow-lg border p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Fond de carte
          </h3>
          <div className="space-y-2">
            {Object.entries(MAP_LAYERS).map(([key, layer]) => (
              <label
                key={key}
                className={`
                  flex items-center p-2 rounded-md border cursor-pointer transition-colors hover:bg-gray-50
                  ${
                    currentLayer === key
                      ? 'bg-blue-50 border-blue-200'
                      : 'border-gray-200'
                  }
                `}
              >
                <input
                  type="radio"
                  name="mapLayer"
                  value={key}
                  checked={currentLayer === key}
                  onChange={() => onLayerChange(key as MapLayerKey)}
                  className="sr-only"
                />
                <div
                  className={`
                    w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center
                    ${
                      currentLayer === key
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }
                  `}
                >
                  {currentLayer === key && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">
                    {layer.name}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
