import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Button from '../../src/ui/Button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Test Button</Button>);
    expect(
      screen.getByRole('button', { name: 'Test Button' })
    ).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('forwards other props', () => {
    render(
      <Button data-testid="custom-button" title="Custom Title">
        Test
      </Button>
    );
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('title', 'Custom Title');
  });
});
