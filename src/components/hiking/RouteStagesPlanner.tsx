import type { Coordinates, HikingProfile } from '@/types/hiking';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import React, { useState } from 'react';
import { FaMinus, FaPlus, FaRedo, FaRoute, FaCog } from 'react-icons/fa';
import DraggableWaypoint from './DraggableWaypoint';
import WaypointAutocomplete from './WaypointAutocomplete';
import { HIKING_PROFILES } from '@/constants/hiking';

interface RouteStagesPlannerProps {
  waypoints: Coordinates[];
  onWaypointsChange: (waypoints: Coordinates[]) => void;
  isLoop: boolean;
  onLoopChange: (isLoop: boolean) => void;
  stageCount: number;
  onStageCountChange: (count: number) => void;
  hikingProfile?: HikingProfile | null;
  onProfileChange?: (profile: HikingProfile) => void;
  maxStages?: number;
}

export default function RouteStagesPlanner({
  waypoints,
  onWaypointsChange,
  isLoop,
  onLoopChange,
  stageCount,
  onStageCountChange,
  hikingProfile,
  onProfileChange,
  maxStages = 10,
}: RouteStagesPlannerProps): React.JSX.Element {
  const [newWaypointName, setNewWaypointName] = useState('');

  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for reordering waypoints
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = waypoints.findIndex(
        waypoint => waypoint.id === active.id
      );
      const newIndex = waypoints.findIndex(
        waypoint => waypoint.id === over?.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const newWaypoints = arrayMove(waypoints, oldIndex, newIndex);
        onWaypointsChange(newWaypoints);
      }
    }
  };

  const addWaypoint = () => {
    if (waypoints.length >= 20) return; // Limit to 20 waypoints

    const newWaypoint: Coordinates = {
      id: `waypoint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lat: 0,
      lng: 0,
      name: newWaypointName || `Point ${waypoints.length + 1}`,
    };

    onWaypointsChange([...waypoints, newWaypoint]);
    setNewWaypointName('');
  };

  const addWaypointFromLocation = (lat: number, lng: number, name: string) => {
    if (waypoints.length >= 20) return; // Limit to 20 waypoints

    const newWaypoint: Coordinates = {
      id: `waypoint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lat,
      lng,
      name,
    };

    onWaypointsChange([...waypoints, newWaypoint]);
    setNewWaypointName('');
  };

  const removeWaypoint = (index: number) => {
    if (waypoints.length <= 2) return; // Keep at least 2 points

    const newWaypoints = waypoints.filter((_, i) => i !== index);
    onWaypointsChange(newWaypoints);
  };

  const updateWaypoint = (
    index: number,
    field: keyof Coordinates,
    value: string | number
  ) => {
    const newWaypoints = [...waypoints];
    newWaypoints[index] = { ...newWaypoints[index], [field]: value };
    onWaypointsChange(newWaypoints);
  };

  const handleLocationSelect = (
    index: number,
    lat: number,
    lng: number,
    name: string
  ) => {
    const newWaypoints = [...waypoints];
    newWaypoints[index] = {
      ...newWaypoints[index],
      lat,
      lng,
      name,
    };
    onWaypointsChange(newWaypoints);
  };

  const getStageDescription = () => {
    if (waypoints.length < 2)
      return 'Ajoutez au moins 2 points pour créer un itinéraire';

    const totalPoints = isLoop ? waypoints.length + 1 : waypoints.length;
    const pointsPerStage = Math.ceil(totalPoints / stageCount);

    return `${stageCount} étape${stageCount > 1 ? 's' : ''} • ~${pointsPerStage} point${pointsPerStage > 1 ? 's' : ''} par étape`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          <FaRoute className="inline mr-2" />
          Planification d'itinéraire
        </h3>

        <button
          onClick={() => onLoopChange(!isLoop)}
          className={`
            flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium transition-all
            ${
              isLoop
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
            }
          `}
        >
          <FaRedo className="w-3 h-3" />
          {isLoop ? 'Boucle' : 'Linéaire'}
        </button>
      </div>

      {/* Route Type Info */}
      <div
        className={`p-3 rounded-lg border ${isLoop ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}
      >
        <div className="text-sm font-medium">
          {isLoop ? 'Itinéraire en boucle' : 'Itinéraire linéaire'}
        </div>
        <div className="text-xs text-gray-600 mt-1">
          {isLoop
            ? "Le point d'arrivée sera le même que le point de départ"
            : 'Itinéraire du point A au point B'}
        </div>
      </div>

      {/* Trail Preferences Section */}
      {onProfileChange && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FaCog className="w-4 h-4 text-gray-600" />
            <h4 className="text-sm font-semibold text-gray-700">Préférences de sentiers</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {HIKING_PROFILES.map(profile => {
              const IconComponent = profile.icon;
              const isSelected = hikingProfile?.id === profile.id;
              
              return (
                <button
                  key={profile.id}
                  onClick={() => onProfileChange(profile)}
                  className={`
                    flex items-center gap-2 p-2 rounded-lg border text-xs transition-all
                    ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div
                    className={`
                      flex items-center justify-center w-6 h-6 rounded
                      ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}
                    `}
                  >
                    <IconComponent className={`w-3 h-3 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{profile.name}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {hikingProfile && (
            <div className="bg-gray-50 border border-gray-200 p-2 rounded text-xs">
              <div className="font-medium text-gray-700 mb-1">{hikingProfile.name}</div>
              <div className="text-gray-600 mb-2">{hikingProfile.description}</div>
              
              <div className="space-y-1 mb-2">
                <div className="font-medium text-gray-700">Effets sur le calcul d'itinéraire :</div>
                {hikingProfile.preferences.preferOfficial && !hikingProfile.preferences.allowUnofficial && (
                  <div className="flex items-start gap-1">
                    <span className="w-1 h-1 bg-green-500 rounded-full mt-1 flex-shrink-0"></span>
                    <span>Évite les escaliers urbains et ferries, privilégie les sentiers de randonnée balisés</span>
                  </div>
                )}
                {hikingProfile.preferences.preferOfficial && hikingProfile.preferences.allowUnofficial && (
                  <div className="flex items-start gap-1">
                    <span className="w-1 h-1 bg-orange-500 rounded-full mt-1 flex-shrink-0"></span>
                    <span>Équilibre entre sentiers officiels et alternatifs, évite seulement les ferries</span>
                  </div>
                )}
                {hikingProfile.preferences.noPreference && (
                  <div className="flex items-start gap-1">
                    <span className="w-1 h-1 bg-gray-500 rounded-full mt-1 flex-shrink-0"></span>
                    <span>Optimise uniquement sur distance et dénivelé, autorise tous types de chemins</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="font-medium text-gray-700">Types de sentiers :</div>
                {hikingProfile.preferences.preferOfficial && (
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                    <span>Privilégie les sentiers officiels (GR, HRP, etc.)</span>
                  </div>
                )}
                {hikingProfile.preferences.allowUnofficial && (
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                    <span>Autorise les sentiers non-officiels</span>
                  </div>
                )}
                {hikingProfile.preferences.noPreference && (
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                    <span>Aucune préférence de type de sentier</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stage Count Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Nombre d'étapes : {stageCount}
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStageCountChange(Math.max(1, stageCount - 1))}
            disabled={stageCount <= 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaMinus className="w-3 h-3" />
          </button>

          <input
            type="range"
            min="1"
            max={maxStages}
            value={stageCount}
            onChange={e => onStageCountChange(parseInt(e.target.value))}
            className="flex-1"
          />

          <button
            onClick={() =>
              onStageCountChange(Math.min(maxStages, stageCount + 1))
            }
            disabled={stageCount >= maxStages}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus className="w-3 h-3" />
          </button>
        </div>

        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          {getStageDescription()}
        </div>
      </div>

      {/* Waypoints List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Points de passage ({waypoints.length})
          </label>
          <button
            onClick={addWaypoint}
            disabled={waypoints.length >= 20}
            className="p-1 rounded text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={waypoints.map(
                waypoint =>
                  waypoint.id || `waypoint-${waypoints.indexOf(waypoint)}`
              )}
              strategy={verticalListSortingStrategy}
            >
              {waypoints.map((waypoint, index) => (
                <DraggableWaypoint
                  key={waypoint.id || `waypoint-${index}`}
                  waypoint={waypoint}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === waypoints.length - 1}
                  isLoop={isLoop}
                  onUpdate={(field, value) =>
                    updateWaypoint(index, field, value)
                  }
                  onRemove={() => removeWaypoint(index)}
                  canRemove={waypoints.length > 2}
                  onLocationSelect={(lat, lng, name) =>
                    handleLocationSelect(index, lat, lng, name)
                  }
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {/* Add waypoint input with autocomplete */}
        <div className="flex gap-2">
          <div className="flex-1">
            <WaypointAutocomplete
              value={newWaypointName}
              onChange={setNewWaypointName}
              onLocationSelect={addWaypointFromLocation}
              placeholder="Nom du nouveau point"
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={addWaypoint}
            disabled={waypoints.length >= 20}
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info about clicking on map and drag & drop */}
      <div className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 p-2 rounded space-y-1">
        <div>
          💡 Double-cliquez sur la carte pour définir les points de passage
        </div>
        <div>
          🔄 Glissez-déposez les points dans la liste pour changer l'ordre
        </div>
      </div>
    </div>
  );
}
