import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect } from 'vitest';
import NotFound from '../../src/pages/NotFound';

// Helper function to render components with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('NotFound Page', () => {
  test('renders 404 error message', () => {
    renderWithRouter(<NotFound />);
    
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  test('renders helpful error message', () => {
    renderWithRouter(<NotFound />);
    
    expect(screen.getByText(/Sorry, we couldn't find the page/)).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    renderWithRouter(<NotFound />);
    
    const homeLink = screen.getByRole('link', { name: 'Go Home' });
    const mapLink = screen.getByRole('link', { name: 'Open Map' });
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(mapLink).toHaveAttribute('href', '/map');
  });
});
