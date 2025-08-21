import React from 'react';
import { useOnlineStatus } from '../../hooks/shared/useOnlineStatus';

const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
      <span className="font-medium">⚠️ You are currently offline</span>
      <span className="ml-2 text-sm">Some features may not be available</span>
    </div>
  );
};

export default OfflineIndicator;
