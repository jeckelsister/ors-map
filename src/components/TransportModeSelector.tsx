import { memo } from "react";
import { TRANSPORT_MODES } from "@/constants/transportModes";
import Button from "@/ui/Button";

interface TransportModeSelectorProps {
  activeRoutes?: string[];
  onProfileChange: (profileId: string) => void;
}

const TransportModeSelector = memo<TransportModeSelectorProps>(
  ({ activeRoutes = [], onProfileChange }) => (
    <div className="grid grid-cols-2 gap-2 mb-2">
      {TRANSPORT_MODES.map(({ id, icon: Icon, label, color }) => {
        const isActive = activeRoutes.includes(id);
        return (
          <Button
            key={id}
            className={`flex items-center gap-2 ${
              isActive
                ? `bg-opacity-90 text-white border`
                : `bg-white hover:bg-opacity-10 border`
            }`}
            onClick={() => onProfileChange(id)}
            title={label}
            style={{
              backgroundColor: isActive ? color : "white",
              borderColor: color,
              color: isActive ? "white" : color,
            }}
          >
            <Icon className="h-5 w-5" />
            <span className="hidden sm:inline">{label}</span>
          </Button>
        );
      })}
    </div>
  )
);

TransportModeSelector.displayName = "TransportModeSelector";

export default TransportModeSelector;
