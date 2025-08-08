import { describe, expect, it } from 'vitest';
import {
  MAP_LAYERS,
  getAvailableMapLayers,
} from '../../src/services/mapService';

describe('Map Layers Integration', () => {
  it('should include all map layers in MAP_LAYERS', () => {
    expect(MAP_LAYERS.osm).toBeDefined();
    expect(MAP_LAYERS.osmFrance).toBeDefined();
    expect(MAP_LAYERS.cartoPositron).toBeDefined();
    expect(MAP_LAYERS.ignTopo).toBeDefined();
    expect(MAP_LAYERS.ignPlan).toBeDefined();
    expect(MAP_LAYERS.ignSatellite).toBeDefined();
  });

  it('should have correct OSM France layer configuration', () => {
    expect(MAP_LAYERS.osmFrance.name).toBe('OpenStreetMap France');
    expect(MAP_LAYERS.osmFrance.attribution).toContain('OpenStreetMap France');
    expect(MAP_LAYERS.osmFrance.url).toContain('tile.openstreetmap.fr');
  });

  it('should have correct Carto layer configuration', () => {
    expect(MAP_LAYERS.cartoPositron.name).toBe('Carto Light');
    expect(MAP_LAYERS.cartoPositron.attribution).toContain('CARTO');
    expect(MAP_LAYERS.cartoPositron.url).toContain('basemaps.cartocdn.com');
  });

  it('should return all available map layers', () => {
    const layers = getAvailableMapLayers();
    expect(layers.length).toBeGreaterThanOrEqual(6);
    expect(layers.map(l => l.key)).toContain('osm');
    expect(layers.map(l => l.key)).toContain('osmFrance');
    expect(layers.map(l => l.key)).toContain('cartoPositron');
  });

  it('should mark working layers as available', () => {
    const layers = getAvailableMapLayers();
    const osmLayer = layers.find(l => l.key === 'osm');
    const osmFranceLayer = layers.find(l => l.key === 'osmFrance');
    const cartoLayer = layers.find(l => l.key === 'cartoPositron');

    expect(osmLayer?.available).toBe(true);
    expect(osmFranceLayer?.available).toBe(true);
    expect(cartoLayer?.available).toBe(true);
  });
});
