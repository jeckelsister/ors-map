import { memo } from "react";

const SummaryDisplay = memo(({ summary, error }) => {
  if (error) {
    return <div className="mt-2 text-red-600 font-semibold">{error}</div>;
  }

  if (!summary) return null;

  const formatDuration = (duration) => {
    const h = Math.floor(duration / 3600);
    const m = Math.round((duration % 3600) / 60);
    return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ""}` : `${m}min`;
  };

  return (
    <div className="mt-2 text-gray-800 font-medium">
      <div>Distance : {(summary.distance / 1000).toFixed(2)} km</div>
      <div>Durée estimée : {formatDuration(summary.duration)}</div>
      <div>Dénivelé + : {summary.ascent ?? "N/A"} m</div>
      <div>Dénivelé - : {summary.descent ?? "N/A"} m</div>
    </div>
  );
});

SummaryDisplay.displayName = "SummaryDisplay";

export default SummaryDisplay;
