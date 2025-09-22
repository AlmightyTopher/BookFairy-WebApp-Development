/**
 * Components Index
 *
 * Centralized exports for all BookFairy components
 */

// UI Components
export * from './ui/Button';
export * from './ui/Input';
export * from './ui/Card';
export * from './ui/Modal';

// Fairy Components
export * from './fairy';

// Page Components
export { default as Dashboard } from './pages/Dashboard';
export { default as Library } from './pages/Library';
export { default as Wishlist } from './pages/Wishlist';
export { default as Discovery } from './pages/Discovery';

// Re-export common types for convenience
export type {
  ButtonProps,
  InputProps,
  CardProps,
  ModalProps
} from './ui';

export type {
  FairyCharacterProps,
  FairyChatProps,
  FairyProviderProps
} from './fairy';