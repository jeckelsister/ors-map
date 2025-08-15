import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/shared/Logo';

export default function Home(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 flex items-center justify-center p-4">
      <div className="max-w-6xl mx-auto text-center">
        {/* Hero Section - Responsive */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Logo size="lg" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">WayMaker</h1>
        </div>
        <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Planifiez vos randonnées avec profil altimétrique et export GPX
        </p>
        
        {/* Action Buttons - Responsive Stack/Row */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 max-w-lg mx-auto">
          <Link
            to="/hiking"
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base"
          >
            🥾 Planificateur Randonnée
          </Link>
          <Link
            to="/map"
            className="bg-orange-500/80 backdrop-blur-sm hover:bg-orange-500/90 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg text-sm sm:text-base"
          >
            🗺️ Carte Interactive
          </Link>
        </div>

        {/* Features Grid - Responsive Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="text-white text-3xl sm:text-4xl mb-3 sm:mb-4">🥾</div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-white">Randonnée Avancée</h3>
            <p className="text-white/80 text-xs sm:text-sm">
              Itinéraires multi-étapes avec GR, HRP et sentiers locaux
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="text-white text-3xl sm:text-4xl mb-3 sm:mb-4">⛰️</div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-white">Profil Altimétrique</h3>
            <p className="text-white/80 text-xs sm:text-sm">
              Dénivelé, altitude min/max, visualisation type trail
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="text-white text-3xl sm:text-4xl mb-3 sm:mb-4">🏠</div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-white">
              Refuges & Points d'eau
            </h3>
            <p className="text-white/80 text-xs sm:text-sm">
              Refuges gardés/libres, sources, fontaines le long du parcours
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="text-white text-3xl sm:text-4xl mb-3 sm:mb-4">📱</div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-white">Export GPX</h3>
            <p className="text-white/80 text-xs sm:text-sm">
              Téléchargement compatible GPS et applications de randonnée
            </p>
          </div>
        </div>

        {/* Mobile-specific CTA */}
        <div className="mt-8 block sm:hidden">
          <p className="text-white/70 text-sm mb-4">
            Parfait pour votre mobile et tablette
          </p>
          <div className="flex justify-center gap-2">
            <span className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs">
              📱 Mobile-first
            </span>
            <span className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs">
              🌐 Progressive Web App
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
