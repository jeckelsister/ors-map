import type { RouteSummaryData } from "@/types/profile";
import { memo } from "react";

interface SummaryDisplayProps {
  summary: RouteSummaryData | null;
  error: string | null;
}

const SummaryDisplay = memo<SummaryDisplayProps>(({ summary, error }) => {
  if (error) {
    return <div className="mt-2 text-red-600 font-semibold">{error}</div>;
  }

  if (!summary) return null;

  return (
    <div className="mt-2 text-gray-800 font-medium">
      <div>Distance : {summary.distance}</div>
      <div>Durée estimée : {summary.duration}</div>
      <div>Dénivelé + : {summary.ascent ?? "N/A"} m</div>
      <div>Dénivelé - : {summary.descent ?? "N/A"} m</div>
    </div>
  );
});

SummaryDisplay.displayName = "SummaryDisplay";

export default SummaryDisplay;
