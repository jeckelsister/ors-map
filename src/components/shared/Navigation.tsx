import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

export default function Navigation(): React.JSX.Element {
  const location = useLocation();

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-white hover:text-emerald-200 transition-colors"
          >
            <Logo size="sm" />
            WayMaker
          </Link>
          <div className="flex space-x-4">
            <Link
              to="/"
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                isActive('/')
                  ? 'text-white bg-white/20 shadow-lg'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              🏠 Home
            </Link>
            <Link
              to="/map"
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                isActive('/map')
                  ? 'text-white bg-white/20 shadow-lg'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              🗺️ Carte
            </Link>
            <Link
              to="/hiking"
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                isActive('/hiking')
                  ? 'text-white bg-white/20 shadow-lg'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              🥾 Randonnée
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
