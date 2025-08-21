import React from 'react';

import { Route, HashRouter as Router, Routes } from 'react-router-dom';

import ErrorBoundary from './components/shared/ErrorBoundary';
import OfflineIndicator from './components/shared/OfflineIndicator';
import Toaster from './components/ui/toaster';
import { ToastProvider } from './hooks/shared/useToast';
import HikingPlannerPage from './pages/HikingPlannerPage';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

export default function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <OfflineIndicator />
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hiking" element={<HikingPlannerPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </ToastProvider>
    </ErrorBoundary>
  );
}
