/**
 * Modal Component
 *
 * Accessible modal dialog with overlay, focus management, and magical theming
 * following BookFairy design system
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';
import { Button } from './Button';

const modalVariants = cva(
  // Base styles
  "relative bg-background border rounded-lg shadow-lg max-h-[90vh] overflow-hidden transition-all duration-300 transform",
  {
    variants: {
      size: {
        sm: "w-full max-w-sm",
        default: "w-full max-w-md",
        lg: "w-full max-w-lg",
        xl: "w-full max-w-xl",
        "2xl": "w-full max-w-2xl",
        "3xl": "w-full max-w-3xl",
        "4xl": "w-full max-w-4xl",
        "5xl": "w-full max-w-5xl",
        "6xl": "w-full max-w-6xl",
        full: "w-full max-w-7xl"
      },
      variant: {
        default: "border-border bg-white",
        magical: "border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 shadow-xl shadow-purple-200/50",
        fairy: "border-pink-200 bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 shadow-xl shadow-pink-200/50"
      }
    },
    defaultVariants: {
      size: "default",
      variant: "default"
    }
  }
);

const overlayVariants = cva(
  "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  {
    variants: {
      variant: {
        default: "bg-black/80",
        magical: "bg-gradient-to-br from-purple-900/80 via-pink-900/80 to-blue-900/80 backdrop-blur-sm",
        fairy: "bg-gradient-to-br from-yellow-900/70 via-pink-900/80 to-purple-900/80 backdrop-blur-sm"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface ModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalVariants> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  preventScroll?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
  returnFocus?: React.RefObject<HTMLElement>;
  fairy?: boolean; // Enable fairy effects
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size,
  variant,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  preventScroll = true,
  initialFocus,
  returnFocus,
  fairy = false,
  className,
  children,
  ...props
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle escape key
  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && closeOnEscape) {
      onClose();
    }
  }, [closeOnEscape, onClose]);

  // Handle overlay click
  const handleOverlayClick = useCallback((event: React.MouseEvent) => {
    if (event.target === overlayRef.current && closeOnOverlayClick) {
      onClose();
    }
  }, [closeOnOverlayClick, onClose]);

  // Focus management
  useEffect(() => {
    if (!isOpen) return;

    // Store previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Prevent body scroll
    if (preventScroll) {
      document.body.style.overflow = 'hidden';
    }

    // Set initial focus
    const focusElement = initialFocus?.current || modalRef.current?.querySelector('[data-autofocus]') as HTMLElement;
    if (focusElement) {
      focusElement.focus();
    } else if (modalRef.current) {
      modalRef.current.focus();
    }

    // Add escape listener
    document.addEventListener('keydown', handleEscape);

    return () => {
      // Restore body scroll
      if (preventScroll) {
        document.body.style.overflow = '';
      }

      // Remove escape listener
      document.removeEventListener('keydown', handleEscape);

      // Return focus to previous element
      const elementToFocus = returnFocus?.current || previousActiveElement.current;
      if (elementToFocus) {
        elementToFocus.focus();
      }
    };
  }, [isOpen, preventScroll, initialFocus, returnFocus, handleEscape]);

  // Focus trap
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }, []);

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className={overlayVariants({ variant: fairy ? "fairy" : variant })}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
    >
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={modalRef}
          className={cn(
            modalVariants({ size, variant: fairy ? "fairy" : variant }),
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            className
          )}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          data-state={isOpen ? "open" : "closed"}
          {...props}
        >
          {/* Fairy sparkles */}
          {fairy && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 left-4 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute top-6 right-6 w-1 h-1 bg-pink-400 rounded-full animate-ping animation-delay-200"></div>
              <div className="absolute bottom-4 left-6 w-1 h-1 bg-purple-400 rounded-full animate-ping animation-delay-400"></div>
              <div className="absolute bottom-6 right-4 w-1 h-1 bg-blue-400 rounded-full animate-ping animation-delay-600"></div>
            </div>
          )}

          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="space-y-1">
                {title && (
                  <h2 id="modal-title" className="text-lg font-semibold leading-none tracking-tight">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="modal-description" className="text-sm text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 rounded-full"
                  aria-label="Close modal"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Modal Header Component
export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  description,
  className,
  children,
  ...props
}) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props}>
    {title && <ModalTitle>{title}</ModalTitle>}
    {description && <ModalDescription>{description}</ModalDescription>}
    {children}
  </div>
);

// Modal Title Component
const ModalTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h3
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
);

// Modal Description Component
const ModalDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => (
  <p
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
);

// Modal Content Component
const ModalContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div className={cn("p-6", className)} {...props} />
);

// Modal Footer Component
const ModalFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 border-t border-border",
      className
    )}
    {...props}
  />
);

// Specialized Modal Components
export const ConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
}> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'default',
  loading = false
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} description={description}>
    <ModalContent>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant={variant === 'destructive' ? 'destructive' : 'default'}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

export const FairyModal: React.FC<Omit<ModalProps, 'fairy'>> = (props) => (
  <Modal fairy {...props} />
);

export const MagicalModal: React.FC<Omit<ModalProps, 'variant'>> = (props) => (
  <Modal variant="magical" {...props} />
);

ModalHeader.displayName = "ModalHeader";
ModalTitle.displayName = "ModalTitle";
ModalDescription.displayName = "ModalDescription";
ModalContent.displayName = "ModalContent";
ModalFooter.displayName = "ModalFooter";
ConfirmModal.displayName = "ConfirmModal";
FairyModal.displayName = "FairyModal";
MagicalModal.displayName = "MagicalModal";

export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
  modalVariants,
  overlayVariants
};