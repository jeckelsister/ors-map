import { memo } from 'react';

interface LegendProps {
  title?: string;
  items: Array<{
    icon: string;
    label: string;
  }>;
  columns?: number;
}

/**
 * Composant légende réutilisable
 */
const Legend = memo<LegendProps>(({
  title = "Légende",
  items,
  columns = 2
}) => (
  <div className="p-3 bg-gray-50 rounded-lg">
    <div className="text-xs font-medium text-gray-700 mb-2">{title}</div>
    <div className="space-y-1 text-xs">
      <div className={`grid grid-cols-${columns} gap-2`}>
        {items.map((item, index) => (
          <div key={index}>
            {item.icon} {item.label}
          </div>
        ))}
      </div>
    </div>
  </div>
));

Legend.displayName = 'Legend';

export default Legend;
