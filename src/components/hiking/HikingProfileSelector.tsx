import React from 'react';

import { HIKING_PROFILES } from '@/constants/hiking';
import type { HikingProfile } from '@/types/hiking';

interface HikingProfileSelectorProps {
  selectedProfile: string | null;
  onProfileChange: (profile: HikingProfile) => void;
}

export default function HikingProfileSelector({
  selectedProfile,
  onProfileChange,
}: HikingProfileSelectorProps): React.JSX.Element {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Type de sentiers</h3>
      <div className="grid grid-cols-1 gap-2">
        {HIKING_PROFILES.map(profile => {
          const IconComponent = profile.icon;
          const isSelected = selectedProfile === profile.id;

          return (
            <button
              key={profile.id}
              onClick={() => onProfileChange(profile)}
              className={`
                flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200
                ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div
                className={`
                  flex items-center justify-center w-8 h-8 rounded-lg
                  ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}
                `}
              >
                <IconComponent
                  className={`w-4 h-4 ${
                    isSelected ? 'text-blue-600' : 'text-gray-600'
                  }`}
                />
              </div>

              <div className="flex-1 text-left">
                <div className="font-medium text-sm">{profile.name}</div>
                <div className="text-xs opacity-75">{profile.description}</div>
              </div>

              <div
                className={`
                  w-3 h-3 rounded-full border-2
                  ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 bg-white'
                  }
                `}
              />
            </button>
          );
        })}
      </div>

      {selectedProfile && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600">
            <strong>Préférences :</strong>
            <ul className="mt-1 space-y-1">
              {(() => {
                const profile = HIKING_PROFILES.find(
                  p => p.id === selectedProfile
                );
                if (!profile) return null;

                const preferences = [];
                if (profile.preferences.preferOfficial) {
                  preferences.push(
                    '• Privilégie les sentiers officiels (GR, HRP, etc.)'
                  );
                }
                if (profile.preferences.allowUnofficial) {
                  preferences.push('• Autorise les sentiers non-officiels');
                }
                if (profile.preferences.noPreference) {
                  preferences.push('• Aucune préférence de type de sentier');
                }

                return preferences.map((pref, index) => (
                  <li key={index} className="text-xs">
                    {pref}
                  </li>
                ));
              })()}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
