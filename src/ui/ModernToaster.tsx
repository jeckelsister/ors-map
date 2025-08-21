import { Toaster } from '@/components/ui/sonner';
import React from 'react';

export default function ModernToaster(): React.JSX.Element {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          border: '1px solid hsl(var(--border))',
          color: 'hsl(var(--foreground))',
        },
      }}
      expand={false}
      richColors
      closeButton
    />
  );
}
