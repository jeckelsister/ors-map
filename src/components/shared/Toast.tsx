import React from 'react';

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
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 text-white';
      case 'error':
        return 'bg-red-600 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'info':
      default:
        return 'bg-blue-600 text-white';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-2 z-50 max-w-sm ${getStyles()}`}
    >
      <span className="text-lg">{getIcon()}</span>
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-white hover:text-gray-200 transition-colors"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
