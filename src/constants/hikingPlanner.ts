import { Download, Map, MapPin, Mountain, Upload } from 'lucide-react';

import type { TabType } from '@/hooks/hiking/useTabManagement';

export interface TabConfig {
  id: TabType;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  title: string;
}

export const TAB_CONFIGS: TabConfig[] = [
  {
    id: 'planning',
    icon: Map,
    label: 'Planification',
    title: "Configuration de l'itinéraire",
  },
  {
    id: 'profile',
    icon: Mountain,
    label: 'Profil',
    title: 'Profil altimétrique',
  },
  {
    id: 'poi',
    icon: MapPin,
    label: 'POI',
    title: "Points d'intérêt",
  },
  {
    id: 'gpx',
    icon: Upload,
    label: 'Import',
    title: 'Import GPX',
  },
  {
    id: 'export',
    icon: Download,
    label: 'Export',
    title: 'Export GPX',
  },
];

export const TOAST_MESSAGES = {
  ROUTE_CREATED: (distance: number) =>
    `Itinéraire créé: ${distance.toFixed(1)}km`,
  RESET_SUCCESS: 'Itinéraire réinitialisé',
  INVALID_COORDINATES: (name: string) =>
    `❌ Erreur: Coordonnées invalides pour ${name}`,
  GPX_DOWNLOAD_SUCCESS: 'Fichier GPX téléchargé avec succès!',
  GPX_DOWNLOAD_ERROR: 'Erreur lors du téléchargement du fichier GPX',
  MAP_CLICK_ERROR: 'Erreur lors du placement du point',
} as const;
