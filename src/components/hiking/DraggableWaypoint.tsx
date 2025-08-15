import type { Coordinates } from '@/types/hiking';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';
import { FaGripVertical, FaMinus } from 'react-icons/fa';
import WaypointAutocomplete from './WaypointAutocomplete';

interface DraggableWaypointProps {
  waypoint: Coordinates;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isLoop: boolean;
  onUpdate: (field: keyof Coordinates, value: string | number) => void;
  onRemove: () => void;
  canRemove: boolean;
  onLocationSelect?: (lat: number, lng: number, name: string) => void;
}

export default function DraggableWaypoint({
  waypoint,
  index,
  isFirst,
  isLast,
  isLoop,
  onUpdate,
  onRemove,
  canRemove,
  onLocationSelect,
}: DraggableWaypointProps): React.JSX.Element {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: waypoint.id || `waypoint-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getWaypointLabel = () => {
    if (isFirst) return 'A';
    if (isLast && !isLoop) return 'B';
    return (index + 1).toString();
  };

  const getWaypointColor = () => {
    if (isFirst) return 'bg-green-500';
    if (isLast && !isLoop) return 'bg-red-500';
    return 'bg-blue-500';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-2 p-2 bg-gray-50 rounded-lg border transition-all
        ${isDragging ? 'shadow-lg bg-white border-blue-300 scale-105' : 'border-transparent'}
      `}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 p-1 cursor-grab hover:bg-gray-200 rounded transition-colors"
      >
        <FaGripVertical className="w-3 h-3 text-gray-400" />
      </div>

      {/* Waypoint Label */}
      <div
        className={`
          flex-shrink-0 w-6 h-6 text-white text-xs rounded-full 
          flex items-center justify-center font-bold
          ${getWaypointColor()}
        `}
      >
        {getWaypointLabel()}
      </div>

      {/* Name Input with Autocomplete */}
      <div className="flex-1">
        <WaypointAutocomplete
          value={waypoint.name || ''}
          onChange={(value) => onUpdate('name', value)}
          onLocationSelect={(lat, lng, name) => {
            onUpdate('lat', lat);
            onUpdate('lng', lng);
            onUpdate('name', name);
            onLocationSelect?.(lat, lng, name);
          }}
          placeholder={`Point ${index + 1}`}
          className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Coordinates Display */}
      {waypoint.lat !== 0 && waypoint.lng !== 0 && (
        <div className="flex-shrink-0 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {waypoint.lat.toFixed(4)}, {waypoint.lng.toFixed(4)}
        </div>
      )}

      {/* Remove Button */}
      <button
        onClick={onRemove}
        disabled={!canRemove}
        className="flex-shrink-0 p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <FaMinus className="w-3 h-3" />
      </button>
    </div>
  );
}
