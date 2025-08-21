import { Mountain } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { HikingRoute } from '@/types/hiking';

interface RouteStatsCardProps {
  route: HikingRoute;
}

interface StatItemProps {
  value: string | number;
  label: string;
  bgColor: string;
  textColor: string;
}

/**
 * Individual stat item component
 */
function StatItem({ value, label, bgColor, textColor }: StatItemProps) {
  return (
    <div className={`text-center ${bgColor} rounded-lg p-4`}>
      <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

/**
 * Route statistics card showing distance, elevation, and stages
 */
export default function RouteStatsCard({
  route,
}: RouteStatsCardProps): React.JSX.Element {
  const stats = [
    {
      value: route.totalDistance ? route.totalDistance.toFixed(1) : '0',
      label: 'km',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      value: `+${route.totalAscent || 0}`,
      label: 'm',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      value: `-${route.totalDescent || 0}`,
      label: 'm',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      value: route.stages ? route.stages.length : 0,
      label: `étape${route.stages && route.stages.length > 1 ? 's' : ''}`,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mountain className="w-5 h-5" />
          Résumé de l'itinéraire
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <StatItem key={index} {...stat} />
          ))}
        </div>

        {/* Stages Details */}
        {route.stages && route.stages.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Détail des étapes:</h4>
            <div className="space-y-2">
              {route.stages.map(stage => (
                <div
                  key={stage.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium">{stage.name || 'Étape'}</span>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      {stage.distance ? stage.distance.toFixed(1) : '0'}km
                    </Badge>
                    <Badge variant="outline" className="text-green-600">
                      +{stage.ascent || 0}m
                    </Badge>
                    <Badge variant="outline" className="text-orange-600">
                      -{stage.descent || 0}m
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
