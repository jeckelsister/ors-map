/**
 * Utility functions for creating map icons and markers
 * Used by hiking map components to generate consistent icon styles
 */

// Icon SVG definitions for different POI types
const ICON_SVGS = {
  home: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9,22 9,12 15,12 15,22"></polyline></svg>',
  droplets:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"></path><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2.04 4.6 4.14 5.78s3.86 2.19 3.86 3.27a4.43 4.43 0 0 1-.86 2.71"></path><path d="M17.8 11.9A3 3 0 0 0 15 9h-1.26a4.24 4.24 0 0 1-.63-1.67"></path></svg>',
  mountain:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"></path></svg>',
  castle:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20"></path><path d="M4 20V10a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v10"></path><path d="M18 20V10a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v10"></path><path d="M10 8V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4"></path><circle cx="8" cy="6" r="2"></circle><circle cx="16" cy="6" r="2"></circle></svg>',
  eye: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
  landmark:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="22" y2="22"></line><line x1="6" x2="6" y1="18" y2="11"></line><line x1="10" x2="10" y1="18" y2="11"></line><line x1="14" x2="14" y1="18" y2="11"></line><line x1="18" x2="18" y1="18" y2="11"></line><polygon points="12 2 20 7 4 7"></polygon></svg>',
  waves:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path></svg>',
} as const;

// Color classes for different icon types
const COLOR_CLASSES = {
  gray: 'bg-gray-600 text-white',
  amber: 'bg-amber-600 text-white',
  purple: 'bg-purple-600 text-white',
  orange: 'bg-orange-600 text-white',
  blue: 'bg-blue-600 text-white',
  red: 'bg-red-600 text-white',
  green: 'bg-green-600 text-white',
  indigo: 'bg-indigo-600 text-white',
  pink: 'bg-pink-600 text-white',
  yellow: 'bg-yellow-600 text-white',
} as const;

export type IconName = keyof typeof ICON_SVGS;
export type IconColor = keyof typeof COLOR_CLASSES;

/**
 * Creates HTML for POI marker icons with consistent styling
 */
export const createPOIIconHtml = (
  iconName: IconName,
  color: IconColor,
  label: string
): string => {
  const colorClass = COLOR_CLASSES[color] || COLOR_CLASSES.gray;
  const iconSvg = ICON_SVGS[iconName] || ICON_SVGS.mountain;

  return `
    <div class="${colorClass} rounded-lg px-2 py-1 text-xs font-medium shadow-lg flex items-center gap-1">
      ${iconSvg}
      <span>${label}</span>
    </div>
  `;
};

/**
 * Creates SVG icon for legend display
 */
export const createLegendIconSvg = (iconName: IconName): string => {
  return ICON_SVGS[iconName] || ICON_SVGS.mountain;
};

/**
 * Creates waypoint marker HTML with different styles for start/end/intermediate points
 */
export const createWaypointIconHtml = (
  index: number,
  totalWaypoints: number
): {
  html: string;
  className: string;
  size: [number, number];
  anchor: [number, number];
} => {
  const isStart = index === 0;
  const isEnd = index === totalWaypoints - 1 && totalWaypoints > 1;

  if (isStart) {
    return {
      html: `
        <div class="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white">
          A
        </div>
      `,
      className: 'start-marker',
      size: [40, 40],
      anchor: [20, 20],
    };
  }

  if (isEnd) {
    return {
      html: `
        <div class="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white">
          B
        </div>
      `,
      className: 'end-marker',
      size: [40, 40],
      anchor: [20, 20],
    };
  }

  // Intermediate waypoint
  return {
    html: `
      <div class="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white">
        ${index}
      </div>
    `,
    className: 'intermediate-marker',
    size: [32, 32],
    anchor: [16, 16],
  };
};

/**
 * Creates route stage marker HTML
 */
export const createStageMarkerHtml = (stageNumber: number): string => {
  return `
    <div class="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
      ${stageNumber}
    </div>
  `;
};

/**
 * Creates finish marker HTML for route end
 */
export const createFinishMarkerHtml = (): string => {
  return `
    <div class="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
      🏁
    </div>
  `;
};

/**
 * Creates temporary highlight marker for POI zoom functionality
 */
export const createHighlightMarkerHtml = (): string => {
  return `
    <div style="
      width: 24px;
      height: 24px;
      background-color: #ef4444;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 0 2px #ef4444;
      animation: pulse 1s infinite;
    "></div>
  `;
};
