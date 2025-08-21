import type { EnrichedPOIs, Refuge, WaterPoint } from '@/types/hiking';
import { createLegendIconSvg } from '@/utils/map/mapIcons';

interface MapLegendProps {
  // Route and waypoint data
  waypoints: Array<{ lat: number; lng: number; name?: string }>;
  hasRoute: boolean;

  // POI data and visibility
  refuges: Refuge[];
  waterPoints: WaterPoint[];
  enrichedPOIs: EnrichedPOIs;

  // Visibility state
  showRefuges: boolean;
  showWaterPoints: boolean;
  showPeaks: boolean;
  showPasses: boolean;
  showViewpoints: boolean;
  showHeritage: boolean;
  showLakes: boolean;

  // Toggle handlers
  onToggleRefuges?: (show: boolean) => void;
  onToggleWaterPoints?: (show: boolean) => void;
  onTogglePeaks?: (show: boolean) => void;
  onTogglePasses?: (show: boolean) => void;
  onToggleViewpoints?: (show: boolean) => void;
  onToggleHeritage?: (show: boolean) => void;
  onToggleLakes?: (show: boolean) => void;
}

/**
 * Map legend component showing all available POI types and waypoints
 */
export const MapLegend = ({
  waypoints,
  hasRoute,
  refuges,
  waterPoints,
  enrichedPOIs,
  showRefuges,
  showWaterPoints,
  showPeaks,
  showPasses,
  showViewpoints,
  showHeritage,
  showLakes,
  onToggleRefuges,
  onToggleWaterPoints,
  onTogglePeaks,
  onTogglePasses,
  onToggleViewpoints,
  onToggleHeritage,
  onToggleLakes,
}: MapLegendProps) => {
  return (
    <div className="absolute bottom-4 left-4 z-10 bg-white bg-opacity-95 rounded-lg p-3 text-sm shadow-lg border border-gray-200">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Waypoint legend */}
        {waypoints.length > 0 && (
          <>
            <div className="flex items-center space-x-1">
              <div className="w-5 h-5 bg-green-600 rounded-full text-white text-xs flex items-center justify-center font-bold">
                A
              </div>
              <span>Départ</span>
            </div>
            {waypoints.length > 2 && (
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-blue-600 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  •
                </div>
                <span>Étapes</span>
              </div>
            )}
            {waypoints.length > 1 && (
              <div className="flex items-center space-x-1">
                <div className="w-5 h-5 bg-red-600 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  B
                </div>
                <span>Arrivée</span>
              </div>
            )}
          </>
        )}

        {/* Route legend */}
        {hasRoute && (
          <div className="flex items-center space-x-1">
            <div className="w-4 h-1 bg-pink-600 rounded"></div>
            <span>Itinéraire</span>
          </div>
        )}

        {/* Refuges toggle */}
        {refuges.length > 0 && (
          <button
            onClick={() => onToggleRefuges?.(!showRefuges)}
            className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
              showRefuges
                ? 'bg-green-100 hover:bg-green-200'
                : 'bg-gray-100 hover:bg-gray-200 opacity-60'
            }`}
            title={showRefuges ? 'Masquer les refuges' : 'Afficher les refuges'}
          >
            <span
              dangerouslySetInnerHTML={{ __html: createLegendIconSvg('home') }}
            />
            <span className={showRefuges ? 'text-green-800' : 'text-gray-600'}>
              Refuges
            </span>
          </button>
        )}

        {/* Water points toggle */}
        {waterPoints.length > 0 && (
          <button
            onClick={() => onToggleWaterPoints?.(!showWaterPoints)}
            className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
              showWaterPoints
                ? 'bg-blue-100 hover:bg-blue-200'
                : 'bg-gray-100 hover:bg-gray-200 opacity-60'
            }`}
            title={
              showWaterPoints
                ? "Masquer les points d'eau"
                : "Afficher les points d'eau"
            }
          >
            <span
              dangerouslySetInnerHTML={{
                __html: createLegendIconSvg('droplets'),
              }}
            />
            <span
              className={showWaterPoints ? 'text-blue-800' : 'text-gray-600'}
            >
              Points d'eau
            </span>
          </button>
        )}

        {/* Peaks toggle */}
        {enrichedPOIs.peaks.length > 0 && (
          <button
            onClick={() => onTogglePeaks?.(!showPeaks)}
            className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
              showPeaks
                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                : 'bg-gray-100 hover:bg-gray-200 opacity-60'
            }`}
            title={showPeaks ? 'Masquer les sommets' : 'Afficher les sommets'}
          >
            <span
              dangerouslySetInnerHTML={{
                __html: createLegendIconSvg('mountain'),
              }}
            />
            <span className={showPeaks ? 'text-white' : 'text-gray-600'}>
              Sommets
            </span>
          </button>
        )}

        {/* Passes toggle */}
        {enrichedPOIs.passes.length > 0 && (
          <button
            onClick={() => onTogglePasses?.(!showPasses)}
            className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
              showPasses
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-gray-100 hover:bg-gray-200 opacity-60'
            }`}
            title={showPasses ? 'Masquer les cols' : 'Afficher les cols'}
          >
            <span
              dangerouslySetInnerHTML={{
                __html: createLegendIconSvg('castle'),
              }}
            />
            <span className={showPasses ? 'text-white' : 'text-gray-600'}>
              Cols
            </span>
          </button>
        )}

        {/* Viewpoints toggle */}
        {enrichedPOIs.viewpoints.length > 0 && (
          <button
            onClick={() => onToggleViewpoints?.(!showViewpoints)}
            className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
              showViewpoints
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-100 hover:bg-gray-200 opacity-60'
            }`}
            title={
              showViewpoints
                ? 'Masquer les points de vue'
                : 'Afficher les points de vue'
            }
          >
            <span
              dangerouslySetInnerHTML={{ __html: createLegendIconSvg('eye') }}
            />
            <span className={showViewpoints ? 'text-white' : 'text-gray-600'}>
              Points de vue
            </span>
          </button>
        )}

        {/* Heritage toggle */}
        {enrichedPOIs.heritage.length > 0 && (
          <button
            onClick={() => onToggleHeritage?.(!showHeritage)}
            className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
              showHeritage
                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                : 'bg-gray-100 hover:bg-gray-200 opacity-60'
            }`}
            title={
              showHeritage ? 'Masquer le patrimoine' : 'Afficher le patrimoine'
            }
          >
            <span
              dangerouslySetInnerHTML={{
                __html: createLegendIconSvg('landmark'),
              }}
            />
            <span className={showHeritage ? 'text-white' : 'text-gray-600'}>
              Patrimoine
            </span>
          </button>
        )}

        {/* Lakes toggle */}
        {enrichedPOIs.lakes.length > 0 && (
          <button
            onClick={() => onToggleLakes?.(!showLakes)}
            className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
              showLakes
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 opacity-60'
            }`}
            title={showLakes ? 'Masquer les lacs' : 'Afficher les lacs'}
          >
            <span
              dangerouslySetInnerHTML={{ __html: createLegendIconSvg('waves') }}
            />
            <span className={showLakes ? 'text-white' : 'text-gray-600'}>
              Lacs
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
