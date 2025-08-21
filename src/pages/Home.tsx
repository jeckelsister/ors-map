import React from 'react';

import { Download, Mountain, Route } from 'lucide-react';
import { Link } from 'react-router-dom';

import CustomBadge from '@/components/ui/custom-badge';
import CustomButton from '@/components/ui/custom-button';
import CustomCard from '@/components/ui/custom-card';

const features = [
  {
    icon: Mountain,
    title: 'Randonnée Avancée',
    description: 'Itinéraires multi-étapes avec GR, HRP et sentiers locaux',
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

export default function Home(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center p-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              WayMaker
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Planificateur de randonnées avancé avec itinéraires multi-étapes
              et points d'intérêt enrichis
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CustomButton asChild size="lg" className="gap-2">
              <Link to="/hiking" className="inline-flex items-center">
                <Mountain className="w-5 h-5" />
                Planifier ma randonnée
              </Link>
            </CustomButton>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {features.map((feature, index) => (
            <CustomCard
              key={index}
              variant="elevated"
              className="relative hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              contentClassName="text-center p-6"
            >
              <div className="relative">
                {feature.badge && (
                  <CustomBadge
                    variant="secondary"
                    size="sm"
                    className="absolute -top-2 -right-2"
                  >
                    {feature.badge}
                  </CustomBadge>
                )}
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            </CustomCard>
          ))}
        </div>
      </div>
    </div>
  );
}
