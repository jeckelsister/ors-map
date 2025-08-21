import { Button as ShadcnButton } from '@/components/ui/button';
import clsx from 'clsx';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  children,
  className = '',
  type = 'button',
  onClick,
  ...props
}: ButtonProps): React.JSX.Element {
  return (
    <ShadcnButton
      type={type}
      className={clsx('transition-all duration-150', className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </ShadcnButton>
  );
}
