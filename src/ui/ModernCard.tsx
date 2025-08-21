import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
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
    <Card className={cn(cardVariants[variant], className)}>
      {(title || description) && (
        <CardHeader className={cn(headerClassName)}>
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

      <CardContent className={cn(contentClassName)}>{children}</CardContent>

      {footer && (
        <CardFooter className={cn(footerClassName)}>{footer}</CardFooter>
      )}
    </Card>
  );
}
