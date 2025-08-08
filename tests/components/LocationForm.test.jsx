import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LocationForm from '../../src/components/map/LocationForm';

describe('LocationForm', () => {
  const defaultProps = {
    startQuery: '',
    setStartQuery: vi.fn(),
    startSuggestions: [],
    setStartSuggestions: vi.fn(),
    handleStartSuggestion: vi.fn(),
    endQuery: '',
    setEndQuery: vi.fn(),
    endSuggestions: [],
    setEndSuggestions: vi.fn(),
    handleEndSuggestion: vi.fn(),
    setTraceStart: vi.fn(),
    onCreateTrace: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders start and end inputs', () => {
    render(<LocationForm {...defaultProps} />);

    expect(screen.getByLabelText('Départ :')).toBeInTheDocument();
    expect(screen.getByLabelText('Arrivée :')).toBeInTheDocument();
    expect(screen.getByText('Créer la trace')).toBeInTheDocument();
  });

  it('calls onCreateTrace when create button is clicked', async () => {
    const user = userEvent.setup();
    const onCreateTrace = vi.fn();

    render(<LocationForm 
      {...defaultProps} 
      startQuery="Paris"
      endQuery="Lyon"
      onCreateTrace={onCreateTrace} 
    />);

    await user.click(screen.getByText('Créer la trace'));
    expect(onCreateTrace).toHaveBeenCalledOnce();
  });

  it('calls geolocation when location button is clicked', async () => {
    const user = userEvent.setup();
    const mockGetCurrentPosition = vi.fn();

    // Mock de geolocation
    Object.defineProperty(globalThis.navigator, 'geolocation', {
      value: { getCurrentPosition: mockGetCurrentPosition },
      writable: true,
    });

    render(<LocationForm {...defaultProps} />);

    const locationButton = screen.getByTitle('Utiliser ma position GPS');
    await user.click(locationButton);

    expect(mockGetCurrentPosition).toHaveBeenCalled();
  });
});
