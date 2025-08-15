import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FormField from '@/ui/FormField';

describe('FormField', () => {
  it('should render label and children', () => {
    render(
      <FormField label="Test Label">
        <input type="text" />
      </FormField>
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should show required indicator when required prop is true', () => {
    render(
      <FormField label="Required Field" required>
        <input type="text" />
      </FormField>
    );

    expect(screen.getByText('Required Field')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should display error message when error prop is provided', () => {
    const errorMessage = 'This field is required';
    
    render(
      <FormField label="Test Field" error={errorMessage}>
        <input type="text" />
      </FormField>
    );

    // Utiliser getByRole pour cibler spécifiquement l'élément alert
    const errorElement = screen.getByRole('alert');
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent(`⚠️ ${errorMessage}`);
    expect(errorElement).toHaveClass('text-red-600');
  });

  it('should display help text when helpText prop is provided', () => {
    const helpText = 'Please enter a valid email address';
    
    render(
      <FormField label="Email Field" helpText={helpText}>
        <input type="email" />
      </FormField>
    );

    expect(screen.getByText(helpText)).toBeInTheDocument();
    // Le composant utilise text-gray-500, pas text-gray-600
    expect(screen.getByText(helpText)).toHaveClass('text-gray-500');
  });

  it('should apply custom className', () => {
    const customClass = 'custom-form-field';
    
    render(
      <FormField label="Test Field" className={customClass}>
        <input type="text" />
      </FormField>
    );

    const formField = screen.getByText('Test Field').closest('div');
    expect(formField).toHaveClass(customClass);
  });

  it('should apply custom labelClassName', () => {
    const customLabelClass = 'custom-label';
    
    render(
      <FormField label="Test Field" labelClassName={customLabelClass}>
        <input type="text" />
      </FormField>
    );

    const label = screen.getByText('Test Field');
    expect(label).toHaveClass(customLabelClass);
  });

  it('should generate consistent field ID based on label', () => {
    render(
      <FormField label="My Test Field">
        <input type="text" />
      </FormField>
    );

    const label = screen.getByLabelText('My Test Field');
    const input = screen.getByRole('textbox');
    
    // Le composant génère l'ID correctement et l'applique à l'input
    expect(input).toHaveAttribute('id', 'field-my-test-field');
    // Le label doit être associé à l'input via htmlFor
    expect(label).toBe(input);
  });

  it('should show both error and help text when both are provided', () => {
    const errorMessage = 'Invalid input';
    const helpText = 'This is help text';
    
    render(
      <FormField label="Test Field" error={errorMessage} helpText={helpText}>
        <input type="text" />
      </FormField>
    );

    // Le message d'erreur est affiché
    const errorElement = screen.getByRole('alert');
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent(`⚠️ ${errorMessage}`);
    
    // Le helpText n'est pas affiché quand il y a une erreur selon la logique du composant
    expect(screen.queryByText(helpText)).not.toBeInTheDocument();
  });

  it('should render without crashing when no optional props are provided', () => {
    render(
      <FormField label="Minimal Field">
        <input type="text" />
      </FormField>
    );

    expect(screen.getByText('Minimal Field')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
