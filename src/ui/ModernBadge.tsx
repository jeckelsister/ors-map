import { Badge } from '@/components/ui/badge';
import clsx from 'clsx';

interface ModernBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  pulse?: boolean;
}

export default function ModernBadge({
  children,
  variant = 'default',
  size = 'default',
  className,
  pulse = false,
}: ModernBadgeProps): React.JSX.Element {
  const sizeVariants = {
    sm: 'text-xs px-1.5 py-0.5',
    default: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <Badge
      variant={variant}
      className={clsx(sizeVariants[size], pulse && 'animate-pulse', className)}
    >
      {children}
    </Badge>
  );
}
