import type { HikingProfile } from '@/types/hiking';
import type { IconType } from 'react-icons';
import { FaCompass, FaMapSigns, FaMountain, FaRoute } from 'react-icons/fa';

interface HikingProfileWithIcon extends HikingProfile {
  icon: IconType;
}

export const HIKING_PROFILES: HikingProfileWithIcon[] = [
  {
    id: 'gr-official',
    name: 'Sentiers officiels',
    description: 'GR, GRP, PR, HRP uniquement',
    color: '#dc2626', // red-600
    icon: FaMapSigns,
    preferences: {
      preferOfficial: true,
      allowUnofficial: false,
      noPreference: false,
    },
  },
  {
    id: 'mixed-paths',
    name: 'Chemins mixtes',
    description: 'Officiels et non-officiels',
    color: '#ea580c', // orange-600
    icon: FaRoute,
    preferences: {
      preferOfficial: true,
      allowUnofficial: true,
      noPreference: false,
    },
  },
  {
    id: 'mountain-paths',
    name: 'Sentiers montagne',
    description: 'Tous types de sentiers',
    color: '#7c3aed', // violet-600
    icon: FaMountain,
    preferences: {
      preferOfficial: false,
      allowUnofficial: true,
      noPreference: true,
    },
  },
  {
    id: 'no-preference',
    name: 'Sans préférence',
    description: 'Tous types de chemins',
    color: '#16a34a', // green-600
    icon: FaCompass,
    preferences: {
      preferOfficial: false,
      allowUnofficial: true,
      noPreference: true,
    },
  },
];

export const PATH_TYPES = {
  GR: {
    name: 'Grande Randonnée',
    color: '#dc2626',
    official: true,
    difficulty_range: [2, 5],
  },
  GRP: {
    name: 'Grande Randonnée de Pays',
    color: '#ea580c',
    official: true,
    difficulty_range: [1, 4],
  },
  PR: {
    name: 'Petite Randonnée',
    color: '#f59e0b',
    official: true,
    difficulty_range: [1, 3],
  },
  HRP: {
    name: 'Haute Route Pyrénéenne',
    color: '#7c3aed',
    official: true,
    difficulty_range: [4, 5],
  },
  TMB: {
    name: 'Tour du Mont Blanc',
    color: '#06b6d4',
    official: true,
    difficulty_range: [3, 4],
  },
  UNOFFICIAL: {
    name: 'Sentier non-officiel',
    color: '#6b7280',
    official: false,
    difficulty_range: [1, 5],
  },
};

export const REFUGE_TYPES = {
  GARDE: {
    name: 'Refuge gardé',
    icon: '🏠',
    color: '#16a34a',
    description: 'Refuge avec gardien, repas disponibles',
  },
  LIBRE: {
    name: 'Refuge libre',
    icon: '🏚️',
    color: '#ea580c',
    description: 'Refuge non gardé, libre accès',
  },
  BIVOUAC: {
    name: 'Bivouac',
    icon: '⛺',
    color: '#7c3aed',
    description: 'Zone de bivouac autorisée',
  },
};

export const WATER_POINT_TYPES = {
  SOURCE: {
    name: 'Source',
    icon: '💧',
    color: '#06b6d4',
  },
  FONTAINE: {
    name: 'Fontaine',
    icon: '🚰',
    color: '#0ea5e9',
  },
  RIVIERE: {
    name: 'Rivière',
    icon: '🌊',
    color: '#0284c7',
  },
  LAC: {
    name: 'Lac',
    icon: '🏔️',
    color: '#0369a1',
  },
};

export const DIFFICULTY_LEVELS = {
  1: {
    name: 'Très facile',
    color: '#16a34a',
    description: 'Sentier large, peu de dénivelé',
  },
  2: {
    name: 'Facile',
    color: '#65a30d',
    description: 'Sentier bien marqué, dénivelé modéré',
  },
  3: {
    name: 'Modéré',
    color: '#f59e0b',
    description: 'Sentier parfois raide, bonne condition physique',
  },
  4: {
    name: 'Difficile',
    color: '#ea580c',
    description: 'Sentier technique, expérience requise',
  },
  5: {
    name: 'Très difficile',
    color: '#dc2626',
    description: 'Alpinisme, équipement spécialisé',
  },
};
