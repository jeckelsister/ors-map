import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MapPage from '@/pages/MapPage';

// Mock the Map component
vi.mock('@/components/map/Map', () => ({
  default: () => <div data-testid="map-component">Map Component</div>,
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('MapPage', () => {
  it('should render without crashing', () => {
    renderWithRouter(<MapPage />);
    
    expect(screen.getByTestId('map-component')).toBeInTheDocument();
  });

  it('should render the Map component', () => {
    renderWithRouter(<MapPage />);
    
    const mapComponent = screen.getByTestId('map-component');
    expect(mapComponent).toBeInTheDocument();
    expect(mapComponent).toHaveTextContent('Map Component');
  });
});
