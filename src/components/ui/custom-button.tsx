import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import React from 'react';

interface ModernButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  asChild?: boolean;
}

export default function ModernButton({
  children,
  variant = 'default',
  size = 'default',
  className,
  asChild = false,
  ...props
}: ModernButtonProps): React.JSX.Element {
  return (
    <Button
      variant={variant}
      size={size}
      className={clsx(className)}
      asChild={asChild}
      {...props}
    >
      {children}
    </Button>
  );
}
