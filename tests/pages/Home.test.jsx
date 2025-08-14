import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import Home from '../../src/pages/Home';

// Helper function to render components with router
const renderWithRouter = component => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Home Page', () => {
  test('renders welcome message', () => {
    renderWithRouter(<Home />);

    expect(screen.getByText('WayMaker')).toBeInTheDocument();
    expect(
      screen.getByText(/Planifiez vos randonnées avec profil altimétrique et export GPX/)
    ).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    renderWithRouter(<Home />);

    expect(screen.getByRole('link', { name: '🥾 Planificateur Randonnée' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Carte Simple' })).toBeInTheDocument();
  });

  test('renders feature cards', () => {
    renderWithRouter(<Home />);

    expect(screen.getByText('Randonnée Avancée')).toBeInTheDocument();
    expect(screen.getByText('Profil Altimétrique')).toBeInTheDocument();
    expect(screen.getByText('Refuges & Points d\'eau')).toBeInTheDocument();
    expect(screen.getByText('Export GPX')).toBeInTheDocument();
  });

  test('navigation links have correct href attributes', () => {
    renderWithRouter(<Home />);

    const mapLink = screen.getByRole('link', { name: 'Carte Simple' });
    const hikingLink = screen.getByRole('link', { name: '🥾 Planificateur Randonnée' });

    expect(mapLink).toHaveAttribute('href', '/map');
    expect(hikingLink).toHaveAttribute('href', '/hiking');
  });
});
