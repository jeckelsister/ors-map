import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/shared/Logo';

export default function Home(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
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
          <Link
            to="/about"
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            En savoir plus
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

        {/* Nouvelle section : Cartes de randonnée */}
        <div className="mt-12 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center flex items-center justify-center gap-2">
            🗺️ Nouvelles Cartes de Randonnée Premium
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Accédez aux meilleures cartes pour la randonnée en France
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
              <h4 className="font-semibold text-blue-800 mb-1">
                🥇 OSM France
              </h4>
              <p className="text-sm text-gray-600">
                GR/GRP + refuges + sources
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
              <h4 className="font-semibold text-purple-800 mb-1">
                🏔️ OpenTopoMap
              </h4>
              <p className="text-sm text-gray-600">
                Courbes niveau pro montagne
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500">
              <h4 className="font-semibold text-orange-800 mb-1">🚴 CyclOSM</h4>
              <p className="text-sm text-gray-600">VTT + sentiers balisés</p>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/hiking"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              🎯 Découvrir les cartes premium
            </Link>
            <p className="text-sm text-gray-600 mt-2">
              Bouton avec point vert en haut à gauche de la carte
            </p>
          </div>
        </div>

        {/* Detailed hiking features */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            🎯 Fonctionnalités Complètes de Randonnée
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-green-600 flex items-center gap-2">
                🗺️ Planification d'itinéraires
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Point A vers Point B ou itinéraires en boucle</li>
                <li>• Division en 1 à 10 étapes personnalisables</li>
                <li>• Jusqu'à 20 points de passage</li>
                <li>• Sentiers officiels (GR, HRP, etc.) ou mixtes</li>
              </ul>

              <h3 className="text-xl font-semibold text-blue-600 flex items-center gap-2 mt-6">
                📊 Analyse détaillée
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Profil altimétrique interactif</li>
                <li>• Dénivelé positif/négatif par étape</li>
                <li>• Altitude minimale et maximale</li>
                <li>• Distance totale et par segment</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
                📍 Points d'intérêt
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Refuges gardés et libres avec infos détaillées</li>
                <li>• Points d'eau : sources, fontaines, rivières</li>
                <li>• Qualité de l'eau et fiabilité saisonnière</li>
                <li>• Zones de bivouac autorisées</li>
              </ul>

              <h3 className="text-xl font-semibold text-purple-600 flex items-center gap-2 mt-6">
                💾 Export et compatibilité
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Export GPX compatible tous GPS</li>
                <li>• Options configurables (POI, altitude, étapes)</li>
                <li>• 3 cartes spécialisées randonnée</li>
                <li>• Courbes de niveau précises</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/hiking"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
            >
              🚀 Commencer la planification
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
