import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Map, Mountain } from 'lucide-react';
import Logo from './Logo';

export default function Navigation(): React.JSX.Element {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20 shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-lg sm:text-xl font-bold text-white hover:text-emerald-200 transition-colors"
            onClick={closeMobileMenu}
          >
            <Logo size="sm" />
            <span className="hidden sm:inline">WayMaker</span>
            <span className="sm:hidden">WM</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-2 lg:space-x-4">
            <Link
              to="/"
              className={`px-3 lg:px-4 py-2 rounded-2xl text-sm font-medium transition-all flex items-center gap-2 ${
                isActive('/')
                  ? 'text-white bg-white/20 shadow-lg'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              to="/map"
              className={`px-3 lg:px-4 py-2 rounded-2xl text-sm font-medium transition-all flex items-center gap-2 ${
                isActive('/map')
                  ? 'text-white bg-white/20 shadow-lg'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Map className="w-4 h-4" />
              Carte
            </Link>
            <Link
              to="/hiking"
              className={`px-3 lg:px-4 py-2 rounded-2xl text-sm font-medium transition-all flex items-center gap-2 ${
                isActive('/hiking')
                  ? 'text-white bg-white/20 shadow-lg'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Mountain className="w-4 h-4" />
              Randonnée
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-xl text-white hover:bg-white/10 transition-all"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span
                className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'
                }`}
              ></span>
              <span
                className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${
                  isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}
              ></span>
              <span
                className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'
                }`}
              ></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? 'max-h-48 opacity-100 visible'
              : 'max-h-0 opacity-0 invisible overflow-hidden'
          }`}
        >
          <div className="py-4 space-y-2">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all flex items-center gap-3 ${
                isActive('/')
                  ? 'text-white bg-white/20 shadow-lg'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-5 h-5" />
              Home
            </Link>
            <Link
              to="/map"
              onClick={closeMobileMenu}
              className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all flex items-center gap-3 ${
                isActive('/map')
                  ? 'text-white bg-white/20 shadow-lg'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Map className="w-5 h-5" />
              Carte Interactive
            </Link>
            <Link
              to="/hiking"
              onClick={closeMobileMenu}
              className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all flex items-center gap-3 ${
                isActive('/hiking')
                  ? 'text-white bg-white/20 shadow-lg'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Mountain className="w-5 h-5" />
              Planificateur Randonnée
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
