import { AlertTriangle, CheckCircle, FileText, Upload } from 'lucide-react';
import React, { useRef, useState } from 'react';
import type { Coordinates } from '../../types/hiking';
import type { GPXParseResult } from '../../utils/gpxParser';
import {
  calculateTotalDistance,
  convertGPXToWaypoints,
  parseGPXFile,
} from '../../utils/gpxParser';

interface GPXUploadProps {
  onGPXImported: (
    waypoints: Coordinates[],
    metadata?: GPXParseResult['metadata']
  ) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function GPXUpload({
  onGPXImported,
  onError,
  className = '',
}: GPXUploadProps): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [uploadMessage, setUploadMessage] = useState<string>('');

  const handleFileSelect = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.gpx')) {
      const errorMsg = 'Veuillez sélectionner un fichier GPX (.gpx)';
      setUploadStatus('error');
      setUploadMessage(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsProcessing(true);
    setUploadStatus('idle');
    setUploadMessage('');

    try {
      // Parser le fichier GPX
      const gpxResult = await parseGPXFile(file);

      // Convertir en waypoints
      const waypoints = convertGPXToWaypoints(gpxResult);

      if (waypoints.length === 0) {
        throw new Error(
          'Aucun point de cheminement trouvé dans le fichier GPX'
        );
      }

      // Calculate statistics for display
      const distance = calculateTotalDistance(waypoints);
      const trackName =
        gpxResult.metadata?.name ||
        gpxResult.tracks[0]?.name ||
        gpxResult.routes[0]?.name ||
        'Itinéraire importé';

      // Create success message
      const successMsg = `✅ ${trackName} importé: ${waypoints.length} points, ${distance.toFixed(1)}km`;
      setUploadStatus('success');
      setUploadMessage(successMsg);

      // Call the callback with the data
      onGPXImported(waypoints, gpxResult.metadata);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Erreur lors de l'import du fichier GPX";
      setUploadStatus('error');
      setUploadMessage(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsProcessing(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Upload className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getStatusColor = () => {
    switch (uploadStatus) {
      case 'success':
        return 'border-green-300 bg-green-50';
      case 'error':
        return 'border-red-300 bg-red-50';
      default:
        return dragOver
          ? 'border-emerald-400 bg-emerald-50'
          : 'border-gray-300 bg-white';
    }
  };

  return (
    <div className={className}>
      {/* Zone de drop/upload */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-200 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 ${getStatusColor()}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".gpx"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3 text-center">
          {isProcessing ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          ) : (
            getStatusIcon()
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              {isProcessing
                ? 'Traitement du fichier...'
                : 'Importer un fichier GPX'}
            </h3>
            <p className="text-xs text-gray-500">
              Glissez-déposez un fichier .gpx ou cliquez pour parcourir
            </p>
          </div>

          {/* Formats supportés */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <FileText className="w-4 h-4" />
            <span>Formats: .gpx</span>
          </div>
        </div>
      </div>

      {/* Message de statut */}
      {uploadMessage && (
        <div
          className={`mt-3 p-3 rounded-xl text-sm ${
            uploadStatus === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {uploadMessage}
        </div>
      )}

      {/* Aide */}
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>
          <strong>💡 Astuce:</strong> Les fichiers GPX peuvent contenir des
          tracks, routes ou waypoints.
        </p>
        <p>
          <strong>📍 Priorité:</strong> Routes → Tracks → Waypoints individuels
        </p>
        <p>
          <strong>⚡ Performance:</strong> Les tracks longs sont automatiquement
          simplifiés (max 20 points)
        </p>
      </div>
    </div>
  );
}
