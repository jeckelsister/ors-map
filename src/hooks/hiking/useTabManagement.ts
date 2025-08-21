import { useState } from 'react';

export type TabType = 'planning' | 'profile' | 'export' | 'poi' | 'gpx';

interface UseTabManagementReturn {
  selectedTab: TabType;
  setSelectedTab: (tab: TabType) => void;
}

/**
 * Custom hook to manage tab state
 */
export function useTabManagement(
  initialTab: TabType = 'planning'
): UseTabManagementReturn {
  const [selectedTab, setSelectedTab] = useState<TabType>(initialTab);

  return {
    selectedTab,
    setSelectedTab,
  };
}
