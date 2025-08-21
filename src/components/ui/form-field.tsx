import { Label } from '@/components/ui/label';
import clsx from 'clsx';
import {
  cloneElement,
  isValidElement,
  memo,
  ReactElement,
  ReactNode,
  useMemo,
} from 'react';

interface FormFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
  labelClassName?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  description?: string;
}

/**
 * Form field component with shadcn/ui styling
 * Optimized for accessibility and visual consistency
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
    description,
  }) => {
    const fieldId = useMemo(
      () => `field-${label.toLowerCase().replace(/\s+/g, '-')}`,
      [label]
    );

    return (
      <div className={clsx('space-y-2', className)}>
        <Label
          htmlFor={fieldId}
          className={clsx(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            error && 'text-destructive',
            labelClassName
          )}
        >
          {label}
          {required && (
            <span className="text-destructive ml-1" aria-label="obligatoire">
              *
            </span>
          )}
        </Label>

        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        <div className="relative">
          {isValidElement(children)
            ? cloneElement(
                children as ReactElement<{ id?: string; className?: string }>,
                {
                  id: fieldId,
                  className: clsx(
                    (children as ReactElement<{ className?: string }>).props
                      .className,
                    error && 'border-destructive focus-visible:ring-destructive'
                  ),
                }
              )
            : children}

          {error && (
            <p
              className="text-sm font-medium text-destructive mt-2"
              role="alert"
              aria-live="polite"
            >
              {error}
            </p>
          )}

          {helpText && !error && (
            <p className="text-sm text-muted-foreground mt-2">{helpText}</p>
          )}
        </div>
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;
