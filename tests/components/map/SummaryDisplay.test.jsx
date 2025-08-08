import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SummaryDisplay from '../../../src/components/map/SummaryDisplay';

describe('SummaryDisplay Component', () => {
  const mockSummary = {
    distance: '5.2 km',
    duration: '1h 15min',
    ascent: 150,
    descent: 120,
  };

  it('renders nothing when no summary and no error', () => {
    const { container } = render(
      <SummaryDisplay summary={null} error={null} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('displays error message when error is provided', () => {
    const errorMessage = 'Unable to calculate route';
    render(<SummaryDisplay summary={null} error={errorMessage} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(`⚠️ ${errorMessage}`)).toBeInTheDocument();
  });

  it('displays summary when summary data is provided', () => {
    render(<SummaryDisplay summary={mockSummary} error={null} />);

    expect(
      screen.getByRole('region', { name: "Résumé de l'itinéraire" })
    ).toBeInTheDocument();
    expect(screen.getByText("📊 Résumé de l'itinéraire")).toBeInTheDocument();
  });

  it('displays all summary items correctly', () => {
    render(<SummaryDisplay summary={mockSummary} error={null} />);

    // Check distance
    expect(screen.getByText('Distance :')).toBeInTheDocument();
    expect(screen.getByText('5.2 km')).toBeInTheDocument();

    // Check duration
    expect(screen.getByText('Durée estimée :')).toBeInTheDocument();
    expect(screen.getByText('1h 15min')).toBeInTheDocument();

    // Check ascent
    expect(screen.getByText('Dénivelé positif :')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();

    // Check descent
    expect(screen.getByText('Dénivelé négatif :')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();

    // Check meter units (there are multiple 'm' elements)
    const meterUnits = screen.getAllByText('m');
    expect(meterUnits.length).toBeGreaterThanOrEqual(2);
  });

  it('handles missing ascent and descent data', () => {
    const summaryWithoutElevation = {
      distance: '3.1 km',
      duration: '45min',
      ascent: null,
      descent: null,
    };

    render(<SummaryDisplay summary={summaryWithoutElevation} error={null} />);

    expect(screen.getByText('Distance :')).toBeInTheDocument();
    expect(screen.getByText('3.1 km')).toBeInTheDocument();
    expect(screen.getByText('Durée estimée :')).toBeInTheDocument();
    expect(screen.getByText('45min')).toBeInTheDocument();

    // Should show N/A for missing elevation data
    const naElements = screen.getAllByText('N/A');
    expect(naElements).toHaveLength(2); // One for ascent, one for descent
  });

  it('displays correct icons for each summary item', () => {
    render(<SummaryDisplay summary={mockSummary} error={null} />);

    // Check that emoji icons are present (they are aria-hidden)
    expect(screen.getByText('📏')).toBeInTheDocument(); // Distance
    expect(screen.getByText('⏱️')).toBeInTheDocument(); // Duration
    expect(screen.getByText('📈')).toBeInTheDocument(); // Ascent
    expect(screen.getByText('📉')).toBeInTheDocument(); // Descent
  });

  it('prioritizes error over summary when both are provided', () => {
    const errorMessage = 'Route calculation failed';
    render(<SummaryDisplay summary={mockSummary} error={errorMessage} />);

    // Should show error, not summary
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(`⚠️ ${errorMessage}`)).toBeInTheDocument();

    // Should not show summary
    expect(
      screen.queryByText("📊 Résumé de l'itinéraire")
    ).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<SummaryDisplay summary={mockSummary} error={null} />);

    const summaryContainer = screen.getByRole('region');
    expect(summaryContainer).toHaveAttribute(
      'aria-label',
      "Résumé de l'itinéraire"
    );
  });

  it('has proper error accessibility attributes', () => {
    const errorMessage = 'Test error';
    render(<SummaryDisplay summary={null} error={errorMessage} />);

    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toHaveAttribute('aria-live', 'polite');
  });

  it('handles zero values correctly', () => {
    const summaryWithZeros = {
      distance: '0 km',
      duration: '0min',
      ascent: 0,
      descent: 0,
    };

    render(<SummaryDisplay summary={summaryWithZeros} error={null} />);

    expect(screen.getByText('0 km')).toBeInTheDocument();
    expect(screen.getByText('0min')).toBeInTheDocument();

    // Should show 0 with unit for zero elevation values
    const zeroValues = screen.getAllByText('0');
    expect(zeroValues.length).toBeGreaterThanOrEqual(2);
  });
});
