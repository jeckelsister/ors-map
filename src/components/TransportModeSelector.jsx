import { memo } from "react";
import { FaBicycle, FaBolt, FaHiking, FaMountain } from "react-icons/fa";
import Button from "../ui/Button";

export const TRANSPORT_MODES = [
  {
    id: "cycling-regular",
    icon: FaBicycle,
    label: "Vélo classique",
  },
  {
    id: "cycling-mountain",
    icon: FaMountain,
    label: "VTT",
  },
  {
    id: "cycling-electric",
    icon: FaBolt,
    label: "Vélo électrique",
  },
  {
    id: "foot-hiking",
    icon: FaHiking,
    label: "Randonnée",
  },
];

const TransportModeSelector = memo(({ selectedProfile, onProfileChange }) => (
  <div className="grid grid-cols-2 gap-2 mb-2">
    {TRANSPORT_MODES.map(({ id, icon: Icon, label }) => (
      <Button
        key={id}
        className={`flex items-center gap-2 ${
          selectedProfile === id
            ? "bg-blue-500 text-white border-blue-500"
            : "bg-white text-blue-600 border-blue-400 hover:bg-blue-50"
        }`}
        onClick={() => onProfileChange(id)}
        title={label}
      >
        <Icon className="h-5 w-5" />
        <span className="hidden sm:inline">{label}</span>
      </Button>
    ))}
  </div>
));

TransportModeSelector.displayName = "TransportModeSelector";

export default TransportModeSelector;
