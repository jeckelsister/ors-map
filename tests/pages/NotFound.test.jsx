import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import NotFound from '../../src/pages/NotFound';

// Helper function to render components with router
const renderWithRouter = component => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('NotFound Page', () => {
  test('renders 404 error message', () => {
    renderWithRouter(<NotFound />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  test('renders helpful error message', () => {
    renderWithRouter(<NotFound />);

    expect(
      screen.getByText(/Sorry, we couldn't find the page/)
    ).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    const homeLink = screen.getByRole('link', { name: 'Go Home' });
    const hikingLink = screen.getByRole('link', {
      name: 'Planificateur Randonnée',
    });

    expect(homeLink).toHaveAttribute('href', '/');
    expect(hikingLink).toHaveAttribute('href', '/hiking');
  });
});
