/**
 * Button Component
 *
 * Reusable button component with multiple variants, sizes, and states
 * following BookFairy design system with magical theming
 */

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg focus-visible:ring-purple-500",
        destructive: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg focus-visible:ring-red-500",
        outline: "border-2 border-purple-200 bg-transparent text-purple-700 hover:bg-purple-50 hover:border-purple-300 focus-visible:ring-purple-500",
        secondary: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg focus-visible:ring-blue-500",
        ghost: "text-purple-700 hover:bg-purple-50 hover:text-purple-900 focus-visible:ring-purple-500",
        link: "text-purple-600 underline-offset-4 hover:underline hover:text-purple-700 focus-visible:ring-purple-500",
        magical: "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 shadow-lg hover:shadow-xl focus-visible:ring-purple-500 animate-gradient-x",
        fairy: "bg-gradient-to-r from-yellow-300 to-pink-300 text-purple-800 hover:from-yellow-400 hover:to-pink-400 shadow-md hover:shadow-lg focus-visible:ring-yellow-500 border border-pink-200"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12"
      },
      loading: {
        true: "cursor-not-allowed",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      loading: false
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  tooltip?: string;
  fairy?: boolean; // Enable fairy hover effects
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    loading = false,
    icon,
    rightIcon,
    children,
    disabled,
    fairy = false,
    tooltip,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;

    const buttonContent = (
      <>
        {/* Fairy sparkle effect */}
        {fairy && !isDisabled && (
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="absolute top-1 left-1 w-1 h-1 bg-yellow-300 rounded-full animate-ping"></div>
            <div className="absolute top-2 right-2 w-1 h-1 bg-pink-300 rounded-full animate-ping animation-delay-200"></div>
            <div className="absolute bottom-1 left-2 w-1 h-1 bg-purple-300 rounded-full animate-ping animation-delay-400"></div>
            <div className="absolute bottom-2 right-1 w-1 h-1 bg-blue-300 rounded-full animate-ping animation-delay-600"></div>
          </div>
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="mr-2 animate-spin">
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}

        {/* Left icon */}
        {icon && !loading && (
          <span className={cn("flex-shrink-0", children ? "mr-2" : "")}>
            {icon}
          </span>
        )}

        {/* Button text */}
        {children && (
          <span className="flex-1">
            {children}
          </span>
        )}

        {/* Right icon */}
        {rightIcon && (
          <span className={cn("flex-shrink-0", children ? "ml-2" : "")}>
            {rightIcon}
          </span>
        )}

        {/* Hover shimmer effect for magical variant */}
        {variant === "magical" && !isDisabled && (
          <div className="absolute inset-0 opacity-0 hover:opacity-30 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 animate-shimmer"></div>
          </div>
        )}
      </>
    );

    const button = (
      <button
        className={cn(buttonVariants({ variant, size, loading, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {buttonContent}
      </button>
    );

    // Wrap with tooltip if provided
    if (tooltip) {
      return (
        <div className="relative group">
          {button}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      );
    }

    return button;
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };

// Specialized button components
export const MagicalButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => (
    <Button ref={ref} variant="magical" fairy {...props} />
  )
);

export const FairyButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => (
    <Button ref={ref} variant="fairy" fairy {...props} />
  )
);

export const IconButton = forwardRef<HTMLButtonElement, ButtonProps & { 'aria-label': string }>(
  ({ size = "icon", ...props }, ref) => (
    <Button ref={ref} size={size} {...props} />
  )
);

// Loading button with automatic loading state management
export const AsyncButton = forwardRef<HTMLButtonElement, ButtonProps & {
  asyncAction?: () => Promise<void>;
}>(({ asyncAction, onClick, loading: controlledLoading, ...props }, ref) => {
  const [internalLoading, setInternalLoading] = React.useState(false);

  const loading = controlledLoading ?? internalLoading;

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (asyncAction) {
      setInternalLoading(true);
      try {
        await asyncAction();
      } finally {
        setInternalLoading(false);
      }
    }

    onClick?.(e);
  };

  return (
    <Button
      ref={ref}
      loading={loading}
      onClick={handleClick}
      {...props}
    />
  );
});

AsyncButton.displayName = "AsyncButton";