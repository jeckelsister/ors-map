import { memo, ReactNode, useMemo, cloneElement, isValidElement, ReactElement } from 'react';

interface FormFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
  labelClassName?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
}

/**
 * Composant champ de formulaire réutilisable avec label, erreur et texte d'aide
 * Optimisé pour l'accessibilité et la réutilisabilité
 */
const FormField = memo<FormFieldProps>(
  ({
    label,
    children,
    className = '',
    labelClassName = '',
    required = false,
    error,
    helpText,
  }) => {
    const fieldId = useMemo(
      () => `field-${label.toLowerCase().replace(/\s+/g, '-')}`,
      [label]
    );

    const labelClasses = useMemo(
      () =>
        `block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`.trim(),
      [labelClassName]
    );

    const containerClasses = useMemo(
      () => `space-y-2 ${className}`.trim(),
      [className]
    );

    return (
      <div className={containerClasses}>
        <label htmlFor={fieldId} className={labelClasses}>
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="obligatoire">
              *
            </span>
          )}
        </label>

        <div className="relative">
          {isValidElement(children)
            ? cloneElement(children as ReactElement<{ id?: string }>, { id: fieldId })
            : children}

          {error && (
            <p
              className="mt-1 text-sm text-red-600"
              role="alert"
              aria-live="polite"
            >
              ⚠️ {error}
            </p>
          )}

          {helpText && !error && (
            <p className="mt-1 text-sm text-gray-500">{helpText}</p>
          )}
        </div>
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;
