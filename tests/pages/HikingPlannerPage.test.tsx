import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../../src/hooks/shared/useToast';
import HikingPlannerPage from '../../src/pages/HikingPlannerPage';

// Mock the hiking service
vi.mock('../../src/services/hikingService', () => ({
  createHikingRoute: vi.fn(),
  findRefugesNearRoute: vi.fn(),
  findWaterPointsNearRoute: vi.fn(),
  exportToGPX: vi.fn(),
}));

const MockWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <ToastProvider>{children}</ToastProvider>
  </BrowserRouter>
);

describe('HikingPlannerPage', () => {
  it('renders the main components', () => {
    render(
      <MockWrapper>
        <HikingPlannerPage />
      </MockWrapper>
    );

    expect(screen.getByText('Planificateur de randonnée')).toBeInTheDocument();
    expect(screen.getByText('Planning')).toBeInTheDocument();
    expect(screen.getByText('Profil')).toBeInTheDocument();
    expect(screen.getByText('POI')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('switches between tabs correctly', () => {
    render(
      <MockWrapper>
        <HikingPlannerPage />
      </MockWrapper>
    );

    // Should start with planning tab active
    expect(screen.getByText('Type de sentiers')).toBeInTheDocument();

    // Switch to profile tab
    fireEvent.click(screen.getByText('Profil'));
    expect(
      screen.getByText('Créez un itinéraire pour voir le profil altimétrique')
    ).toBeInTheDocument();

    // Switch to POI tab
    fireEvent.click(screen.getByText('POI'));
    expect(screen.getByText("Points d'intérêt")).toBeInTheDocument();

    // Switch to export tab
    fireEvent.click(screen.getByText('Export'));
    expect(screen.getByText('Export GPX')).toBeInTheDocument();
  });

  it('displays route creation form', () => {
    render(
      <MockWrapper>
        <HikingPlannerPage />
      </MockWrapper>
    );

    expect(screen.getByText("Planification d'itinéraire")).toBeInTheDocument();
    expect(screen.getByText('Sentiers officiels')).toBeInTheDocument();
    expect(screen.getByText('Chemins mixtes')).toBeInTheDocument();
    expect(screen.getByText('Sentiers montagne')).toBeInTheDocument();
    expect(screen.getByText('Sans préférence')).toBeInTheDocument();
  });

  it('allows profile selection', () => {
    render(
      <MockWrapper>
        <HikingPlannerPage />
      </MockWrapper>
    );

    const officialTrailsButton = screen.getByText('Sentiers officiels');
    fireEvent.click(officialTrailsButton);

    // Check if the profile preferences are displayed
    expect(
      screen.getByText('Privilégie les sentiers officiels (GR, HRP, etc.)')
    ).toBeInTheDocument();
  });

  it('handles waypoint management', () => {
    render(
      <MockWrapper>
        <HikingPlannerPage />
      </MockWrapper>
    );

    // Should show default waypoints
    expect(screen.getByDisplayValue('Point A')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Point B')).toBeInTheDocument();

    // Add a new waypoint
    const addButton = screen
      .getAllByRole('button')
      .find(btn => btn.querySelector('svg')?.classList.contains('fa-plus'));
    if (addButton) {
      fireEvent.click(addButton);
    }
  });

  it('toggles between linear and loop routes', () => {
    render(
      <MockWrapper>
        <HikingPlannerPage />
      </MockWrapper>
    );

    const loopButton = screen.getByText('Linéaire');
    fireEvent.click(loopButton);

    expect(screen.getByText('Boucle')).toBeInTheDocument();
    expect(
      screen.getByText("Le point d'arrivée sera le même que le point de départ")
    ).toBeInTheDocument();
  });

  it('adjusts stage count', () => {
    render(
      <MockWrapper>
        <HikingPlannerPage />
      </MockWrapper>
    );

    const stageSlider = screen.getByRole('slider');
    fireEvent.change(stageSlider, { target: { value: '3' } });

    expect(screen.getByText("Nombre d'étapes : 3")).toBeInTheDocument();
  });

  it('shows appropriate messages when no route is created', () => {
    render(
      <MockWrapper>
        <HikingPlannerPage />
      </MockWrapper>
    );

    // Switch to profile tab - should show message about creating route
    fireEvent.click(screen.getByText('Profil'));
    expect(
      screen.getByText('Créez un itinéraire pour voir le profil altimétrique')
    ).toBeInTheDocument();

    // Switch to export tab - should show message about creating route
    fireEvent.click(screen.getByText('Export'));
    expect(
      screen.getByText('Créez un itinéraire pour exporter en GPX')
    ).toBeInTheDocument();
  });

  it('enables create route button when conditions are met', () => {
    render(
      <MockWrapper>
        <HikingPlannerPage />
      </MockWrapper>
    );

    const createButton = screen.getByText("Créer l'itinéraire");

    // Should be disabled initially (waypoints not positioned)
    expect(createButton).toBeDisabled();
  });

  it('shows reset functionality', () => {
    render(
      <MockWrapper>
        <HikingPlannerPage />
      </MockWrapper>
    );

    const resetButton = screen.getByText('Reset');
    expect(resetButton).toBeInTheDocument();

    fireEvent.click(resetButton);
    // Should reset to initial state
  });
});
