import React from 'react';
import Map from '../components/map/Map';
import ModernNavigation from '../components/shared/ModernNavigation';
import { ModernCard } from '../ui/modern';

export default function ModernMapPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <ModernNavigation />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
            Carte Interactive
          </h1>
          <p className="text-muted-foreground">
            Explorez les sentiers et planifiez vos randonnées
          </p>
        </div>
      </div>

      {/* Map Component */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ModernCard className="overflow-hidden shadow-lg">
          {/* <div className="h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[calc(100vh-200px)]"> */}
          <Map />
          {/* </div> */}
        </ModernCard>
      </div>
    </div>
  );
}
