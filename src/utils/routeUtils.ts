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

/**
 * Valide si des coordonnées sont valides
 */
export const areValidCoordinates = (lat?: number, lng?: number): boolean => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

/**
 * Calcule la distance euclidienne entre deux points (approximation simple)
 */
export const calculateDistance = (
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number => {
  const R = 6371; // Earth radius in km
  const dLat = (point2.lat - point1.lat) * (Math.PI / 180);
  const dLng = (point2.lng - point1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * (Math.PI / 180)) *
      Math.cos(point2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};
