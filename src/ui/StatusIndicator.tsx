import { cn } from '@/lib/utils';
import { memo, ReactNode, useMemo } from 'react';

interface StatusIndicatorProps {
  isActive: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  activeIcon?: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
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
    // Memoized variant classes using shadcn/ui colors
    const variantClasses = useMemo(() => {
      const variants = {
        default: 'bg-primary',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        destructive: 'bg-destructive',
      };
      return variants[variant];
    }, [variant]);

    const ActiveComponent = useMemo(
      () => (
        <span className="flex items-center gap-1 text-sm font-medium">
          {activeIcon || (
            <span
              className={cn(
                'inline-block w-2 h-2 rounded-full animate-ping',
                variantClasses
              )}
            ></span>
          )}
          {activeLabel}
        </span>
      ),
      [activeIcon, activeLabel, variantClasses]
    );

    if (!isActive) {
      return (
        <span className="text-sm text-muted-foreground">{inactiveLabel}</span>
      );
    }

    return ActiveComponent;
  }
);

StatusIndicator.displayName = 'StatusIndicator';

export default StatusIndicator;
