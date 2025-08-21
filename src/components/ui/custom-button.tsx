import React from 'react';

import clsx from 'clsx';

import { Button } from '@/components/ui/button';

interface CustomButtonProps
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

export default function CustomButton({
  children,
  variant = 'default',
  size = 'default',
  className,
  asChild = false,
  ...props
}: CustomButtonProps): React.JSX.Element {
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
