/**
 * Card Component
 *
 * Reusable card component with various layouts and magical theming
 * following BookFairy design system
 */

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const cardVariants = cva(
  // Base styles
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border bg-white",
        elevated: "border-border bg-white shadow-md hover:shadow-lg",
        outline: "border-2 border-purple-200 bg-transparent",
        ghost: "border-transparent bg-purple-50/50 hover:bg-purple-50",
        magical: "border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 shadow-md hover:shadow-lg hover:shadow-purple-200/50",
        fairy: "border-pink-200 bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 shadow-md hover:shadow-lg hover:shadow-pink-200/50"
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        xl: "p-10"
      },
      interactive: {
        true: "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: false
    }
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
  loading?: boolean;
  fairy?: boolean; // Enable fairy effects
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant,
    size,
    interactive,
    loading = false,
    fairy = false,
    children,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, size, interactive }),
          loading && "opacity-50 pointer-events-none",
          fairy && "relative overflow-hidden",
          className
        )}
        {...props}
      >
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
            <div className="animate-spin">
              <svg className="h-6 w-6 text-purple-600" viewBox="0 0 24 24">
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
          </div>
        )}

        {/* Fairy sparkle effects */}
        {fairy && (
          <div className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="absolute top-2 left-2 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="absolute top-3 right-3 w-1 h-1 bg-pink-400 rounded-full animate-ping animation-delay-200"></div>
            <div className="absolute bottom-2 left-3 w-1 h-1 bg-purple-400 rounded-full animate-ping animation-delay-400"></div>
            <div className="absolute bottom-3 right-2 w-1 h-1 bg-blue-400 rounded-full animate-ping animation-delay-600"></div>
          </div>
        )}

        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Card Header Component
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 pb-6", className)}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
      {children}
    </div>
  )
);

CardHeader.displayName = "CardHeader";

// Card Title Component
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', ...props }, ref) => (
    <Component
      ref={ref as any}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
);

CardTitle.displayName = "CardTitle";

// Card Description Component
const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
);

CardDescription.displayName = "CardDescription";

// Card Content Component
const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("pt-0", className)} {...props} />
  )
);

CardContent.displayName = "CardContent";

// Card Footer Component
const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center pt-6", className)}
      {...props}
    />
  )
);

CardFooter.displayName = "CardFooter";

// Specialized Card Components
export const MagicalCard = forwardRef<HTMLDivElement, Omit<CardProps, 'variant'>>(
  (props, ref) => (
    <Card ref={ref} variant="magical" fairy {...props} />
  )
);

export const FairyCard = forwardRef<HTMLDivElement, Omit<CardProps, 'variant'>>(
  (props, ref) => (
    <Card ref={ref} variant="fairy" fairy {...props} />
  )
);

export const InteractiveCard = forwardRef<HTMLDivElement, Omit<CardProps, 'interactive'>>(
  (props, ref) => (
    <Card ref={ref} interactive {...props} />
  )
);

// Book Card Component (specialized for book displays)
export interface BookCardProps extends Omit<CardProps, 'children'> {
  title: string;
  author: string;
  coverUrl?: string;
  rating?: number;
  status?: 'reading' | 'completed' | 'wishlist' | 'available';
  progress?: number;
  onAction?: (action: string) => void;
  compact?: boolean;
}

export const BookCard = forwardRef<HTMLDivElement, BookCardProps>(
  ({
    title,
    author,
    coverUrl,
    rating,
    status,
    progress,
    onAction,
    compact = false,
    className,
    ...props
  }, ref) => {
    const statusColors = {
      reading: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      wishlist: 'bg-purple-100 text-purple-800',
      available: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Card
        ref={ref}
        variant="elevated"
        interactive
        className={cn("group", className)}
        {...props}
      >
        <div className={cn("flex", compact ? "items-center space-x-4" : "flex-col")}>
          {/* Book Cover */}
          <div className={cn(
            "relative overflow-hidden rounded-lg bg-gradient-to-br from-purple-100 to-pink-100",
            compact ? "w-16 h-20 flex-shrink-0" : "w-full h-48 mb-4"
          )}>
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={`Cover of ${title}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-purple-400">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}

            {/* Status badge */}
            {status && (
              <div className={cn(
                "absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium",
                statusColors[status]
              )}>
                {status}
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className={cn("flex-1", compact ? "" : "space-y-2")}>
            <div>
              <h3 className={cn(
                "font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-700 transition-colors",
                compact ? "text-sm" : "text-base"
              )}>
                {title}
              </h3>
              <p className={cn(
                "text-gray-600",
                compact ? "text-xs" : "text-sm"
              )}>
                {author}
              </p>
            </div>

            {/* Rating */}
            {rating && (
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={cn(
                      "w-4 h-4",
                      star <= rating ? "text-yellow-400" : "text-gray-300"
                    )}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-sm text-gray-600 ml-1">{rating}</span>
              </div>
            )}

            {/* Progress bar */}
            {progress !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action buttons */}
            {onAction && !compact && (
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => onAction('view')}
                  className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  View Details
                </button>
                <button
                  onClick={() => onAction('add')}
                  className="bg-pink-100 hover:bg-pink-200 text-pink-700 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  ♥
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }
);

BookCard.displayName = "BookCard";

MagicalCard.displayName = "MagicalCard";
FairyCard.displayName = "FairyCard";
InteractiveCard.displayName = "InteractiveCard";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants
};