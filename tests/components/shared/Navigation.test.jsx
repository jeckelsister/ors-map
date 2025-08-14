import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import Navigation from '../../../src/components/shared/Navigation';

// Helper function to render components with router
const renderWithRouter = (component, initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>{component}</MemoryRouter>
  );
};

describe('Navigation Component', () => {
  test('renders all navigation links', () => {
    renderWithRouter(<Navigation />);

    expect(screen.getByText('WayMaker')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Map' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '🥾 Randonnée' })).toBeInTheDocument();
  });

  test('highlights active home link', () => {
    renderWithRouter(<Navigation />, ['/']);

    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveClass('text-blue-600');
    expect(homeLink).toHaveClass('bg-blue-50');
  });

  test('highlights active map link', () => {
    renderWithRouter(<Navigation />, ['/map']);

    const mapLink = screen.getByRole('link', { name: 'Map' });
    expect(mapLink).toHaveClass('text-blue-600');
    expect(mapLink).toHaveClass('bg-blue-50');
  });

  test('highlights active hiking link', () => {
    renderWithRouter(<Navigation />, ['/hiking']);

    const hikingLink = screen.getByRole('link', { name: '🥾 Randonnée' });
    expect(hikingLink).toHaveClass('text-blue-600');
    expect(hikingLink).toHaveClass('bg-blue-50');
  });

  test('navigation links have correct href attributes', () => {
    renderWithRouter(<Navigation />);

    expect(screen.getByRole('link', { name: /WayMaker/ })).toHaveAttribute(
      'href',
      '/'
    );
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/'
    );
    expect(screen.getByRole('link', { name: 'Map' })).toHaveAttribute(
      'href',
      '/map'
    );
    expect(screen.getByRole('link', { name: '🥾 Randonnée' })).toHaveAttribute(
      'href',
      '/hiking'
    );
  });
});
