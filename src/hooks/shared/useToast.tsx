import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
  useRef,
} from 'react';
import Toast from '../../components/shared/Toast';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  showToast: (
    message: string,
    type: ToastItem['type'],
    duration?: number
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdCounter = useRef(0); // Performance: avoid Date.now() and Math.random()

  const showToast = useCallback(
    (message: string, type: ToastItem['type'], duration?: number) => {
      // More efficient ID generation
      const id = `toast-${++toastIdCounter.current}`;
      const newToast: ToastItem = { id, message, type, duration };

      setToasts(prev => {
        // Performance: limit max toasts to prevent memory bloat
        const newToasts = [...prev, newToast];
        return newToasts.length > 5 ? newToasts.slice(-5) : newToasts;
      });
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const contextValue = useMemo(
    () => ({
      showToast,
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
