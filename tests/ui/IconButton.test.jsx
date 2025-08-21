import IconButton from '@/components/ui/icon-button';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('IconButton Component', () => {
  const defaultProps = {
    icon: <span>📍</span>,
    onClick: vi.fn(),
    title: 'Test button',
  };

  it('renders with icon', () => {
    render(<IconButton {...defaultProps} />);

    expect(screen.getByText('📍')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<IconButton {...defaultProps} onClick={handleClick} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('applies custom className', () => {
    render(<IconButton {...defaultProps} className="custom-class" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('shows active state correctly', () => {
    render(<IconButton {...defaultProps} isActive={true} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('has correct title attribute', () => {
    render(<IconButton {...defaultProps} title="Custom title" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Custom title');
  });

  it('renders label when provided', () => {
    render(<IconButton {...defaultProps} label="Button Label" />);

    expect(screen.getByText('Button Label')).toBeInTheDocument();
  });
});
