import React from 'react';
import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import ErrorBoundary from './components/shared/ErrorBoundary';
import OfflineIndicator from './components/shared/OfflineIndicator';
import { ToastProvider } from './hooks/shared/useToast';
// Importation explicite du fichier moderne
import ModernHikingPlannerPage from './pages/ModernHikingPlannerPage';
import ModernHome from './pages/ModernHome';
import ModernMapPage from './pages/ModernMapPage';
import NotFound from './pages/NotFound';
import ModernToaster from './ui/ModernToaster';

export default function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <OfflineIndicator />
        <Router>
          <Routes>
            <Route path="/" element={<ModernHome />} />
            <Route path="/map" element={<ModernMapPage />} />
            <Route path="/hiking" element={<ModernHikingPlannerPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <ModernToaster />
      </ToastProvider>
    </ErrorBoundary>
  );
}
