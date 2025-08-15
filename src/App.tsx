import React, { Suspense, lazy } from 'react';
import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import ErrorBoundary from './components/shared/ErrorBoundary';
import OfflineIndicator from './components/shared/OfflineIndicator';
import { ToastProvider } from './hooks/shared/useToast';

// Lazy load pages for better performance with error handling
const Home = lazy(() => import('./pages/Home').catch(() => ({ default: () => <div>Erreur de chargement de la page d'accueil</div> })));
const MapPage = lazy(() => import('./pages/MapPage').catch(() => ({ default: () => <div>Erreur de chargement de la page carte</div> })));
const HikingPlannerPage = lazy(() => import('./pages/HikingPlannerPage').catch(() => ({ default: () => <div>Erreur de chargement du planificateur</div> })));
const NotFound = lazy(() => import('./pages/NotFound').catch(() => ({ default: () => <div>Page non trouvée</div> })));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
      <p className="text-white font-medium">Chargement...</p>
    </div>
  </div>
);

export default function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <OfflineIndicator />
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/hiking" element={<HikingPlannerPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}
