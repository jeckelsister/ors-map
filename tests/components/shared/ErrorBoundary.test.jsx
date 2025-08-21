import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ErrorBoundary from '../../../src/components/shared/ErrorBoundary';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false, errorMessage = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div>Normal component</div>;
};

// Mock window.location.reload
const mockReload = vi.fn();
Object.defineProperty(window, 'location', {
  value: {
    reload: mockReload,
  },
  writable: true,
});

describe('ErrorBoundary Component', () => {
  let consoleErrorSpy;
  let originalNodeEnv;

  beforeEach(() => {
    // Mock console.error to avoid noise in test output
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    originalNodeEnv = process.env.NODE_ENV;
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when a child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('⚠️')).toBeInTheDocument();
    expect(
      screen.getByText("Oops! Quelque chose s'est mal passé")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Nous sommes désolés pour la gêne occasionnée. Veuillez essayer de rafraîchir la page.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('🔄 Rafraîchir la page')).toBeInTheDocument();
  });

  it('calls window.location.reload when refresh button is clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const refreshButton = screen.getByText('🔄 Rafraîchir la page');
    fireEvent.click(refreshButton);

    expect(mockReload).toHaveBeenCalled();
  });

  it('logs error and error info to console', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Test error message" />
      </ErrorBoundary>
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      'Test error message'
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error stack:',
      expect.any(String)
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error info:',
      expect.any(Object)
    );
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(
      screen.queryByText("Oops! Quelque chose s'est mal passé")
    ).not.toBeInTheDocument();
  });

  it('shows error details in development mode', () => {
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Development error" />
      </ErrorBoundary>
    );

    expect(
      screen.getByText("Détails de l'erreur (Développement uniquement)")
    ).toBeInTheDocument();

    // Click to expand details
    const detailsToggle = screen.getByText(
      "Détails de l'erreur (Développement uniquement)"
    );
    fireEvent.click(detailsToggle);

    // Should show error stack
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('does not show error details in production mode', () => {
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(
      screen.queryByText('Error Details (Development Only)')
    ).not.toBeInTheDocument();
  });

  it('maintains error state after re-render', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(
      screen.getByText("Oops! Quelque chose s'est mal passé")
    ).toBeInTheDocument();

    // Re-render with no error - should still show error UI
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(
      screen.getByText("Oops! Quelque chose s'est mal passé")
    ).toBeInTheDocument();
  });

  it('resets error state when new error occurs', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="First error" />
      </ErrorBoundary>
    );

    expect(
      screen.getByText("Oops! Quelque chose s'est mal passé")
    ).toBeInTheDocument();

    // New error should update the error state
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Second error" />
      </ErrorBoundary>
    );

    expect(
      screen.getByText("Oops! Quelque chose s'est mal passé")
    ).toBeInTheDocument();
  });

  it('has proper styling classes', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Find the outermost container with the styling classes
    const outerContainer = screen
      .getByText("Oops! Quelque chose s'est mal passé")
      .closest('.min-h-screen');
    expect(outerContainer).toHaveClass(
      'min-h-screen',
      'bg-gradient-to-br',
      'from-emerald-400',
      'via-teal-500',
      'to-green-600',
      'flex',
      'items-center',
      'justify-center'
    );

    const refreshButton = screen.getByText('🔄 Rafraîchir la page');
    expect(refreshButton).toHaveClass(
      'bg-emerald-600',
      'hover:bg-emerald-700',
      'text-white'
    );
  });

  it('handles errors without error messages', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="" />
      </ErrorBoundary>
    );

    expect(
      screen.getByText("Oops! Quelque chose s'est mal passé")
    ).toBeInTheDocument();
  });

  it('static getDerivedStateFromError returns correct state', () => {
    const testError = new Error('Test error');
    const result = ErrorBoundary.getDerivedStateFromError(testError);

    expect(result).toEqual({
      hasError: true,
      error: testError,
    });
  });
});
