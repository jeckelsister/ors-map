import Button from '@/ui/Button';
import { memo, ReactNode, useMemo } from 'react';

interface IconButtonProps {
  icon: ReactNode;
  onClick: () => void;
  isActive?: boolean;
  title: string;
  label?: ReactNode;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  'aria-label'?: string;
}

/**
 * Composant bouton avec icône réutilisable
 * Optimisé pour les performances avec React.memo et useMemo
 */
const IconButton = memo<IconButtonProps>(
  ({
    icon,
    onClick,
    isActive = false,
    title,
    label,
    className = '',
    activeClassName = 'bg-blue-600 text-white border-blue-600 shadow-md',
    inactiveClassName = 'bg-white text-gray-600 border-gray-300 hover:border-blue-400',
    'aria-label': ariaLabel,
  }) => {
    // Memoized CSS classes to prevent recalculation
    const buttonClasses = useMemo(
      () =>
        `p-2 border rounded transition-all duration-200 ${
          isActive ? activeClassName : inactiveClassName
        } ${className}`.trim(),
      [isActive, activeClassName, inactiveClassName, className]
    );

    return (
      <Button
        className={buttonClasses}
        onClick={onClick}
        title={title}
        aria-label={ariaLabel || title}
      >
        {icon}
        {label && <span className="hidden sm:inline ml-1">{label}</span>}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;
