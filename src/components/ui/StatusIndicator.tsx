import { memo, ReactNode, useMemo } from 'react';

interface StatusIndicatorProps {
  isActive: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  activeIcon?: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

/**
 * Composant indicateur de statut réutilisable
 * Peut être utilisé pour afficher l'état actif/inactif avec animation
 */
const StatusIndicator = memo<StatusIndicatorProps>(
  ({
    isActive,
    activeLabel = 'Actif',
    inactiveLabel = 'Inactif',
    activeIcon,
    variant = 'default',
  }) => {
    // Memoized variant classes
    const variantClasses = useMemo(() => {
      const variants = {
        default: 'bg-green-500',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        error: 'bg-red-500',
      };
      return variants[variant];
    }, [variant]);

    const ActiveComponent = useMemo(
      () => (
        <span className="flex items-center gap-1">
          {activeIcon || (
            <span
              className={`inline-block w-2 h-2 ${variantClasses} rounded-full animate-ping`}
            ></span>
          )}
          {activeLabel}
        </span>
      ),
      [activeIcon, activeLabel, variantClasses]
    );

    if (!isActive) {
      return <span>{inactiveLabel}</span>;
    }

    return ActiveComponent;
  }
);

StatusIndicator.displayName = 'StatusIndicator';

export default StatusIndicator;
