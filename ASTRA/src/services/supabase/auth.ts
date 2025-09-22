/**
 * Supabase Authentication Service
 *
 * Handles Google OAuth authentication and user management
 * for the BookFairy application
 */

import { supabase } from './client';
import type {
  User,
  UserProfile,
  UserProfileUpdate,
  OnboardingState,
  DEFAULT_ACCESSIBILITY_SETTINGS,
  DEFAULT_THEME_PREFERENCE
} from '@/types';
import { validateUser, validateUserProfileUpdate, isOnboardingRenewalDue, calculateNextRenewalDate } from '@/types/User';

// OAuth Types
export interface OAuthInitiateRequest {
  redirect_url: string;
}

export interface OAuthInitiateResponse {
  url: string;
  state: string;
}

export interface OAuthCallbackRequest {
  code: string;
  state: string;
}

export interface OAuthCallbackResponse {
  user: UserProfile;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
  requires_onboarding: boolean;
}

export interface AuthError {
  error: string;
  message: string;
  fairy_message: string;
}

// Service Implementation
export class AuthService {
  /**
   * Initiate Google OAuth flow
   */
  async initiateGoogleOAuth(request: OAuthInitiateRequest): Promise<OAuthInitiateResponse> {
    try {
      // Validate redirect URL
      if (!this.isValidRedirectUrl(request.redirect_url)) {
        throw new Error('Invalid request parameters');
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: request.redirect_url,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.url) {
        throw new Error('OAuth configuration error');
      }

      return {
        url: data.url,
        state: this.generateStateToken()
      };
    } catch (error) {
      throw this.createAuthError(
        'oauth_initiation_failed',
        error instanceof Error ? error.message : 'OAuth initiation failed',
        'Well sugar, something went sideways with the sign-in. Let\'s try that again, honey!'
      );
    }
  }

