import React, { useMemo } from 'react';
import { FaArrowDown, FaArrowUp, FaMountain } from 'react-icons/fa';

import type { ElevationPoint, HikingRoute } from '@/types/hiking';

interface ElevationProfileProps {
  route: HikingRoute | null;
  height?: number;
  showStages?: boolean;
}

export default function ElevationProfile({
  route,
  height = 200,
  showStages = true,
}: ElevationProfileProps): React.JSX.Element {
  const { pathData, markers, stats } = useMemo(() => {
    if (!route) {
      return { pathData: '', markers: [], stats: null };
    }

    // Combine all elevation points from all stages
    let allPoints: ElevationPoint[] = [];
    let cumulativeDistance = 0;
    const stageMarkers: { distance: number; name: string }[] = [];

    route.stages.forEach((stage, index) => {
      if (index > 0) {
        stageMarkers.push({
          distance: cumulativeDistance,
          name: stage.name,
        });
      }

      const adjustedPoints = stage.elevationProfile.map(point => ({
        ...point,
        distance: cumulativeDistance + point.distance,
      }));

      allPoints = [...allPoints, ...adjustedPoints];
      cumulativeDistance += stage.distance;
    });

    if (allPoints.length === 0) {
      return { pathData: '', markers: [], stats: null };
    }


    const width = 350;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Find min/max values
    const maxDistance = Math.max(...allPoints.map(p => p.distance));
    const minElevation = Math.min(...allPoints.map(p => p.elevation));
    const maxElevation = Math.max(...allPoints.map(p => p.elevation));

    // Add some padding to elevation range
    const elevationPadding = (maxElevation - minElevation) * 0.1;
    const adjustedMinElevation = minElevation - elevationPadding;
    const adjustedMaxElevation = maxElevation + elevationPadding;

    // Create path data
    const pathPoints = allPoints
      .map((point, index) => {
        const x = padding.left + (point.distance / maxDistance) * chartWidth;
        const y =
          padding.top +
          chartHeight -
          ((point.elevation - adjustedMinElevation) /
            (adjustedMaxElevation - adjustedMinElevation)) *
            chartHeight;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    // Create area fill
    const areaPath =
      pathPoints +
      ` L ${padding.left + chartWidth} ${padding.top + chartHeight}` +
      ` L ${padding.left} ${padding.top + chartHeight} Z`;


    const markers = showStages
      ? stageMarkers.map(marker => ({
          ...marker,
          x: padding.left + (marker.distance / maxDistance) * chartWidth,
        }))
      : [];


    const stats = {
      totalDistance: route.totalDistance,
      totalAscent: route.totalAscent,
      totalDescent: route.totalDescent,
      minElevation: route.minElevation,
      maxElevation: route.maxElevation,
      elevationGain: route.maxElevation - route.minElevation,
    };

    return {
      pathData: areaPath,
      markers,
      stats,
      chartInfo: {
        width,
        height,
        padding,
        chartWidth,
        chartHeight,
        maxDistance,
        minElevation: adjustedMinElevation,
        maxElevation: adjustedMaxElevation,
      },
    };
  }, [route, height, showStages]);

  if (!route || !stats) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 text-gray-500">
          <FaMountain className="w-4 h-4" />
          <span className="text-sm">
            Créez un itinéraire pour voir le profil altimétrique
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-700">
            <FaArrowUp className="w-3 h-3" />
            <span className="text-xs font-medium">Dénivelé +</span>
          </div>
          <div className="text-lg font-bold text-green-800">
            {stats.totalAscent}m
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-red-700">
            <FaArrowDown className="w-3 h-3" />
            <span className="text-xs font-medium">Dénivelé -</span>
          </div>
          <div className="text-lg font-bold text-red-800">
            {stats.totalDescent}m
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <div className="font-medium text-gray-700">Distance</div>
          <div className="text-blue-600 font-bold">
            {stats.totalDistance.toFixed(1)} km
          </div>
        </div>
        <div className="text-center">
          <div className="font-medium text-gray-700">Alt. min</div>
          <div className="text-purple-600 font-bold">{stats.minElevation}m</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-gray-700">Alt. max</div>
          <div className="text-orange-600 font-bold">{stats.maxElevation}m</div>
        </div>
      </div>

      {/* Elevation Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-2 overflow-x-auto">
        <div className="flex items-center gap-2 mb-2">
          <FaMountain className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            Profil altimétrique
          </span>
        </div>

        <div className="relative">
          <svg width="350" height={height} className="w-full">
            {/* Background grid */}
            <defs>
              <pattern
                id="grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Elevation area */}
            <path
              d={pathData}
              fill="url(#elevationGradient)"
              stroke="#3b82f6"
              strokeWidth="2"
              opacity="0.8"
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient
                id="elevationGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Stage markers */}
            {markers.map((marker, index) => (
              <g key={index}>
                <line
                  x1={marker.x}
                  y1="20"
                  x2={marker.x}
                  y2={height - 40}
                  stroke="#ef4444"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  opacity="0.7"
                />
                <text
                  x={marker.x}
                  y="15"
                  fontSize="10"
                  fill="#ef4444"
                  textAnchor="middle"
                  className="font-medium"
                >
                  E{index + 2}
                </text>
              </g>
            ))}

            {/* Y-axis labels */}
            <text
              x="15"
              y="25"
              fontSize="10"
              fill="#6b7280"
              textAnchor="middle"
            >
              {stats.maxElevation}m
            </text>
            <text
              x="15"
              y={height - 45}
              fontSize="10"
              fill="#6b7280"
              textAnchor="middle"
            >
              {stats.minElevation}m
            </text>

            {/* X-axis labels */}
            <text
              x="50"
              y={height - 10}
              fontSize="10"
              fill="#6b7280"
              textAnchor="start"
            >
              0 km
            </text>
            <text
              x="320"
              y={height - 10}
              fontSize="10"
              fill="#6b7280"
              textAnchor="end"
            >
              {stats.totalDistance.toFixed(1)} km
            </text>
          </svg>
        </div>
      </div>

      {/* Legend */}
      {showStages && markers.length > 0 && (
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <div className="font-medium mb-1">Légende :</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-blue-500"></div>
              <span>Profil</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 border-t border-red-500 border-dashed"></div>
              <span>Étapes</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
