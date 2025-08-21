import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import clsx from 'clsx';
import { ReactNode } from 'react';

interface ModernCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  variant?: 'default' | 'elevated' | 'bordered';
}

export default function ModernCard({
  title,
  description,
  children,
  footer,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  variant = 'default',
}: ModernCardProps): React.JSX.Element {
  const cardVariants = {
    default: '',
    elevated: 'shadow-lg border-2',
    bordered: 'border-2 border-primary/20',
  };

  return (
    <Card className={clsx(cardVariants[variant], className)}>
      {(title || description) && (
        <CardHeader className={clsx(headerClassName)}>
          {title && (
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          )}
          {description && (
            <CardDescription className="text-muted-foreground">
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}

      <CardContent className={clsx(contentClassName)}>{children}</CardContent>

      {footer && (
        <CardFooter className={clsx(footerClassName)}>{footer}</CardFooter>
      )}
    </Card>
  );
}
