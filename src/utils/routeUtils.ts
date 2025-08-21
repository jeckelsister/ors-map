/**
 * Utilitaires pour les conversions de données d'itinéraires
 * Réutilisables dans toute l'application
 */

/**
 * Convertit une distance en mètres vers un format lisible
 */
export const formatDistance = (distanceInMeters: number): string => {
  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)} m`;
  } else {
    const distanceKm = (distanceInMeters / 1000).toFixed(2);
    return `${distanceKm} km`;
  }
};

/**
 * Convertit une durée en secondes vers un format lisible
 */
export const formatDuration = (durationSeconds: number): string => {
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  } else {
    return `${minutes}min`;
  }
};

/**
 * Formate les coordonnées avec une précision donnée
 */
export const formatCoordinates = (
  lat: number,
  lng: number,
  precision: number = 6
): string => {
  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
};

/**
 * Calcule le centre entre deux points
 */
export const calculateCenter = (
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
): [number, number] => {
  return [(start.lat + end.lat) / 2, (start.lng + end.lng) / 2];
};
