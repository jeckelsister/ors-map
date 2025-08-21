import { useCallback, useState } from 'react';

interface RouteStep {
  id: string;
  description: string;
  distance: number;
  duration: number;
  elevation: number;
}

interface ItineraryState {
  steps: RouteStep[];
  totalDistance: number;
  totalDuration: number;
  totalElevation: number;
  isLoading: boolean;
  error: string | null;
}

export function useItineraryPlanner() {
  const [state, setState] = useState<ItineraryState>({
    steps: [],
    totalDistance: 0,
    totalDuration: 0,
    totalElevation: 0,
    isLoading: false,
    error: null,
  });

  const calculateItinerary = useCallback(
    async (startLocation: string, endLocation: string) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        // Simulation d'un calcul d'itinéraire
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockSteps: RouteStep[] = [
          {
            id: '1',
            description: `Départ de ${startLocation}`,
            distance: 0,
            duration: 0,
            elevation: 100,
          },
          {
            id: '2',
            description: 'Montée vers le col',
            distance: 5.2,
            duration: 120,
            elevation: 450,
          },
          {
            id: '3',
            description: 'Traversée du plateau',
            distance: 3.8,
            duration: 90,
            elevation: 420,
          },
          {
            id: '4',
            description: `Arrivée à ${endLocation}`,
            distance: 2.1,
            duration: 45,
            elevation: 380,
          },
        ];

        const totalDistance = mockSteps.reduce(
          (sum, step) => sum + step.distance,
          0
        );
        const totalDuration = mockSteps.reduce(
          (sum, step) => sum + step.duration,
          0
        );
        const totalElevation =
          Math.max(...mockSteps.map(step => step.elevation)) -
          Math.min(...mockSteps.map(step => step.elevation));

        setState({
          steps: mockSteps,
          totalDistance,
          totalDuration,
          totalElevation,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        console.error('Error calculating itinerary:', err);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: "Erreur lors du calcul de l'itinéraire",
        }));
      }
    },
    []
  );

  const clearItinerary = useCallback(() => {
    setState({
      steps: [],
      totalDistance: 0,
      totalDuration: 0,
      totalElevation: 0,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    calculateItinerary,
    clearItinerary,
    hasItinerary: state.steps.length > 0,
  };
}
