/**
 * Input Component
 *
 * Reusable input component with validation, states, and magical theming
 * following BookFairy design system
 */

import React, { forwardRef, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const inputVariants = cva(
  // Base styles
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-purple-200 focus-visible:ring-purple-500 focus-visible:border-purple-400",
        error: "border-red-300 focus-visible:ring-red-500 focus-visible:border-red-400 bg-red-50",
        success: "border-green-300 focus-visible:ring-green-500 focus-visible:border-green-400 bg-green-50",
        fairy: "border-pink-200 focus-visible:ring-pink-500 focus-visible:border-pink-400 bg-gradient-to-r from-pink-50 to-purple-50"
      },
      size: {
        default: "h-10",
        sm: "h-8 text-xs",
        lg: "h-12 text-base",
        xl: "h-14 text-lg px-4"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  success?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  loading?: boolean;
  showPasswordToggle?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  fairy?: boolean; // Enable fairy effects
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant,
    size,
    type = "text",
    label,
    error,
    success,
    helper,
    leftIcon,
    rightIcon,
    onRightIconClick,
    loading = false,
    showPasswordToggle = false,
    clearable = false,
    onClear,
    fairy = false,
    id,
    value,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    const hasSuccess = !!success && !hasError;
    const hasValue = value !== undefined && value !== null && value !== '';

    // Determine variant based on state
    let effectiveVariant = variant;
    if (hasError) effectiveVariant = "error";
    else if (hasSuccess) effectiveVariant = "success";
    else if (fairy) effectiveVariant = "fairy";

    const inputType = showPasswordToggle && type === "password"
      ? (showPassword ? "text" : "password")
      : type;

    const handlePasswordToggle = () => {
      setShowPassword(!showPassword);
    };

    const handleClear = () => {
      onClear?.();
    };

    const showClearButton = clearable && hasValue && !loading;
    const showPasswordButton = showPasswordToggle && type === "password";

    return (
      <div className="space-y-2">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              hasError ? "text-red-600" : hasSuccess ? "text-green-600" : "text-gray-700"
            )}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input container */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input field */}
          <input
            id={inputId}
            type={inputType}
            className={cn(
              inputVariants({ variant: effectiveVariant, size }),
              leftIcon && "pl-10",
              (rightIcon || showClearButton || showPasswordButton || loading) && "pr-10",
              fairy && isFocused && "shadow-lg shadow-purple-200/50",
              className
            )}
            ref={ref}
            value={value}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />

          {/* Right side icons */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {/* Loading spinner */}
            {loading && (
              <div className="animate-spin">
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24">
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

            {/* Clear button */}
            {showClearButton && !loading && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                tabIndex={-1}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Password toggle */}
            {showPasswordButton && !loading && (
              <button
                type="button"
                onClick={handlePasswordToggle}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l4.242 4.242m0 0l1.414 1.414M19.071 4.929l-4.322 4.322" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            )}

            {/* Custom right icon */}
            {rightIcon && !loading && (
              <button
                type="button"
                onClick={onRightIconClick}
                className={cn(
                  "text-gray-400 transition-colors duration-200",
                  onRightIconClick ? "hover:text-gray-600 cursor-pointer" : "cursor-default"
                )}
                tabIndex={onRightIconClick ? 0 : -1}
              >
                {rightIcon}
              </button>
            )}
          </div>

          {/* Fairy sparkles */}
          {fairy && isFocused && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1 left-1 w-1 h-1 bg-pink-400 rounded-full animate-ping"></div>
              <div className="absolute top-1 right-1 w-1 h-1 bg-purple-400 rounded-full animate-ping animation-delay-200"></div>
              <div className="absolute bottom-1 left-2 w-1 h-1 bg-yellow-400 rounded-full animate-ping animation-delay-400"></div>
              <div className="absolute bottom-1 right-2 w-1 h-1 bg-blue-400 rounded-full animate-ping animation-delay-600"></div>
            </div>
          )}
        </div>

        {/* Helper text, error, or success message */}
        {(error || success || helper) && (
          <div className="space-y-1">
            {error && (
              <p className="text-sm text-red-600 flex items-center">
                <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
            {success && !error && (
              <p className="text-sm text-green-600 flex items-center">
                <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </p>
            )}
            {helper && !error && !success && (
              <p className="text-sm text-gray-600">{helper}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants };

// Specialized input components
export const SearchInput = forwardRef<HTMLInputElement, Omit<InputProps, 'leftIcon' | 'type'>>(
  ({ placeholder = "Search...", ...props }, ref) => (
    <Input
      ref={ref}
      type="search"
      placeholder={placeholder}
      leftIcon={
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      clearable
      {...props}
    />
  )
);

export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'showPasswordToggle'>>(
  (props, ref) => (
    <Input
      ref={ref}
      type="password"
      showPasswordToggle
      {...props}
    />
  )
);

export const EmailInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'leftIcon'>>(
  (props, ref) => (
    <Input
      ref={ref}
      type="email"
      leftIcon={
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
        </svg>
      }
      {...props}
    />
  )
);

export const FairyInput = forwardRef<HTMLInputElement, Omit<InputProps, 'fairy'>>(
  (props, ref) => (
    <Input ref={ref} fairy {...props} />
  )
);

SearchInput.displayName = "SearchInput";
PasswordInput.displayName = "PasswordInput";
EmailInput.displayName = "EmailInput";
FairyInput.displayName = "FairyInput";