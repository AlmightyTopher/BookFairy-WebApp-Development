/**
 * Loading Fallback Component
 *
 * Beautiful loading screen with fairy animations
 */

import React from 'react';
import { cn } from '../utils/cn';

interface LoadingFallbackProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showFairy?: boolean;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = 'Loading magical content...',
  size = 'md',
  className,
  showFairy = true
}) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  };

  const containerClasses = {
    sm: 'p-8',
    md: 'p-12',
    lg: 'p-16'
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[50vh] w-full",
      containerClasses[size],
      className
    )}>
      {/* Animated Fairy */}
      {showFairy && (
        <div className="relative mb-6">
          <div
            className={cn(
              "animate-bounce",
              sizeClasses[size]
            )}
            style={{
              animationDuration: '2s',
              animationIterationCount: 'infinite'
            }}
          >
            🧚‍♀️
          </div>

          {/* Magical sparkles */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-purple-400 rounded-full animate-ping"
                style={{
                  top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 30}%`,
                  left: `${50 + Math.cos(i * 60 * Math.PI / 180) * 30}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Loading Message */}
      <div className="text-center space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {message}
        </h2>

        {/* Animated dots */}
        <div className="flex items-center justify-center space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>

        {/* Magical progress bar */}
        <div className="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full animate-pulse"
            style={{
              animation: 'shimmer 2s infinite'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            width: 0%;
            opacity: 0.5;
          }
          50% {
            width: 70%;
            opacity: 1;
          }
          100% {
            width: 100%;
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

// Inline loading component for smaller areas
export const InlineLoading: React.FC<{
  message?: string;
  className?: string;
}> = ({ message = 'Loading...', className }) => {
  return (
    <div className={cn(
      "flex items-center justify-center space-x-2 p-4",
      className
    )}>
      <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full" />
      <span className="text-sm text-gray-600 dark:text-gray-400">{message}</span>
    </div>
  );
};

// Button loading state
export const ButtonLoading: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={cn(
      "animate-spin border-2 border-current border-t-transparent rounded-full",
      sizeClasses[size],
      className
    )} />
  );
};

export default LoadingFallback;