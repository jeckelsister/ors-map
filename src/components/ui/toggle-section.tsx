import { memo, type ReactNode } from 'react';

import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface ToggleSectionProps {
  title: string;
  icon: ReactNode;
  count: number;
  isVisible: boolean;
  onToggle: () => void;
  children?: ReactNode;
  accentColor?: 'green' | 'blue' | 'gray';
}

/**
 * Composant section avec bouton toggle réutilisable
 * Utilisé pour les refuges, points d'eau, etc.
 */
const ToggleSection = memo<ToggleSectionProps>(
  ({
    title,
    icon,
    count,
    isVisible,
    onToggle,
    children,
    accentColor = 'green',
  }) => {
    const colorClasses = {
      green: {
        visible: 'bg-green-100 text-green-700 hover:bg-green-200',
        hidden: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
      },
      blue: {
        visible: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
        hidden: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
      },
      gray: {
        visible: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        hidden: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
      },
    };

    const buttonClass = isVisible
      ? colorClasses[accentColor].visible
      : colorClasses[accentColor].hidden;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium">
              {title} ({count})
            </span>
          </div>

          <button
            onClick={onToggle}
            className={`p-2 rounded-lg transition-colors ${buttonClass}`}
          >
            {isVisible ? (
              <FaEye className="w-3 h-3" />
            ) : (
              <FaEyeSlash className="w-3 h-3" />
            )}
          </button>
        </div>

        {isVisible && children}
      </div>
    );
  }
);

ToggleSection.displayName = 'ToggleSection';

export default ToggleSection;
