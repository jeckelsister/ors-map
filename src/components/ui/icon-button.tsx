import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { memo, ReactNode } from 'react';

interface IconButtonProps {
  icon: ReactNode;
  onClick: () => void;
  isActive?: boolean;
  title: string;
  label?: ReactNode;
  className?: string;
  'aria-label'?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
}

/**
 * Composant bouton avec icône réutilisable
 * Utilise shadcn/ui pour un style moderne
 */
const IconButton = memo<IconButtonProps>(
  ({
    icon,
    onClick,
    isActive = false,
    title,
    label,
    className = '',
    'aria-label': ariaLabel,
    size = 'default',
    variant = 'outline',
  }) => {
    const buttonVariant = isActive ? 'default' : variant;

    return (
      <Button
        variant={buttonVariant}
        size={size}
        className={clsx(
          'transition-all duration-200',
          isActive && 'bg-primary text-primary-foreground shadow-md',
          className
        )}
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
