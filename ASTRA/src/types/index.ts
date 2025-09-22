/**
 * Centralized Type Exports
 *
 * Single source of truth for all BookFairy TypeScript types and interfaces
 */

// User and Authentication Types
export * from './User';

// Book and Content Types
export * from './Book';

// Library Management Types
export * from './LibraryItem';
export * from './WishlistItem';

// Discovery and Recommendation Types
export * from './DiscoveryProfile';

// Notification Types
export * from './Notification';

// Fairy Character Types
export * from './FairyState';

// Legacy compatibility - re-export commonly used types with cleaner names
export type {
  User as UserType,
  UserProfile,
  AccessibilitySettings,
  ThemePreference
} from './User';

export type {
  Book as BookType,
  DiscoveredBook,
  RecommendedBook,
  BookSearchQuery,
  AvailabilityStatus
} from './Book';

export type {
  LibraryItem as LibraryItemType,
  LibraryStats,
  CompletionStatus,
  ListeningProgress
} from './LibraryItem';

export type {
  WishlistItem as WishlistItemType,
  QueueInfo,
  WishlistStatus
} from './WishlistItem';

export type {
  Notification as NotificationType,
  NotificationPreferences,
  NotificationType as NotificationTypeEnum,
  NotificationPriority
} from './Notification';

export type {
  FairyState,
  FairyMessage,
  FairyAnimationState,
  FairyEmotion,
  FairyPosition
} from './FairyState';

export type {
  DiscoveryProfile,
  ContentPreferences,
  DiscoverySettings,
  OnboardingResponse
} from './DiscoveryProfile';

// Common utility types
export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: Record<string, any>;
  };
  meta?: {
    timestamp: string;
    request_id: string;
    api_version: string;
  };
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export interface ErrorResponse {
  error: string;
  message: string;
  fairy_message?: string;
  code?: string;
  details?: Record<string, any>;
}

// Event types for the application
export interface AppEvent {
  type: string;
  timestamp: string;
  user_id?: string;
  session_id?: string;
  data?: Record<string, any>;
}

export interface UserInteractionEvent extends AppEvent {
  type: 'user_interaction';
  data: {
    action: string;
    page: string;
    element: string;
    context?: Record<string, any>;
  };
}

export interface FairyAnimationEvent extends AppEvent {
  type: 'fairy_animation';
  data: {
    animation_state: FairyAnimationState;
    duration_ms: number;
    triggered_by: string;
  };
}

export interface BookInteractionEvent extends AppEvent {
  type: 'book_interaction';
  data: {
    book_id: string;
    action: 'view' | 'add_to_wishlist' | 'remove_from_wishlist' | 'start_listening' | 'complete';
    source: 'discovery' | 'library' | 'search' | 'recommendation';
  };
}

// Configuration types
export interface AppConfig {
  api: {
    base_url: string;
    timeout_ms: number;
    retry_attempts: number;
  };
  supabase: {
    url: string;
    anon_key: string;
  };
  hardcover: {
    api_url: string;
    rate_limit_per_minute: number;
  };
  features: {
    push_notifications: boolean;
    offline_mode: boolean;
    analytics: boolean;
    beta_features: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'system';
    reduced_motion: boolean;
    high_contrast: boolean;
    font_size: 'small' | 'medium' | 'large';
  };
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
  retry?: () => void;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export interface FormFieldProps extends BaseComponentProps {
  label: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

// Hook return types
export interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export interface UseLocalStorage<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
}

export interface UsePagination {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  goToPage: (page: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  goToFirst: () => void;
  goToLast: () => void;
}

// Validation types
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => ValidationResult;
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  categories?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
  filters: SearchFilters;
  executionTime: number;
}

// Analytics types
export interface AnalyticsEvent {
  event_name: string;
  user_id?: string;
  session_id: string;
  timestamp: string;
  properties: Record<string, any>;
  page_url?: string;
  referrer?: string;
  user_agent?: string;
}

export interface UserAnalytics {
  user_id: string;
  session_count: number;
  total_time_spent: number;
  books_discovered: number;
  books_added_to_library: number;
  favorite_genres: string[];
  last_active: string;
  acquisition_source: string;
}

// Performance monitoring types
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp: string;
  context?: Record<string, any>;
}

export interface LoadingMetrics {
  page_load_time: number;
  first_contentful_paint: number;
  largest_contentful_paint: number;
  cumulative_layout_shift: number;
  first_input_delay: number;
}

// Error handling types
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: Record<string, any>;
}

export interface ErrorContext {
  component: string;
  action: string;
  user_id?: string;
  session_id: string;
  timestamp: string;
  url: string;
  user_agent: string;
  additional_data?: Record<string, any>;
}

// Constants re-export for convenience
export { FAIRY_ANIMATION_TIMINGS, FAIRY_POSITIONS } from './FairyState';
export { NOTIFICATION_CONSTANTS, DEFAULT_NOTIFICATION_PREFERENCES } from './Notification';
export { LIBRARY_CONSTANTS } from './LibraryItem';
export { WISHLIST_CONSTANTS } from './WishlistItem';
export { DEFAULT_DISCOVERY_PROFILE, ONBOARDING_QUESTIONS } from './DiscoveryProfile';
export { DEFAULT_ACCESSIBILITY_SETTINGS, DEFAULT_THEME_PREFERENCE } from './User';