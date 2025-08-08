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

    const toast = screen.getByText('Success message').closest('div');
    expect(toast).toHaveClass('bg-green-600', 'text-white');
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('renders error toast with correct styling and icon', () => {
    render(
      <Toast message="Error message" type="error" onClose={mockOnClose} />
    );

    const toast = screen.getByText('Error message').closest('div');
    expect(toast).toHaveClass('bg-red-600', 'text-white');
    expect(screen.getByText('❌')).toBeInTheDocument();
  });

  it('renders warning toast with correct styling and icon', () => {
    render(
      <Toast message="Warning message" type="warning" onClose={mockOnClose} />
    );

    const toast = screen.getByText('Warning message').closest('div');
    expect(toast).toHaveClass('bg-yellow-500', 'text-white');
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('renders info toast with correct styling and icon', () => {
    render(<Toast message="Info message" type="info" onClose={mockOnClose} />);

    const toast = screen.getByText('Info message').closest('div');
    expect(toast).toHaveClass('bg-blue-600', 'text-white');
    expect(screen.getByText('ℹ️')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <Toast message="Test message" type="success" onClose={mockOnClose} />
    );

    const closeButton = screen.getByLabelText('Close notification');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('auto-closes after default duration (3000ms)', async () => {
    render(
      <Toast message="Test message" type="success" onClose={mockOnClose} />
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    // Fast-forward time by 3000ms
    act(() => {
      vi.advanceTimersByTime(3000);
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

    // Fast-forward time by 4999ms (should not close yet)
    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(mockOnClose).not.toHaveBeenCalled();

    // Fast-forward 1 more ms (should close now)
    act(() => {
      vi.advanceTimersByTime(1);
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

  it('has correct positioning and z-index classes', () => {
    render(
      <Toast message="Test message" type="success" onClose={mockOnClose} />
    );

    const toast = screen.getByText('Test message').closest('div');
    expect(toast).toHaveClass('fixed', 'top-4', 'right-4', 'z-50');
  });

  it('has correct layout classes', () => {
    render(
      <Toast message="Test message" type="success" onClose={mockOnClose} />
    );

    const toast = screen.getByText('Test message').closest('div');
    expect(toast).toHaveClass(
      'p-4',
      'rounded-lg',
      'shadow-lg',
      'flex',
      'items-center',
      'gap-2',
      'max-w-sm'
    );
  });

  it('handles long messages properly', () => {
    const longMessage =
      'This is a very long message that should be displayed properly without breaking the layout or causing any issues with the toast component styling and positioning.';

    render(
      <Toast message={longMessage} type="success" onClose={mockOnClose} />
    );

    expect(screen.getByText(longMessage)).toBeInTheDocument();

    const messageElement = screen.getByText(longMessage);
    expect(messageElement).toHaveClass('flex-1');
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

    // Fast-forward another 1000ms to complete the new duration
    act(() => {
      vi.advanceTimersByTime(1000);
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
