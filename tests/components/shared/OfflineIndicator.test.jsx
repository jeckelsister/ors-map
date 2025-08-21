import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OfflineIndicator from '../../../src/components/shared/OfflineIndicator';
import { useOnlineStatus } from '../../../src/hooks/shared/useOnlineStatus';

// Mock the hook
vi.mock('../../../src/hooks/shared/useOnlineStatus', () => ({
  useOnlineStatus: vi.fn(),
}));

describe('OfflineIndicator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when online', () => {
    vi.mocked(useOnlineStatus).mockReturnValue(true);

    const { container } = render(<OfflineIndicator />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders offline indicator when offline', () => {
    vi.mocked(useOnlineStatus).mockReturnValue(false);

    render(<OfflineIndicator />);

    expect(
      screen.getByText('⚠️ You are currently offline')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Some features may not be available')
    ).toBeInTheDocument();
  });

  it('has correct styling when offline', () => {
    vi.mocked(useOnlineStatus).mockReturnValue(false);

    render(<OfflineIndicator />);

    const indicator = screen
      .getByText('⚠️ You are currently offline')
      .closest('div');
    expect(indicator).toHaveClass(
      'fixed',
      'top-0',
      'left-0',
      'right-0',
      'bg-red-600',
      'text-white',
      'text-center',
      'py-2',
      'z-50'
    );
  });

  it('displays warning icon and message with correct styling', () => {
    vi.mocked(useOnlineStatus).mockReturnValue(false);

    render(<OfflineIndicator />);

    const mainMessage = screen.getByText('⚠️ You are currently offline');
    expect(mainMessage).toHaveClass('font-medium');

    const subMessage = screen.getByText('Some features may not be available');
    expect(subMessage).toHaveClass('ml-2', 'text-sm');
  });

  it('switches between online and offline states correctly', () => {
    // Start online
    vi.mocked(useOnlineStatus).mockReturnValue(true);
    const { rerender } = render(<OfflineIndicator />);

    expect(
      screen.queryByText('⚠️ You are currently offline')
    ).not.toBeInTheDocument();

    // Go offline
    vi.mocked(useOnlineStatus).mockReturnValue(false);
    rerender(<OfflineIndicator />);

    expect(
      screen.getByText('⚠️ You are currently offline')
    ).toBeInTheDocument();

    // Go back online
    vi.mocked(useOnlineStatus).mockReturnValue(true);
    rerender(<OfflineIndicator />);

    expect(
      screen.queryByText('⚠️ You are currently offline')
    ).not.toBeInTheDocument();
  });

  it('calls useOnlineStatus hook', () => {
    vi.mocked(useOnlineStatus).mockReturnValue(true);

    render(<OfflineIndicator />);

    expect(useOnlineStatus).toHaveBeenCalledTimes(1);
  });

  it('has proper z-index for overlay positioning', () => {
    vi.mocked(useOnlineStatus).mockReturnValue(false);

    render(<OfflineIndicator />);

    const indicator = screen
      .getByText('⚠️ You are currently offline')
      .closest('div');
    expect(indicator).toHaveClass('z-50');
  });

  it('displays both main and secondary messages', () => {
    vi.mocked(useOnlineStatus).mockReturnValue(false);

    render(<OfflineIndicator />);

    // Both parts of the message should be present
    expect(
      screen.getByText('⚠️ You are currently offline')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Some features may not be available')
    ).toBeInTheDocument();
  });
});
