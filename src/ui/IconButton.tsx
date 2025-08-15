import Button from '@/ui/Button';
import { memo, ReactNode } from 'react';

interface IconButtonProps {
  icon: ReactNode;
  onClick: () => void;
  isActive?: boolean;
  title: string;
  label?: ReactNode;
  className?: string;
  'aria-label'?: string;
}

/**
 * Composant bouton avec icône réutilisable
 * Simplifié pour une meilleure lisibilité
 */
const IconButton = memo<IconButtonProps>(({
  icon,
  onClick,
  isActive = false,
  title,
  label,
  className = '',
  'aria-label': ariaLabel,
}) => {
  const baseClasses = 'p-2 border rounded transition-all duration-200';
  const stateClasses = isActive 
    ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400';
  
  const buttonClasses = `${baseClasses} ${stateClasses} ${className}`.trim();

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
});

IconButton.displayName = 'IconButton';

export default IconButton;
