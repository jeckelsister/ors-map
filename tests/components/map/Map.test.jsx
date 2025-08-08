import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Map from '../../../src/components/map/Map';
import useAutocomplete from '../../../src/hooks/map/useAutocomplete';
import useMapRoute from '../../../src/hooks/map/useMapRoute';

// Mock hooks
vi.mock('../../../src/hooks/map/useAutocomplete', () => ({
  default: vi.fn(),
}));

vi.mock('../../../src/hooks/map/useMapRoute', () => ({
  default: vi.fn(),
}));

// Mock child components
vi.mock('../../../src/components/map/LocationForm', () => ({
  default: vi.fn(({ onCreateTrace }) => (
    <div data-testid="location-form">
      <button onClick={onCreateTrace} data-testid="create-trace-btn">
        Create Trace
      </button>
    </div>
  )),
}));

vi.mock('../../../src/components/map/SummaryDisplay', () => ({
  default: vi.fn(({ summary, error }) => (
    <div data-testid="summary-display">
      {summary && <div>Summary: {summary.distance}</div>}
      {error && <div>Error: {error.message}</div>}
    </div>
  )),
}));

vi.mock('../../../src/components/map/TransportModeSelector', () => ({
  default: vi.fn(({ onModeChange }) => (
    <div data-testid="transport-mode-selector">
      <button onClick={() => onModeChange('cycling')} data-testid="cycling-btn">
        Cycling
      </button>
    </div>
  )),
}));

vi.mock('../../../src/components/map/LocationSearchBox', () => ({
  default: vi.fn(() => <div data-testid="location-search-box">Search Box</div>),
}));

describe('Map Component', () => {
  const defaultMapRouteReturn = {
    mapRef: { current: null },
    error: null,
    summary: null,
    isLoading: false,
    removeRoute: vi.fn(),
    getActiveRoutes: vi.fn(() => []),
    enableMapClickForStart: vi.fn(),
    disableMapClickForStart: vi.fn(),
    clearStartMarker: vi.fn(),
    enableMapClickForEnd: vi.fn(),
    disableMapClickForEnd: vi.fn(),
    clearEndMarker: vi.fn(),
    createStartMarkerFromLocation: vi.fn(),
    createEndMarkerFromLocation: vi.fn(),
  };

  const defaultAutocompleteReturn = {
    traceStart: null,
    traceEnd: null,
    startQuery: '',
    endQuery: '',
    startSuggestions: [],
    endSuggestions: [],
    setStartQuery: vi.fn(),
    setEndQuery: vi.fn(),
    handleStartSearch: vi.fn(),
    handleEndSearch: vi.fn(),
    handleStartSelect: vi.fn(),
    handleEndSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useMapRoute).mockReturnValue(defaultMapRouteReturn);
    vi.mocked(useAutocomplete).mockReturnValue(defaultAutocompleteReturn);
  });

  it('renders map container with id', () => {
    render(<Map />);

    const mapElement = document.getElementById('map');
    expect(mapElement).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    render(<Map />);

    // Just check that the component renders something
    const mainContainer = document.querySelector(
      '.relative.h-screen.w-screen.bg-black'
    );
    expect(mainContainer).toBeInTheDocument();
  });

  it('shows summary when available', () => {
    const mockSummary = { distance: '5.2 km' };
    vi.mocked(useMapRoute).mockReturnValue({
      ...defaultMapRouteReturn,
      summary: mockSummary,
    });

    render(<Map />);

    expect(screen.getByText('Summary: 5.2 km')).toBeInTheDocument();
  });

  it('shows error when present', () => {
    const mockError = { message: 'Route not found' };
    vi.mocked(useMapRoute).mockReturnValue({
      ...defaultMapRouteReturn,
      error: mockError,
    });

    render(<Map />);

    expect(screen.getByText('Error: Route not found')).toBeInTheDocument();
  });

  it('calls hooks correctly', () => {
    render(<Map />);

    expect(useAutocomplete).toHaveBeenCalledTimes(1);
    expect(useMapRoute).toHaveBeenCalledTimes(1);
  });
});
