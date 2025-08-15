import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  duration = 3000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // Durée de l'animation de sortie
  }, [onClose]);

  React.useEffect(() => {
    // Animation d'entrée
    const enterTimer = setTimeout(() => setIsVisible(true), 50);

    // Timer pour la fermeture automatique
    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(autoCloseTimer);
    };
  }, [handleClose, duration]);

  const getStyles = () => {
    const baseStyles = 'backdrop-blur-md border border-opacity-20';

    switch (type) {
      case 'success':
        return `${baseStyles} bg-gradient-to-r from-green-500/90 to-emerald-500/90 border-green-400 text-white shadow-green-500/25`;
      case 'error':
        return `${baseStyles} bg-gradient-to-r from-red-500/90 to-rose-500/90 border-red-400 text-white shadow-red-500/25`;
      case 'warning':
        return `${baseStyles} bg-gradient-to-r from-amber-500/90 to-orange-500/90 border-amber-400 text-white shadow-amber-500/25`;
      case 'info':
      default:
        return `${baseStyles} bg-gradient-to-r from-blue-500/90 to-cyan-500/90 border-blue-400 text-white shadow-blue-500/25`;
    }
  };

  const getIcon = () => {
    const iconProps = { size: 20, className: 'flex-shrink-0' };

    switch (type) {
      case 'success':
        return (
          <CheckCircle
            {...iconProps}
            className={`${iconProps.className} text-green-100`}
          />
        );
      case 'error':
        return (
          <XCircle
            {...iconProps}
            className={`${iconProps.className} text-red-100`}
          />
        );
      case 'warning':
        return (
          <AlertTriangle
            {...iconProps}
            className={`${iconProps.className} text-amber-100`}
          />
        );
      case 'info':
      default:
        return (
          <Info
            {...iconProps}
            className={`${iconProps.className} text-blue-100`}
          />
        );
    }
  };

  const getProgressBarColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-300';
      case 'error':
        return 'bg-red-300';
      case 'warning':
        return 'bg-amber-300';
      case 'info':
      default:
        return 'bg-blue-300';
    }
  };

  return (
    <div
      className={`
        max-w-sm w-full
        transition-all duration-300 ease-out
        ${
          isVisible && !isExiting
            ? 'transform translate-x-0 opacity-100 scale-100'
            : isExiting
              ? 'transform translate-x-full opacity-0 scale-95'
              : 'transform translate-x-full opacity-0 scale-95'
        }
      `}
    >
      <div
        className={`
          relative overflow-hidden rounded-xl shadow-2xl
          p-4 flex items-start gap-3
          ${getStyles()}
        `}
        data-testid={`toast-${type}`}
      >
        {/* Icône */}
        <div className="mt-0.5">{getIcon()}</div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-relaxed text-white/95">
            {message}
          </p>
        </div>

        {/* Bouton de fermeture */}
        <button
          onClick={handleClose}
          className="
            flex-shrink-0 ml-2 p-1 rounded-md
            text-white/80 hover:text-white hover:bg-white/10
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-white/30
          "
          aria-label="Close notification"
        >
          <X size={16} />
        </button>

        {/* Barre de progression */}
        {duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
            <div
              className={`h-full ${getProgressBarColor()} transition-all ease-linear`}
              style={{
                width: '100%',
                animation: `toast-progress ${duration}ms linear forwards`,
              }}
            />
          </div>
        )}

        {/* Effet de brillance */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      </div>
    </div>
  );
};

export default Toast;
