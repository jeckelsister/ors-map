import { useCallback } from 'react';

import type { Coordinates } from '@/types/hiking';

interface UseGPXHandlersProps {
  setWaypoints: (waypoints: Coordinates[]) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface GPXHandlers {
  handleGPXImport: (
    waypoints: Coordinates[],
    metadata?: { name?: string }
  ) => void;
  handleGPXImportError: (error: string) => void;
  handleGPXExport: (gpxContent: string, filename: string) => void;
}

export type { GPXHandlers };

/**
 * Custom hook to handle GPX import/export operations
 */
export function useGPXHandlers({
  setWaypoints,
  showToast,
}: UseGPXHandlersProps): GPXHandlers {
  const handleGPXImport = useCallback(
    (waypoints: Coordinates[], metadata?: { name?: string }) => {
      setWaypoints(waypoints);
      showToast(
        metadata?.name
          ? `✅ ${metadata.name} importé avec ${waypoints.length} points`
          : `✅ GPX importé avec ${waypoints.length} points`,
        'success'
      );
    },
    [setWaypoints, showToast]
  );

  const handleGPXImportError = useCallback(
    (error: string) => {
      showToast(`❌ Erreur GPX: ${error}`, 'error');
    },
    [showToast]
  );

  const handleGPXExport = useCallback(
    (gpxContent: string, filename: string) => {
      try {
        // Create and download GPX file
        const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast('Fichier GPX téléchargé avec succès!', 'success');
      } catch (error) {
        console.error("Erreur lors de l'export GPX:", error);
        showToast('Erreur lors du téléchargement du fichier GPX', 'error');
      }
    },
    [showToast]
  );

  return {
    handleGPXImport,
    handleGPXImportError,
    handleGPXExport,
  };
}
