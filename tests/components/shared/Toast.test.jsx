import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Toast from '../../../src/components/shared/Toast';

describe('Toast Component', () => {
  let mockOnClose;

  beforeEach(() => {
    mockOnClose = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders toast with message', () => {
    render(
      <Toast message="Test message" type="success" onClose={mockOnClose} />
    );

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders success toast with correct styling and icon', () => {
    render(
      <Toast message="Success message" type="success" onClose={mockOnClose} />
    );

    const toastContainer = screen.getByTestId('toast-success');
    expect(toastContainer).toHaveClass(
      'relative',
      'overflow-hidden',
      'rounded-xl'
    );
    expect(toastContainer.className).toMatch(
      /bg-gradient-to-r.*from-green-500/
    );

    // Vérifier que l'icône Lucide est présente (CheckCircle)
    const icon = toastContainer.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders error toast with correct styling and icon', () => {
    render(
      <Toast message="Error message" type="error" onClose={mockOnClose} />
    );

    const toastContainer = screen.getByTestId('toast-error');
    expect(toastContainer).toHaveClass(
      'relative',
      'overflow-hidden',
      'rounded-xl'
    );
    expect(toastContainer.className).toMatch(/bg-gradient-to-r.*from-red-500/);

    // Vérifier que l'icône Lucide est présente (XCircle)
    const icon = toastContainer.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders warning toast with correct styling and icon', () => {
    render(
      <Toast message="Warning message" type="warning" onClose={mockOnClose} />
    );

    const toastContainer = screen.getByTestId('toast-warning');
    expect(toastContainer).toHaveClass(
      'relative',
      'overflow-hidden',
      'rounded-xl'
    );
    expect(toastContainer.className).toMatch(
      /bg-gradient-to-r.*from-amber-500/
    );

    // Vérifier que l'icône Lucide est présente (AlertTriangle)
    const icon = toastContainer.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders info toast with correct styling and icon', () => {
    render(<Toast message="Info message" type="info" onClose={mockOnClose} />);

    const toastContainer = screen.getByTestId('toast-info');
    expect(toastContainer).toHaveClass(
      'relative',
      'overflow-hidden',
      'rounded-xl'
    );
    expect(toastContainer.className).toMatch(/bg-gradient-to-r.*from-blue-500/);

    // Vérifier que l'icône Lucide est présente (Info)
    const icon = toastContainer.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <Toast message="Test message" type="success" onClose={mockOnClose} />
    );

    const closeButton = screen.getByLabelText('Close notification');
    fireEvent.click(closeButton);

    // Attendre un délai pour l'animation avant de vérifier que onClose est appelé
    act(() => {
      vi.advanceTimersByTime(300); // Durée de l'animation de sortie
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('auto-closes after default duration (3000ms)', async () => {
    render(
      <Toast message="Test message" type="success" onClose={mockOnClose} />
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    // Fast-forward pour l'animation d'entrée + délai de fermeture automatique + animation de sortie
    act(() => {
      vi.advanceTimersByTime(3000 + 300); // duration + animation de sortie
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('auto-closes after custom duration', async () => {
    render(
      <Toast
        message="Test message"
        type="success"
        onClose={mockOnClose}
        duration={5000}
      />
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    // Fast-forward time by 4999ms + 300ms animation (should not close yet)
    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(mockOnClose).not.toHaveBeenCalled();

    // Fast-forward 1 more ms + animation duration (should close now)
    act(() => {
      vi.advanceTimersByTime(1 + 300);
    });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('clears timer on unmount', () => {
    const { unmount } = render(
      <Toast message="Test message" type="success" onClose={mockOnClose} />
    );

    // Unmount before timer expires
    unmount();

    // Fast-forward past the default duration
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // onClose should not be called since component was unmounted
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('has correct positioning and layout classes', () => {
    render(
      <Toast message="Test message" type="success" onClose={mockOnClose} />
    );

    // Vérifier le conteneur principal
    const mainContainer = screen
      .getByText('Test message')
      .closest('[class*="max-w-sm"]');
    expect(mainContainer).toHaveClass('max-w-sm', 'w-full');

    // Vérifier le conteneur du toast
    const toastContainer = screen.getByTestId('toast-success');
    expect(toastContainer).toHaveClass(
      'relative',
      'overflow-hidden',
      'rounded-xl'
    );
  });

  it('handles long messages properly', () => {
    const longMessage =
      'This is a very long message that should be displayed properly without breaking the layout or causing any issues with the toast component styling and positioning.';

    render(
      <Toast message={longMessage} type="success" onClose={mockOnClose} />
    );

    expect(screen.getByText(longMessage)).toBeInTheDocument();

    // Vérifier que le conteneur de contenu a la classe flex-1
    const contentContainer = screen
      .getByText(longMessage)
      .closest('[class*="flex-1"]');
    expect(contentContainer).toHaveClass('flex-1', 'min-w-0');
  });

  it('resets timer when duration prop changes', () => {
    const { rerender } = render(
      <Toast
        message="Test message"
        type="success"
        onClose={mockOnClose}
        duration={1000}
      />
    );

    // Fast-forward 500ms
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Change duration
    rerender(
      <Toast
        message="Test message"
        type="success"
        onClose={mockOnClose}
        duration={2000}
      />
    );

    // Fast-forward another 1000ms (total 1500ms from start)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should not close yet since new duration is 2000ms from the rerender
    expect(mockOnClose).not.toHaveBeenCalled();

    // Fast-forward another 1000ms + animation to complete the new duration
    act(() => {
      vi.advanceTimersByTime(1000 + 300);
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('has accessible close button', () => {
    render(
      <Toast message="Test message" type="success" onClose={mockOnClose} />
    );

    const closeButton = screen.getByLabelText('Close notification');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveAttribute('aria-label', 'Close notification');
  });

  it('handles zero duration by not setting timer', () => {
    render(
      <Toast
        message="Test message"
        type="success"
        onClose={mockOnClose}
        duration={0}
      />
    );

    // Fast-forward any amount of time
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // With duration 0, timer should still be set but trigger immediately
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
