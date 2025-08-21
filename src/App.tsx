import React from 'react';
import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import ErrorBoundary from './components/shared/ErrorBoundary';
import OfflineIndicator from './components/shared/OfflineIndicator';
import ModernToaster from './components/ui/toaster';
import { ToastProvider } from './hooks/shared/useToast';
import ModernHikingPlannerPage from './pages/ModernHikingPlannerPage';
import ModernHome from './pages/ModernHome';
import NotFound from './pages/NotFound';

export default function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <OfflineIndicator />
        <Router>
          <Routes>
            <Route path="/" element={<ModernHome />} />
            <Route path="/hiking" element={<ModernHikingPlannerPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <ModernToaster />
      </ToastProvider>
    </ErrorBoundary>
  );
}
