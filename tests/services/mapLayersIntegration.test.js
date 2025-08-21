import { describe, expect, it } from 'vitest';
import {
  MAP_LAYERS,
  getAvailableMapLayers,
} from '../../src/services/mapService';

describe('Map Layers Integration', () => {
  it('should include all map layers in MAP_LAYERS', () => {
    expect(MAP_LAYERS.osmFrance).toBeDefined();
    expect(MAP_LAYERS.openTopoMap).toBeDefined();
    expect(MAP_LAYERS.cyclOSM).toBeDefined();
  });

  it('should have correct OSM France layer configuration', () => {
    expect(MAP_LAYERS.osmFrance.name).toBe('OSM France (Rando)');
    expect(MAP_LAYERS.osmFrance.attribution).toContain('OpenStreetMap France');
    expect(MAP_LAYERS.osmFrance.url).toContain('tile.openstreetmap.fr');
  });

  it('should have correct OpenTopoMap layer configuration', () => {
    expect(MAP_LAYERS.openTopoMap.name).toBe('OpenTopoMap');
    expect(MAP_LAYERS.openTopoMap.attribution).toContain('OpenTopoMap');
    expect(MAP_LAYERS.openTopoMap.url).toContain('tile.opentopomap.org');
  });

  it('should return all available map layers', () => {
    const layers = getAvailableMapLayers();
    expect(layers.length).toBeGreaterThanOrEqual(3);
    expect(layers.map(l => l.key)).toContain('osmFrance');
    expect(layers.map(l => l.key)).toContain('openTopoMap');
    expect(layers.map(l => l.key)).toContain('cyclOSM');
  });

  it('should mark working layers as available', () => {
    const layers = getAvailableMapLayers();
    const osmFranceLayer = layers.find(l => l.key === 'osmFrance');
    const openTopoMapLayer = layers.find(l => l.key === 'openTopoMap');
    const cyclOSMLayer = layers.find(l => l.key === 'cyclOSM');

    expect(osmFranceLayer?.available).toBe(true);
    expect(openTopoMapLayer?.available).toBe(true);
    expect(cyclOSMLayer?.available).toBe(true);
  });
});
