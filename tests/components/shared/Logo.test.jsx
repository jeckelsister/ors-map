import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import Logo from '../../../src/components/shared/Logo';

describe('Logo Component', () => {
  test('renders logo with correct alt text', () => {
    render(<Logo />);
    
    const logoImage = screen.getByRole('img');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('alt', 'WayMaker Logo');
  });

  test('has correct class names', () => {
    render(<Logo />);
    
    const logoImage = screen.getByRole('img');
    expect(logoImage).toHaveClass('w-10', 'h-10'); // size par défaut 'md'
  });

  test('applies large size correctly', () => {
    render(<Logo size="lg" />);
    
    const logoImage = screen.getByRole('img');
    expect(logoImage).toHaveClass('w-16', 'h-16');
  });

  test('renders with custom className', () => {
    render(<Logo className="custom-class" />);
    
    const logoImage = screen.getByRole('img');
    expect(logoImage).toHaveClass('custom-class');
  });
});
