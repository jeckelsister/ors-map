import type { Location } from '@/types/profile';
import { useCallback } from 'react';

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

interface UseGeolocationReturn {
  getCurrentPosition: (
    onSuccess: (location: Location) => void,
    onError?: (error: string) => void
  ) => void;
  isSupported: boolean;
}

/**
 * Hook personnalisé pour gérer la géolocalisation
 * Réutilisable dans toute l'application
 */
const useGeolocation = (
  options: UseGeolocationOptions = {}
): UseGeolocationReturn => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 60000,
  } = options;

  const isSupported = 'geolocation' in navigator;

  const getCurrentPosition = useCallback(
    (
      onSuccess: (location: Location) => void,
      onError?: (error: string) => void
    ) => {
      if (!isSupported) {
        const errorMessage =
          "La géolocalisation n'est pas supportée par ce navigateur.";
        onError?.(errorMessage);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          const location: Location = {
            lat: latitude,
            lng: longitude,
            name: 'Ma position',
          };
          onSuccess(location);
        },
        error => {
          const errorMessages = {
            1: 'Permission refusée',
            2: 'Position indisponible',
            3: "Délai d'attente dépassé",
          };
          const message =
            errorMessages[error.code as keyof typeof errorMessages] ||
            error.message;
          onError?.(`Impossible d'obtenir la position : ${message}`);
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      );
    },
    [isSupported, enableHighAccuracy, timeout, maximumAge]
  );

  return {
    getCurrentPosition,
    isSupported,
  };
};

export default useGeolocation;
