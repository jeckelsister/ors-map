import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect } from 'vitest';
import About from '../../src/pages/About';

// Helper function to render components with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('About Page', () => {
  test('renders about heading', () => {
    renderWithRouter(<About />);
    
    expect(screen.getByText('About ORS Map')).toBeInTheDocument();
  });

  test('renders feature list', () => {
    renderWithRouter(<About />);
    
    expect(screen.getByText(/Multiple transport modes/)).toBeInTheDocument();
    expect(screen.getByText(/Real-time route calculation/)).toBeInTheDocument();
    expect(screen.getByText(/Interactive map with multiple layers/)).toBeInTheDocument();
  });

  test('renders technology stack', () => {
    renderWithRouter(<About />);
    
    expect(screen.getByText(/React 19 with modern hooks/)).toBeInTheDocument();
    expect(screen.getByText(/Leaflet for interactive mapping/)).toBeInTheDocument();
    expect(screen.getByText(/Tailwind CSS for styling/)).toBeInTheDocument();
  });

  test('contains link to map page', () => {
    renderWithRouter(<About />);
    
    const mapLink = screen.getByRole('link', { name: 'map page' });
    expect(mapLink).toHaveAttribute('href', '/map');
  });
});
