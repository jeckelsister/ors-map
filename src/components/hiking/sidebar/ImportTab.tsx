import React from 'react';

import type { GPXHandlers } from '@/hooks/hiking/useGPXHandlers';

import GPXUpload from '../GPXUpload';

interface ImportTabProps {
  gpxHandlers: GPXHandlers;
}

/**
 * Import tab content - separated for better readability
 * Handles GPX file import functionality
 */
export default function ImportTab({
  gpxHandlers,
}: ImportTabProps): React.JSX.Element {
  return (
    <div>
      <h3 className="font-semibold mb-3">Import GPX</h3>
      <GPXUpload
        onGPXImported={gpxHandlers.handleGPXImport}
        onError={gpxHandlers.handleGPXImportError}
      />
    </div>
  );
}