  /**
   * Handle OAuth callback and create/update user
   */
  async handleOAuthCallback(request: OAuthCallbackRequest): Promise<OAuthCallbackResponse> {
    try {
      if (!request.code) {
        throw new Error('Authentication failed');
      }

      if (!request.state) {
        throw new Error('state parameter is required');
      }

      // Exchange code for session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        throw new Error('Authentication failed');
      }

      const { session } = sessionData;
      const user = session.user;

      // Get or create user profile
      const userProfile = await this.getOrCreateUserProfile(user);

      // Check if onboarding is required
      const requiresOnboarding = this.checkOnboardingRequired(userProfile);

      return {
        user: userProfile,
        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token || '',
          expires_at: session.expires_at || 0
        },
        requires_onboarding: requiresOnboarding
      };
    } catch (error) {
      throw this.createAuthError(
        'oauth_callback_failed',
        error instanceof Error ? error.message : 'Authentication failed',
        'Oh honey, bless your heart! The sign-in didn\'t quite work. Let\'s give it another try!'
      );
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<UserProfile> {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        throw new Error('Authentication required');
      }

      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .single();

      if (userError) {
        throw new Error('User not found');
      }

      return this.mapToUserProfile(userRecord);
    } catch (error) {
      throw this.createAuthError(
        'user_fetch_failed',
        error instanceof Error ? error.message : 'Failed to fetch user',
        'Well sugar, I can\'t seem to find your profile right now. Mind signing in again?'
      );
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(update: UserProfileUpdate): Promise<UserProfile> {
    try {
      // Validate update data
      const validation = validateUserProfileUpdate(update);
      if (!validation.valid) {
        throw new Error(validation.errors[0]);
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        throw new Error('Authentication required');
      }

      // Validate Hardcover API key if provided
      if (update.hardcover_api_key && !this.validateHardcoverApiKey(update.hardcover_api_key)) {
        throw new Error('Invalid hardcover API key format');
      }

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          hardcover_api_key: update.hardcover_api_key,
          audiobookshelf_account_id: update.audiobookshelf_account_id,
          prefers_reduced_motion: update.accessibility_preferences?.prefers_reduced_motion,
          high_contrast_mode: update.accessibility_preferences?.high_contrast_enabled,
          keyboard_navigation: update.accessibility_preferences?.keyboard_navigation,
          screen_reader_mode: update.accessibility_preferences?.screen_reader_mode,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionData.session.user.id)
        .select()
        .single();

      if (updateError) {
        throw new Error('Failed to update profile');
      }

      return this.mapToUserProfile(updatedUser);
    } catch (error) {
      throw this.createAuthError(
        'profile_update_failed',
        error instanceof Error ? error.message : 'Profile update failed',
        'Well honey, I couldn\'t save those changes right now. Let\'s try again in a jiffy!'
      );
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<{ message: string }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error('Logout failed');
      }

      return {
        message: 'Logout successful'
      };
    } catch (error) {
      throw this.createAuthError(
        'logout_failed',
        error instanceof Error ? error.message : 'Logout failed',
        'Well sugar, having trouble signing out. That\'s peculiar!'
      );
    }
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding(): Promise<UserProfile> {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        throw new Error('Authentication required');
      }

      const now = new Date().toISOString();
      const nextRenewalDate = calculateNextRenewalDate(now);

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          onboarding_completed: true,
          last_onboarding_date: now,
          next_renewal_date: nextRenewalDate,
          updated_at: now
        })
        .eq('id', sessionData.session.user.id)
        .select()
        .single();

      if (updateError) {
        throw new Error('Failed to complete onboarding');
      }

      return this.mapToUserProfile(updatedUser);
    } catch (error) {
      throw this.createAuthError(
        'onboarding_completion_failed',
        error instanceof Error ? error.message : 'Onboarding completion failed',
        'Well honey, I couldn\'t finish setting you up. Let\'s try that again!'
      );
    }
  }

  /**
   * Check if user needs onboarding renewal
   */
  async checkOnboardingRenewal(): Promise<{ needs_renewal: boolean; days_since_last: number }> {
    try {
      const userProfile = await this.getCurrentUser();

      const needsRenewal = isOnboardingRenewalDue(userProfile.last_onboarding_date);

      let daysSinceLast = 0;
      if (userProfile.last_onboarding_date) {
        const lastDate = new Date(userProfile.last_onboarding_date);
        const now = new Date();
        daysSinceLast = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      return {
        needs_renewal: needsRenewal,
        days_since_last: daysSinceLast
      };
    } catch (error) {
      throw this.createAuthError(
        'onboarding_check_failed',
        error instanceof Error ? error.message : 'Onboarding check failed',
        'Well sugar, I can\'t check your onboarding status right now!'
      );
    }
  }

  // Private helper methods
  private isValidRedirectUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      // Only allow http/https protocols
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  private generateStateToken(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private validateHardcoverApiKey(apiKey: string): boolean {
    // Hardcover API keys are typically 32-character alphanumeric strings
    const keyRegex = /^[a-zA-Z0-9]{32}$/;
    return keyRegex.test(apiKey);
  }

  private async getOrCreateUserProfile(supabaseUser: any): Promise<UserProfile> {
    // First, try to get existing user
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (!fetchError && existingUser) {
      return this.mapToUserProfile(existingUser);
    }

    // Create new user profile
    const now = new Date().toISOString();
    const newUser = {
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
      avatar_url: supabaseUser.user_metadata?.avatar_url,
      hardcover_api_key: '',
      audiobookshelf_account_id: '',
      created_at: now,
      updated_at: now,
      onboarding_completed: false,
      last_onboarding_date: '',
      next_renewal_date: '',
      prefers_reduced_motion: false,
      high_contrast_mode: false,
      keyboard_navigation: false,
      screen_reader_mode: false
    };

    const { data: createdUser, error: createError } = await supabase
      .from('users')
      .insert(newUser)
      .select()
      .single();

    if (createError) {
      throw new Error('Failed to create user profile');
    }

    return this.mapToUserProfile(createdUser);
  }

  private mapToUserProfile(dbUser: any): UserProfile {
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      avatar_url: dbUser.avatar_url,
      hardcover_api_key: dbUser.hardcover_api_key || '',
      audiobookshelf_account_id: dbUser.audiobookshelf_account_id || '',
      onboarding_completed: dbUser.onboarding_completed || false,
      last_onboarding_date: dbUser.last_onboarding_date || '',
      accessibility_preferences: {
        prefers_reduced_motion: dbUser.prefers_reduced_motion || false,
        high_contrast_enabled: dbUser.high_contrast_mode || false,
        keyboard_navigation: dbUser.keyboard_navigation || false,
        screen_reader_mode: dbUser.screen_reader_mode || false
      },
      theme_preference: {
        mode: 'system' // Default, could be stored in DB
      }
    };
  }

  private checkOnboardingRequired(userProfile: UserProfile): boolean {
    // New users need onboarding
    if (!userProfile.onboarding_completed) {
      return true;
    }

    // Check if renewal is due (60 days)
    return isOnboardingRenewalDue(userProfile.last_onboarding_date);
  }

  private createAuthError(errorCode: string, message: string, fairyMessage: string): AuthError {
    const error = new Error(message) as any;
    error.error = errorCode;
    error.message = message;
    error.fairy_message = fairyMessage;
    return error;
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export convenience functions to match test expectations
export async function initiateGoogleOAuth(request: OAuthInitiateRequest): Promise<OAuthInitiateResponse> {
  return authService.initiateGoogleOAuth(request);
}

export async function handleOAuthCallback(request: OAuthCallbackRequest): Promise<OAuthCallbackResponse> {
  return authService.handleOAuthCallback(request);
}

export async function getCurrentUser(): Promise<UserProfile> {
  return authService.getCurrentUser();
}

export async function updateUserProfile(update: UserProfileUpdate): Promise<UserProfile> {
  return authService.updateUserProfile(update);
}

export async function logout(): Promise<{ message: string }> {
  return authService.logout();
}

export async function completeOnboarding(): Promise<UserProfile> {
  return authService.completeOnboarding();
}

export async function checkOnboardingRenewal(): Promise<{ needs_renewal: boolean; days_since_last: number }> {
  return authService.checkOnboardingRenewal();
}

// Auth state listener
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}