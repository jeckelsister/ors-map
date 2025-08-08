import React, { useState } from 'react';

const IGNInfoBadge: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const ignApiKey = import.meta.env.VITE_IGN_API_KEY;

  return (
    <div className="absolute bottom-6 left-6 z-10">
      <div
        className={`
        bg-white rounded-lg shadow-lg border-2 border-blue-200 transition-all duration-300
        ${isExpanded ? 'w-80 p-4' : 'w-fit p-2'}
      `}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 w-full text-left"
        >
          <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="text-sm font-medium text-blue-800">
            Cartes France Optimisées
          </span>
          {!isExpanded && (
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </button>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-blue-100">
            <div className="space-y-2 text-xs text-blue-700">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>OpenStreetMap France avec sentiers GR/GRP</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Style Carto épuré pour la randonnée</span>
              </div>
              {ignApiKey && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Cartes topographiques IGN disponibles</span>
                </div>
              )}
              {!ignApiKey && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>IGN disponible avec clé API</span>
                </div>
              )}
            </div>
            <div className="mt-3 text-xs text-blue-600">
              Cliquez sur l'icône couches pour changer de fond de carte.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IGNInfoBadge;
