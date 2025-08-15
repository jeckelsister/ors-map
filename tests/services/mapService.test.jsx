import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('mapService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should pass a basic test', () => {
    expect(true).toBe(true);
  });

  it('should import MAP_LAYERS', async () => {
    // Mock dependencies first
    vi.doMock('../../src/constants/transportModes', () => ({
      TRANSPORT_MODES: []
    }));
    
    vi.doMock('leaflet', () => ({
      default: {}
    }));
    
    vi.doMock('axios', () => ({
      default: {
        create: vi.fn(() => ({
          post: vi.fn(),
          interceptors: { response: { use: vi.fn() } }
        }))
      }
    }));

    const { MAP_LAYERS } = await import('../../src/services/mapService');
    expect(MAP_LAYERS).toBeDefined();
  });
});
