import type { IconType } from 'react-icons';
import { FaCompass, FaMapSigns, FaMountain, FaRoute } from 'react-icons/fa';

import type { HikingProfile } from '@/types/hiking';

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
