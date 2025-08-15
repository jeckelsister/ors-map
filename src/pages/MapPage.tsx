import React from 'react';
import Map from '../components/map/Map';
import Navigation from '../components/shared/Navigation';

export default function MapPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600">
      <Navigation />

      {/* Header Section - Responsive padding */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Carte Interactive</h1>
          <p className="text-sm md:text-base text-emerald-100">
            Explorez les sentiers et planifiez vos randonnées
          </p>
        </div>
      </div>

      {/* Map Component with responsive sizing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 pb-20 md:pb-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[calc(100vh-160px)] xl:h-[calc(100vh-140px)]">
            <Map />
          </div>
        </div>
      </div>
    </div>
  );
}
