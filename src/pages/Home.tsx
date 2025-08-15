import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/shared/Logo';

export default function Home(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <Logo size="lg" />
          <h1 className="text-5xl font-bold text-white">WayMaker</h1>
        </div>
        <p className="text-xl text-white/90 mb-8">
          Planifiez vos randonnées avec profil altimétrique et export GPX
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            to="/hiking"
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            🥾 Planificateur Randonnée
          </Link>
          <Link
            to="/map"
            className="bg-orange-500/80 backdrop-blur-sm hover:bg-orange-500/90 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg"
          >
            🗺️ Carte Interactive
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="text-white text-4xl mb-4">🥾</div>
            <h3 className="text-lg font-semibold mb-2 text-white">Randonnée Avancée</h3>
            <p className="text-white/80 text-sm">
              Itinéraires multi-étapes avec GR, HRP et sentiers locaux
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="text-white text-4xl mb-4">⛰️</div>
            <h3 className="text-lg font-semibold mb-2 text-white">Profil Altimétrique</h3>
            <p className="text-white/80 text-sm">
              Dénivelé, altitude min/max, visualisation type trail
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="text-white text-4xl mb-4">🏠</div>
            <h3 className="text-lg font-semibold mb-2 text-white">
              Refuges & Points d'eau
            </h3>
            <p className="text-white/80 text-sm">
              Refuges gardés/libres, sources, fontaines le long du parcours
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="text-white text-4xl mb-4">📱</div>
            <h3 className="text-lg font-semibold mb-2 text-white">Export GPX</h3>
            <p className="text-white/80 text-sm">
              Téléchargement compatible GPS et applications de randonnée
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
