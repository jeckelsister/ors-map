import { useCallback, useRef } from 'react';

import type { Coordinates } from '@/types/hiking';

interface UseMapClickHandlerProps {
  setWaypoints: (
    waypoints: Coordinates[] | ((prev: Coordinates[]) => Coordinates[])
  ) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

/**
 * Custom hook to handle map click interactions for waypoint placement
 */
export function useMapClickHandler({
  setWaypoints,
  showToast,
}: UseMapClickHandlerProps) {
  const pendingToastMessage = useRef<string | null>(null);

  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      try {
        // Use clicked coordinates directly
        const finalLat = lat;
        const finalLng = lng;

        // Logic: First click = Point A, last click = Point B, intermediate clicks = stages
        setWaypoints(prev => {
          const newWaypoints = [...prev];

          // If it's the first click and Point A is not defined
          if (
            newWaypoints.length === 2 &&
            newWaypoints[0].lat === 0 &&
            newWaypoints[0].lng === 0
          ) {
            // Replace Point A
            newWaypoints[0] = {
              ...newWaypoints[0],
              lat: finalLat,
              lng: finalLng,
              name: 'Point A',
            };
            pendingToastMessage.current = 'Point A (départ) défini';
            return newWaypoints;
          }

          // If Point A exists but Point B is not defined
          if (
            newWaypoints.length === 2 &&
            newWaypoints[1].lat === 0 &&
            newWaypoints[1].lng === 0
          ) {
            // Replace Point B
            newWaypoints[1] = {
              ...newWaypoints[1],
              lat: finalLat,
              lng: finalLng,
              name: 'Point B',
            };
            pendingToastMessage.current = 'Point B (arrivée) défini';
            return newWaypoints;
          }

          // If both points exist, add a stage before point B
          if (newWaypoints.length >= 2) {
            const pointB = newWaypoints[newWaypoints.length - 1]; // Save Point B
            const etapeNumber = newWaypoints.length - 1;

            // Insert the new stage before Point B
            newWaypoints[newWaypoints.length - 1] = {
              id: `waypoint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              lat: finalLat,
              lng: finalLng,
              name: `Étape ${etapeNumber}`,
            };

            // Put Point B back at the end
            newWaypoints.push({
              ...pointB,
              name: 'Point B',
            });

            pendingToastMessage.current = `Étape ${etapeNumber} ajoutée`;
            return newWaypoints;
          }

          return newWaypoints;
        });

        // Show toast message
        if (pendingToastMessage.current) {
          showToast(pendingToastMessage.current, 'success');
          pendingToastMessage.current = null;
        }
      } catch (error) {
        console.error('Error in handleMapClick:', error);
        showToast('Erreur lors du placement du point', 'error');
      }
    },
    [setWaypoints, showToast]
  );

  return {
    handleMapClick,
  };
}
