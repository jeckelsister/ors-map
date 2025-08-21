import React from 'react';

import { Toaster as SonnerToaster } from '@/components/ui/sonner';

export default function Toaster(): React.JSX.Element {
  return (
    <SonnerToaster
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
