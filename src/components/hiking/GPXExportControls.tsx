import { exportToGPX } from '@/services/hikingService';
import type {
  GPXExportOptions,
  HikingRoute,
  Refuge,
  WaterPoint,
} from '@/types/hiking';
import React, { useState } from 'react';
import { FaCog, FaDownload, FaFile } from 'react-icons/fa';

interface GPXExportControlsProps {
  route: HikingRoute | null;
  refuges?: Refuge[];
  waterPoints?: WaterPoint[];
  onExport?: (gpxContent: string, filename: string) => void;
}

export default function GPXExportControls({
  route,
  refuges = [],
  waterPoints = [],
  onExport,
}: GPXExportControlsProps): React.JSX.Element {
  const [showOptions, setShowOptions] = useState(false);
  const [exportOptions, setExportOptions] = useState<GPXExportOptions>({
    includeWaypoints: true,
    includeRefuges: true,
    includeWaterPoints: true,
    includeEnrichedPOIs: false,
    splitByStages: false,
    includeElevation: true,
  });

  const handleExport = () => {
    if (!route) return;

    try {
      const gpxContent = exportToGPX(
        route,
        exportOptions,
        refuges,
        waterPoints
      );
      const filename = `${route.name.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.gpx`;

      if (onExport) {
        onExport(gpxContent, filename);
      } else {
        // Default download behavior
        const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Erreur lors de l'export GPX:", error);
      alert("Erreur lors de l'export GPX. Veuillez réessayer.");
    }
  };

  const updateOption = (key: keyof GPXExportOptions, value: boolean) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  if (!route) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 text-gray-500">
          <FaFile className="w-4 h-4" />
          <span className="text-sm">
            Créez un itinéraire pour exporter en GPX
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          <FaFile className="inline mr-2" />
          Export GPX
        </h3>

        <button
          onClick={() => setShowOptions(!showOptions)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FaCog className="w-4 h-4" />
        </button>
      </div>

      {/* Export Options */}
      {showOptions && (
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
            Options d'export
          </h4>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={exportOptions.includeWaypoints}
                onChange={e =>
                  updateOption('includeWaypoints', e.target.checked)
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Points de passage</span>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={exportOptions.includeRefuges}
                onChange={e => updateOption('includeRefuges', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Refuges ({refuges.length})</span>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={exportOptions.includeWaterPoints}
                onChange={e =>
                  updateOption('includeWaterPoints', e.target.checked)
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Points d'eau ({waterPoints.length})</span>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={exportOptions.splitByStages}
                onChange={e => updateOption('splitByStages', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Séparer par étapes</span>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={exportOptions.includeElevation}
                onChange={e =>
                  updateOption('includeElevation', e.target.checked)
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Données d'altitude</span>
            </label>
          </div>
        </div>
      )}

      {/* Export Summary */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800">
          <div className="font-medium mb-1">{route.name}</div>
          <div className="text-xs space-y-1">
            <div>📏 {route.totalDistance.toFixed(1)} km</div>
            <div>
              📈 +{route.totalAscent}m / -{route.totalDescent}m
            </div>
            <div>
              🏔️ {route.minElevation}m → {route.maxElevation}m
            </div>
            <div>
              📍 {route.stages.length} étape{route.stages.length > 1 ? 's' : ''}
            </div>
            {exportOptions.includeRefuges && refuges.length > 0 && (
              <div>
                🏠 {refuges.length} refuge{refuges.length > 1 ? 's' : ''}
              </div>
            )}
            {exportOptions.includeWaterPoints && waterPoints.length > 0 && (
              <div>
                💧 {waterPoints.length} point{waterPoints.length > 1 ? 's' : ''}{' '}
                d'eau
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
      >
        <FaDownload className="w-4 h-4" />
        Télécharger GPX
      </button>

      {/* Export Info */}
      <div className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 p-2 rounded">
        💡 Le fichier GPX peut être importé dans des applications comme Garmin
        Connect, Strava, ou des GPS de randonnée.
      </div>
    </div>
  );
}
