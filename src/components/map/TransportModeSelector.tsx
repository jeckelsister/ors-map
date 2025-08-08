import { TRANSPORT_MODES } from '@/constants/transportModes';
import Button from '@/ui/Button';
import { memo, useCallback, useMemo } from 'react';

interface TransportModeSelectorProps {
  activeRoutes?: string[];
  onProfileChange: (profileId: string) => void;
}

// Memoized transport mode button component
const TransportModeButton = memo<{
  id: string;
  icon: React.ComponentType<{ className: string }>;
  label: string;
  color: string;
  isActive: boolean;
  onClick: (profileId: string) => void;
}>(({ id, icon: Icon, label, color, isActive, onClick }) => {
  // Memoized button style to prevent recalculation
  const buttonStyle = useMemo(
    () => ({
      backgroundColor: isActive ? color : 'white',
      borderColor: color,
      color: isActive ? 'white' : color,
    }),
    [isActive, color]
  );

  // Memoized CSS classes
  const buttonClasses = useMemo(
    () =>
      `flex items-center gap-2 transition-all duration-150 ${
        isActive
          ? 'bg-opacity-90 text-white border shadow-md'
          : 'bg-white hover:bg-opacity-10 border hover:shadow-sm'
      }`,
    [isActive]
  );

  // Optimized click handler with useCallback
  const handleClick = useCallback(() => {
    onClick(id);
  }, [id, onClick]);

  return (
    <Button
      className={buttonClasses}
      onClick={handleClick}
      title={label}
      style={buttonStyle}
      aria-label={`${isActive ? 'Désactiver' : 'Activer'} le mode de transport ${label}`}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
});
TransportModeButton.displayName = 'TransportModeButton';

const TransportModeSelector = memo<TransportModeSelectorProps>(
  ({ activeRoutes = [], onProfileChange }) => {
    // Memoized active routes set for O(1) lookup performance
    const activeRoutesSet = useMemo(
      () => new Set(activeRoutes),
      [activeRoutes]
    );

    // Optimized callback with useCallback to prevent child re-renders
    const handleProfileChange = useCallback(
      (profileId: string) => {
        onProfileChange(profileId);
      },
      [onProfileChange]
    );

    return (
      <div
        className="grid grid-cols-2 gap-2 mb-2"
        role="group"
        aria-label="Modes de transport"
      >
        {TRANSPORT_MODES.map(({ id, icon, label, color }) => (
          <TransportModeButton
            key={id}
            id={id}
            icon={icon}
            label={label}
            color={color}
            isActive={activeRoutesSet.has(id)}
            onClick={handleProfileChange}
          />
        ))}
      </div>
    );
  }
);

TransportModeSelector.displayName = 'TransportModeSelector';

export default TransportModeSelector;
