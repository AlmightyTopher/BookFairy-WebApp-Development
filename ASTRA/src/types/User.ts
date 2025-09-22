/**
 * User Entity Interface and Validation
 *
 * Defines the core user data structure and validation logic
 * for BookFairy users with authentication and preferences
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  hardcover_api_key: string;
  audiobookshelf_account_id: string;
  created_at: string;
  updated_at: string;
  onboarding_completed: boolean;
  last_onboarding_date: string;
  next_renewal_date: string;
  accessibility_preferences: AccessibilitySettings;
  theme_preference: ThemePreference;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  hardcover_api_key: string;
  audiobookshelf_account_id: string;
  onboarding_completed: boolean;
  accessibility_preferences: AccessibilitySettings;
  theme_preference: ThemePreference;
}

export interface UserProfileUpdate {
  hardcover_api_key?: string;
  audiobookshelf_account_id?: string;
  accessibility_preferences?: Partial<AccessibilitySettings>;
  theme_preference?: ThemePreference;
}

export interface AccessibilitySettings {
  prefers_reduced_motion: boolean;
  high_contrast_enabled: boolean;
  keyboard_navigation: boolean;
  screen_reader_mode: boolean;
}

export interface ThemePreference {
  mode: 'light' | 'dark' | 'system';
  accent_color?: string;
}

export interface OnboardingState {
  completed: boolean;
  last_date: string;
  next_renewal_date: string;
  current_step?: string;
  interrupted?: boolean;
  skipped?: boolean;
}

// Validation functions
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateHardcoverApiKey(apiKey: string): boolean {
  // Hardcover API keys are typically 32-character alphanumeric strings
  const keyRegex = /^[a-zA-Z0-9]{32}$/;
  return keyRegex.test(apiKey);
}

export function validateUser(user: Partial<User>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!user.id) {
    errors.push('User ID is required');
  }

  if (!user.email) {
    errors.push('Email is required');
  } else if (!validateEmail(user.email)) {
    errors.push('Invalid email format');
  }

  if (!user.name || user.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (user.hardcover_api_key && !validateHardcoverApiKey(user.hardcover_api_key)) {
    errors.push('Invalid Hardcover API key format');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateUserProfileUpdate(update: UserProfileUpdate): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (update.hardcover_api_key && !validateHardcoverApiKey(update.hardcover_api_key)) {
    errors.push('Invalid Hardcover API key format');
  }

  if (update.theme_preference) {
    const validModes = ['light', 'dark', 'system'];
    if (!validModes.includes(update.theme_preference.mode)) {
      errors.push('Invalid theme mode');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Default values
export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  prefers_reduced_motion: false,
  high_contrast_enabled: false,
  keyboard_navigation: false,
  screen_reader_mode: false
};

export const DEFAULT_THEME_PREFERENCE: ThemePreference = {
  mode: 'system'
};

export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  completed: false,
  last_date: '',
  next_renewal_date: '',
  interrupted: false,
  skipped: false
};

// Utility functions
export function isOnboardingRenewalDue(lastOnboardingDate: string): boolean {
  if (!lastOnboardingDate) return true;

  const lastDate = new Date(lastOnboardingDate);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  return daysDiff >= 60; // 60-day renewal cycle
}

export function calculateNextRenewalDate(lastOnboardingDate: string): string {
  const lastDate = new Date(lastOnboardingDate);
  const nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() + 60);

  return nextDate.toISOString();
}

export function getUserDisplayName(user: User | UserProfile): string {
  return user.name || user.email.split('@')[0] || 'User';
}

export function getUserInitials(user: User | UserProfile): string {
  const name = getUserDisplayName(user);
  const words = name.split(' ');

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

// Type guards
export function isUser(obj: any): obj is User {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.hardcover_api_key === 'string' &&
    typeof obj.audiobookshelf_account_id === 'string' &&
    typeof obj.onboarding_completed === 'boolean'
  );
}

export function isUserProfile(obj: any): obj is UserProfile {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.onboarding_completed === 'boolean'
  );
}