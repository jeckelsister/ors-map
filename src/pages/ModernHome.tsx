import { Download, Map, Mountain, Route } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/shared/Logo';
import { ModernBadge, ModernButton, ModernCard } from '../ui/modern';

const features = [
  {
    icon: Mountain,
    title: 'Randonnée Avancée',
    description: 'Itinéraires multi-étapes avec GR, HRP et sentiers locaux',
    badge: null,
  },
  {
    icon: Map,
    title: 'Cartes Détaillées',
    description: 'IGN, OpenStreetMap et cartes topographiques spécialisées',
    badge: null,
  },
  {
    icon: Route,
    title: 'Profil Altimétrique',
    description: 'Visualisation 3D du dénivelé et calcul de difficulté',
    badge: null,
  },
  {
    icon: Download,
    title: 'Export GPX',
    description: 'Compatible avec tous les GPS et applications mobile',
    badge: null,
  },
];

export default function ModernHome(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center p-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Logo size="lg" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-normal">
              WayMaker
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Planifiez vos randonnées avec profil altimétrique et export GPX
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 max-w-lg mx-auto">
            <ModernButton asChild size="lg" className="gap-2">
              <Link to="/hiking">
                <Mountain className="w-5 h-5" />
                Planificateur Randonnée
              </Link>
            </ModernButton>
            <ModernButton asChild variant="outline" size="lg" className="gap-2">
              <Link to="/map">
                <Map className="w-5 h-5" />
                Carte Interactive
              </Link>
            </ModernButton>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <ModernCard
              key={index}
              variant="elevated"
              className="relative hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              contentClassName="text-center p-6"
            >
              <div className="relative">
                {feature.badge && (
                  <ModernBadge
                    variant="secondary"
                    size="sm"
                    className="absolute -top-2 -right-2"
                  >
                    {feature.badge}
                  </ModernBadge>
                )}
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            </ModernCard>
          ))}
        </div>
      </div>
    </div>
  );
}
