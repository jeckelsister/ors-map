import React from 'react';

interface HikingPlannerHeaderProps {
  className?: string;
}

/**
 * Header component for the hiking planner page
 */
export default function HikingPlannerHeader({
  className = '',
}: HikingPlannerHeaderProps): React.JSX.Element {
  return (
    <div
      className={`bg-gradient-to-r from-primary/10 to-primary/5 border-b ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
            Planificateur de Randonnée
          </h1>
          <p className="text-muted-foreground">
            Créez des itinéraires multi-étapes avec profil altimétrique et
            export GPX
          </p>
        </div>
      </div>
    </div>
  );
}
