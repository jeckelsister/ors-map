import type { RouteSummaryData } from '@/types/profile';
import { memo, useMemo } from 'react';

interface SummaryDisplayProps {
  summary: RouteSummaryData | null;
  error: string | null;
}

// Memoized error component for better readability
const ErrorDisplay = memo<{ error: string }>(({ error }) => (
  <div
    className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 font-semibold"
    role="alert"
    aria-live="polite"
  >
    ⚠️ {error}
  </div>
));
ErrorDisplay.displayName = 'ErrorDisplay';

// Memoized summary item component with proper typing
const SummaryItem = memo<{
  icon: string;
  label: string;
  value: string | number;
  unit?: string;
}>(({ icon, label, value, unit }) => (
  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
    <span className="flex items-center gap-2 text-gray-700">
      <span aria-hidden="true">{icon}</span>
      {label} :
    </span>
    <span className="font-semibold text-gray-900">
      {String(value)}
      {unit && <span className="text-sm text-gray-600 ml-1">{unit}</span>}
    </span>
  </div>
));
SummaryItem.displayName = 'SummaryItem';

const SummaryDisplay = memo<SummaryDisplayProps>(({ summary, error }) => {
  // Memoized summary data structure for consistent rendering
  // Call useMemo at the top level to avoid conditional hook calls
  const summaryItems = useMemo(() => {
    if (!summary) return [];

    return [
      {
        icon: '📏',
        label: 'Distance',
        value: summary.distance,
      },
      {
        icon: '⏱️',
        label: 'Durée estimée',
        value: summary.duration,
      },
      {
        icon: '📈',
        label: 'Dénivelé positif',
        value: summary.ascent ?? 'N/A',
        unit: summary.ascent ? 'm' : undefined,
      },
      {
        icon: '📉',
        label: 'Dénivelé négatif',
        value: summary.descent ?? 'N/A',
        unit: summary.descent ? 'm' : undefined,
      },
    ];
  }, [summary]);

  // Early return for error state
  if (error) {
    return <ErrorDisplay error={error} />;
  }

  // Early return for empty state
  if (!summary) return null;

  return (
    <div
      className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
      role="region"
      aria-label="Résumé de l'itinéraire"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-100 pb-2">
        📊 Résumé de l'itinéraire
      </h3>
      <div className="space-y-2">
        {summaryItems.map((item, index) => (
          <SummaryItem
            key={`${item.label}-${index}`}
            icon={item.icon}
            label={item.label}
            value={item.value}
            unit={item.unit}
          />
        ))}
      </div>
    </div>
  );
});

SummaryDisplay.displayName = 'SummaryDisplay';

export default SummaryDisplay;
