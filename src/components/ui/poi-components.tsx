import { memo, type ReactNode } from 'react';

import { FaFilter } from 'react-icons/fa';

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

/**
 * Composant sélecteur de filtre réutilisable
 */
const FilterSelect = memo<FilterSelectProps>(
  ({ value, onChange, options, placeholder = 'Tous les types' }) => (
    <div className="flex items-center gap-2">
      <FaFilter className="w-3 h-3 text-gray-500" />
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
      >
        <option value="all">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
);

FilterSelect.displayName = 'FilterSelect';

interface ScrollableListProps {
  children: ReactNode;
  maxHeight?: string;
  emptyMessage?: string;
  isEmpty?: boolean;
}

/**
 * Composant liste scrollable réutilisable avec scroll amélioré
 */
const ScrollableList = memo<ScrollableListProps>(
  ({
    children,
    maxHeight = 'max-h-32',
    emptyMessage = 'Aucun élément trouvé',
    isEmpty = false,
  }) => {
    if (isEmpty) {
      return <div className="text-xs text-gray-500 italic">{emptyMessage}</div>;
    }

    return (
      <div
        className={`${maxHeight} overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500 space-y-1 pr-1`}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#9CA3AF #F3F4F6',
        }}
      >
        {children}
      </div>
    );
  }
);

ScrollableList.displayName = 'ScrollableList';

interface POIItemProps {
  name: string;
  typeIcon: string;
  typeName: string;
  elevation?: number;
  onClick: () => void;
  children?: ReactNode;
}

/**
 * Composant item de point d'intérêt réutilisable avec animations améliorées
 */
const POIItem = memo<POIItemProps>(
  ({ name, typeIcon, typeName, elevation, onClick, children }) => (
    <button
      onClick={onClick}
      className="w-full text-left p-3 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm rounded-lg border border-gray-200 transition-all duration-200 cursor-pointer group transform hover:scale-[1.02] active:scale-[0.98]"
      title={`Cliquer pour zoomer sur ${name}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-base flex-shrink-0 mt-0.5">{typeIcon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-700 transition-colors">
            {name}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {typeName}
            {elevation && elevation > 0 && ` • ${elevation}m`}
          </div>
          {children}
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-blue-500 transform group-hover:scale-110">
          🔍
        </div>
      </div>
    </button>
  )
);

POIItem.displayName = 'POIItem';

export { FilterSelect, ScrollableList, POIItem };
