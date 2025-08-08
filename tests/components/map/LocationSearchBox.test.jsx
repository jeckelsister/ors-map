import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LocationSearchBox from '../../../src/components/map/LocationSearchBox';

// Mock the Button component
vi.mock('../../../src/ui/Button', () => ({
  default: vi.fn(({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  )),
}));

// Mock react-icons
vi.mock('react-icons/fa', () => ({
  FaSearchLocation: () => <span data-testid="search-icon">🔍</span>,
}));

describe('LocationSearchBox Component', () => {
  const mockProps = {
    query: '',
    onQueryChange: vi.fn(),
    suggestions: [],
    onSuggestionSelect: vi.fn(),
    onSearchClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default placeholder', () => {
    render(<LocationSearchBox {...mockProps} />);

    expect(
      screen.getByPlaceholderText('Rechercher un lieu...')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Recherche de lieu')).toBeInTheDocument();
    expect(screen.getByLabelText('Lancer la recherche')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(
      <LocationSearchBox {...mockProps} placeholder="Chercher une adresse..." />
    );

    expect(
      screen.getByPlaceholderText('Chercher une adresse...')
    ).toBeInTheDocument();
  });

  it('displays current query value', () => {
    render(<LocationSearchBox {...mockProps} query="Paris" />);

    const input = screen.getByLabelText('Recherche de lieu');
    expect(input).toHaveValue('Paris');
  });

  it('calls onQueryChange when input value changes', () => {
    render(<LocationSearchBox {...mockProps} />);

    const input = screen.getByLabelText('Recherche de lieu');
    fireEvent.change(input, { target: { value: 'Lyon' } });

    expect(mockProps.onQueryChange).toHaveBeenCalledWith('Lyon');
  });

  it('calls onSearchClick when search button is clicked with valid query', async () => {
    render(<LocationSearchBox {...mockProps} query="Paris" />);

    const searchButton = screen.getByLabelText('Lancer la recherche');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockProps.onSearchClick).toHaveBeenCalled();
    });
  });

  it('does not call onSearchClick when query is too short', async () => {
    render(<LocationSearchBox {...mockProps} query="Pa" />);

    const searchButton = screen.getByLabelText('Lancer la recherche');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockProps.onSearchClick).not.toHaveBeenCalled();
    });
  });

  it('does not display suggestions when list is empty', () => {
    render(<LocationSearchBox {...mockProps} suggestions={[]} />);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('displays suggestions when provided', () => {
    const suggestions = [
      {
        place_id: '1',
        display_name: 'Paris, France',
        lat: '48.8566',
        lon: '2.3522',
      },
      {
        place_id: '2',
        display_name: 'Lyon, France',
        lat: '45.7640',
        lon: '4.8357',
      },
    ];

    render(<LocationSearchBox {...mockProps} suggestions={suggestions} />);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByLabelText('Suggestions de lieux')).toBeInTheDocument();
    expect(screen.getByText('Paris, France')).toBeInTheDocument();
    expect(screen.getByText('Lyon, France')).toBeInTheDocument();
  });

  it('calls onSuggestionSelect when suggestion is clicked', () => {
    const suggestions = [
      {
        place_id: '1',
        display_name: 'Paris, France',
        lat: '48.8566',
        lon: '2.3522',
      },
    ];

    render(<LocationSearchBox {...mockProps} suggestions={suggestions} />);

    const suggestion = screen.getByText('Paris, France');
    fireEvent.click(suggestion);

    expect(mockProps.onSuggestionSelect).toHaveBeenCalledWith(suggestions[0]);
  });

  it('renders search icons', () => {
    render(<LocationSearchBox {...mockProps} />);

    const icons = screen.getAllByTestId('search-icon');
    expect(icons).toHaveLength(2); // One in input area, one in button
  });

  it('has proper accessibility attributes for suggestions', () => {
    const suggestions = [
      {
        place_id: '1',
        display_name: 'Paris, France',
        lat: '48.8566',
        lon: '2.3522',
      },
    ];

    render(<LocationSearchBox {...mockProps} suggestions={suggestions} />);

    const listbox = screen.getByRole('listbox');
    expect(listbox).toHaveAttribute('aria-label', 'Suggestions de lieux');

    const option = screen.getByRole('option');
    expect(option).toBeInTheDocument();
  });

  it('handles async onSearchClick correctly', async () => {
    const asyncOnSearchClick = vi.fn().mockResolvedValue(undefined);

    render(
      <LocationSearchBox
        {...mockProps}
        query="Paris"
        onSearchClick={asyncOnSearchClick}
      />
    );

    const searchButton = screen.getByLabelText('Lancer la recherche');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(asyncOnSearchClick).toHaveBeenCalled();
    });
  });

  it('generates unique keys for suggestions', () => {
    const suggestions = [
      {
        place_id: '1',
        display_name: 'Paris, France',
        lat: '48.8566',
        lon: '2.3522',
      },
      {
        place_id: '2',
        display_name: 'Paris, Texas, USA',
        lat: '33.6617',
        lon: '-95.5555',
      },
    ];

    render(<LocationSearchBox {...mockProps} suggestions={suggestions} />);

    // Both suggestions should be rendered even though they have similar names
    expect(screen.getByText('Paris, France')).toBeInTheDocument();
    expect(screen.getByText('Paris, Texas, USA')).toBeInTheDocument();
  });
});
