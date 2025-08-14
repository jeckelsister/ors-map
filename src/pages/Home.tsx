import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/shared/Logo';

export default function Home(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <Logo size="lg" />
          <h1 className="text-5xl font-bold text-gray-900">WayMaker</h1>
        </div>
        <p className="text-xl text-gray-600 mb-8">
          Planifiez vos randonnées avec profil altimétrique et export GPX
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/hiking"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
          >
            🥾 Planificateur Randonnée
          </Link>
          <Link
            to="/map"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            Carte Simple
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-green-600 text-4xl mb-4">🥾</div>
            <h3 className="text-lg font-semibold mb-2">Randonnée Avancée</h3>
            <p className="text-gray-600">
              Itinéraires multi-étapes avec GR, HRP et sentiers locaux
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-4xl mb-4">⛰️</div>
            <h3 className="text-lg font-semibold mb-2">Profil Altimétrique</h3>
            <p className="text-gray-600">
              Dénivelé, altitude min/max, visualisation type trail
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-orange-600 text-4xl mb-4">🏠</div>
            <h3 className="text-lg font-semibold mb-2">
              Refuges & Points d'eau
            </h3>
            <p className="text-gray-600">
              Refuges gardés/libres, sources, fontaines le long du parcours
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-purple-600 text-4xl mb-4">📱</div>
            <h3 className="text-lg font-semibold mb-2">Export GPX</h3>
            <p className="text-gray-600">
              Téléchargement compatible GPS et applications de randonnée
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
