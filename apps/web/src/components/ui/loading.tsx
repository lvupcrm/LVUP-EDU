import * as React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'animate-spin rounded-full border-2 border-current border-t-transparent',
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
LoadingSpinner.displayName = 'LoadingSpinner';

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, text = '로딩 중...', size = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center space-x-2 p-4',
          className
        )}
        {...props}
      >
        <LoadingSpinner size={size} />
        <span className='text-sm text-muted-foreground'>{text}</span>
      </div>
    );
  }
);
Loading.displayName = 'Loading';

interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ className, text = '로딩 중...', size = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
          className
        )}
        {...props}
      >
        <div className='rounded-lg bg-background p-6 shadow-lg'>
          <Loading text={text} size={size} />
        </div>
      </div>
    );
  }
);
LoadingOverlay.displayName = 'LoadingOverlay';

interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ className, loading = false, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center space-x-2',
          className
        )}
        disabled={loading || disabled}
        {...props}
      >
        {loading && <LoadingSpinner size='sm' />}
        <span>{children}</span>
      </button>
    );
  }
);
LoadingButton.displayName = 'LoadingButton';

export { Loading, LoadingSpinner, LoadingOverlay, LoadingButton };
