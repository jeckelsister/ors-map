import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect } from 'vitest';
import Home from '../../src/pages/Home';

// Helper function to render components with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Home Page', () => {
  test('renders welcome message', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText('Welcome to ORS Map')).toBeInTheDocument();
    expect(screen.getByText(/A powerful route planning application/)).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByRole('link', { name: 'Open Map' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Learn More' })).toBeInTheDocument();
  });

  test('renders feature cards', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText('Interactive Mapping')).toBeInTheDocument();
    expect(screen.getByText('Fast Routing')).toBeInTheDocument();
    expect(screen.getByText('Detailed Analytics')).toBeInTheDocument();
  });

  test('navigation links have correct href attributes', () => {
    renderWithRouter(<Home />);
    
    const mapLink = screen.getByRole('link', { name: 'Open Map' });
    const aboutLink = screen.getByRole('link', { name: 'Learn More' });
    
    expect(mapLink).toHaveAttribute('href', '/map');
    expect(aboutLink).toHaveAttribute('href', '/about');
  });
});
