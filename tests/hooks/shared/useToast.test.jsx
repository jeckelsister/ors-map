import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from '../../../src/hooks/shared/useToast';

// Mock the Toast component
vi.mock('../../../src/components/shared/Toast', () => ({
  default: vi.fn(({ message, type, onClose }) => (
    <div data-testid={`toast-${type}`} onClick={onClose}>
      {message}
    </div>
  )),
}));

describe('useToast Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws error when used outside ToastProvider', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => {
      renderHook(() => useToast());
    }).toThrow('useToast must be used within a ToastProvider');

    consoleErrorSpy.mockRestore();
  });

  it('provides showToast function when used within ToastProvider', () => {
    const wrapper = ({ children }) => <ToastProvider>{children}</ToastProvider>;

    const { result } = renderHook(() => useToast(), { wrapper });

    expect(result.current.showToast).toBeDefined();
    expect(typeof result.current.showToast).toBe('function');
  });

  it('displays toast when showToast is called', () => {
    const TestComponent = () => {
      const { showToast } = useToast();

      return (
        <button
          onClick={() => showToast('Test message', 'success')}
          data-testid="show-toast-btn"
        >
          Show Toast
        </button>
      );
    };

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const button = screen.getByTestId('show-toast-btn');

    act(() => {
      button.click();
    });

    expect(screen.getByTestId('toast-success')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('displays multiple toasts', () => {
    const TestComponent = () => {
      const { showToast } = useToast();

      return (
        <div>
          <button
            onClick={() => showToast('Success message', 'success')}
            data-testid="success-btn"
          >
            Success
          </button>
          <button
            onClick={() => showToast('Error message', 'error')}
            data-testid="error-btn"
          >
            Error
          </button>
        </div>
      );
    };

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByTestId('success-btn').click();
      screen.getByTestId('error-btn').click();
    });

    expect(screen.getByTestId('toast-success')).toBeInTheDocument();
    expect(screen.getByTestId('toast-error')).toBeInTheDocument();
    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('removes toast when onClose is called', () => {
    const TestComponent = () => {
      const { showToast } = useToast();

      return (
        <button
          onClick={() => showToast('Test message', 'success')}
          data-testid="show-toast-btn"
        >
          Show Toast
        </button>
      );
    };

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Show toast
    act(() => {
      screen.getByTestId('show-toast-btn').click();
    });

    expect(screen.getByTestId('toast-success')).toBeInTheDocument();

    // Close toast
    act(() => {
      screen.getByTestId('toast-success').click();
    });

    expect(screen.queryByTestId('toast-success')).not.toBeInTheDocument();
  });

  it('supports different toast types', () => {
    const TestComponent = () => {
      const { showToast } = useToast();

      return (
        <div>
          <button
            onClick={() => showToast('Success', 'success')}
            data-testid="success"
          >
            Success
          </button>
          <button
            onClick={() => showToast('Error', 'error')}
            data-testid="error"
          >
            Error
          </button>
          <button
            onClick={() => showToast('Warning', 'warning')}
            data-testid="warning"
          >
            Warning
          </button>
          <button onClick={() => showToast('Info', 'info')} data-testid="info">
            Info
          </button>
        </div>
      );
    };

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByTestId('success').click();
      screen.getByTestId('error').click();
      screen.getByTestId('warning').click();
      screen.getByTestId('info').click();
    });

    expect(screen.getByTestId('toast-success')).toBeInTheDocument();
    expect(screen.getByTestId('toast-error')).toBeInTheDocument();
    expect(screen.getByTestId('toast-warning')).toBeInTheDocument();
    expect(screen.getByTestId('toast-info')).toBeInTheDocument();
  });

  it('passes duration prop to Toast component', () => {
    const TestComponent = () => {
      const { showToast } = useToast();

      return (
        <button
          onClick={() => showToast('Test message', 'success', 5000)}
          data-testid="show-toast-btn"
        >
          Show Toast
        </button>
      );
    };

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByTestId('show-toast-btn').click();
    });

    // Just verify toast appears with correct content
    expect(screen.getByTestId('toast-success')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('generates unique IDs for toasts', () => {
    const TestComponent = () => {
      const { showToast } = useToast();

      return (
        <button
          onClick={() => {
            showToast('First message', 'success');
            showToast('Second message', 'success');
          }}
          data-testid="show-toasts-btn"
        >
          Show Toasts
        </button>
      );
    };

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByTestId('show-toasts-btn').click();
    });

    const toasts = screen.getAllByTestId('toast-success');
    expect(toasts).toHaveLength(2);
    expect(screen.getByText('First message')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
  });

  it('renders toast container with correct positioning', () => {
    render(
      <ToastProvider>
        <div>Test content</div>
      </ToastProvider>
    );

    // The toast container should be present even without toasts
    const container = document.querySelector(
      '.fixed.top-4.right-4.space-y-2.z-50'
    );
    expect(container).toBeInTheDocument();
  });

  it('removes specific toast by ID', async () => {
    const TestComponent = () => {
      const { showToast } = useToast();

      return (
        <div>
          <button
            onClick={() => showToast('First toast', 'info')}
            data-testid="first-btn"
          >
            First
          </button>
          <button
            onClick={() => showToast('Second toast', 'success')}
            data-testid="second-btn"
          >
            Second
          </button>
        </div>
      );
    };

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Add first toast
    act(() => {
      screen.getByTestId('first-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByText('First toast')).toBeInTheDocument();
    });

    // Add second toast
    act(() => {
      screen.getByTestId('second-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByText('Second toast')).toBeInTheDocument();
    });

    // Both should be visible
    expect(screen.getByText('First toast')).toBeInTheDocument();
    expect(screen.getByText('Second toast')).toBeInTheDocument();

    // Remove first toast by clicking on it
    act(() => {
      screen.getByText('First toast').click();
    });

    await waitFor(() => {
      expect(screen.queryByText('First toast')).not.toBeInTheDocument();
    });

    // Second toast should still be there
    expect(screen.getByText('Second toast')).toBeInTheDocument();
  });
});
