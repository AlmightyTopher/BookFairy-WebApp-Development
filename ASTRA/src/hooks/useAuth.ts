/**
 * Authentication Hook
 *
 * Provides authentication state management, Google OAuth integration,
 * and user session handling for the BookFairy application
 */

import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import type {
  UserProfile,
  UserProfileUpdate,
  OnboardingState,
  UseAsyncState
} from '@/types';
import {
  authService,
  type OAuthInitiateRequest,
  type OAuthCallbackRequest,
  type AuthError,
  onAuthStateChange
} from '@/services/supabase/auth';

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionExpiry: number | null;
}

export interface AuthActions {
  login: (redirectUrl: string) => Promise<{ url: string; state: string }>;
  handleCallback: (code: string, state: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateProfile: (update: UserProfileUpdate) => Promise<UserProfile>;
  completeOnboarding: () => Promise<UserProfile>;
  checkOnboardingRenewal: () => Promise<{ needs_renewal: boolean; days_since_last: number }>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export interface UseAuthResult extends AuthState, AuthActions {}

export interface AuthContextType extends UseAuthResult {
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={{ ...auth, isInitialized: true }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const useAuth = (): UseAuthResult => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    sessionExpiry: null
  });

  // Initialize auth state and listen for changes
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Try to get current user
        const user = await authService.getCurrentUser();

        if (mounted) {
          setState(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          }));
        }
      } catch (error) {
        if (mounted) {
          setState(prev => ({
            ...prev,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null // Don't show error for initial load failure
          }));
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if (!mounted) return;

      switch (event) {
        case 'SIGNED_IN':
          if (session?.user) {
            refreshUser();
          }
          break;
        case 'SIGNED_OUT':
          setState(prev => ({
            ...prev,
            user: null,
            isAuthenticated: false,
            sessionExpiry: null,
            error: null
          }));
          break;
        case 'TOKEN_REFRESHED':
          if (session?.expires_at) {
            setState(prev => ({
              ...prev,
              sessionExpiry: session.expires_at * 1000
            }));
          }
          break;
      }
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Auto-refresh user data periodically
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const interval = setInterval(() => {
      refreshUser();
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [state.isAuthenticated]);

  const login = useCallback(async (redirectUrl: string): Promise<{ url: string; state: string }> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await authService.initiateGoogleOAuth({ redirect_url: redirectUrl });

      setState(prev => ({ ...prev, isLoading: false }));

      return result;
    } catch (error) {
      const authError = error as AuthError;
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: authError.fairy_message || authError.message || 'Login failed'
      }));
      throw error;
    }
  }, []);

  const handleCallback = useCallback(async (code: string, state: string): Promise<UserProfile> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await authService.handleOAuthCallback({ code, state });

      setState(prev => ({
        ...prev,
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        sessionExpiry: result.session.expires_at * 1000,
        error: null
      }));

      return result.user;
    } catch (error) {
      const authError = error as AuthError;
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: authError.fairy_message || authError.message || 'Authentication failed'
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await authService.logout();

      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        sessionExpiry: null,
        error: null
      }));
    } catch (error) {
      const authError = error as AuthError;
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: authError.fairy_message || authError.message || 'Logout failed'
      }));
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (update: UserProfileUpdate): Promise<UserProfile> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const updatedUser = await authService.updateUserProfile(update);

      setState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
        error: null
      }));

      return updatedUser;
    } catch (error) {
      const authError = error as AuthError;
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: authError.fairy_message || authError.message || 'Profile update failed'
      }));
      throw error;
    }
  }, []);

  const completeOnboarding = useCallback(async (): Promise<UserProfile> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const updatedUser = await authService.completeOnboarding();

      setState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
        error: null
      }));

      return updatedUser;
    } catch (error) {
      const authError = error as AuthError;
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: authError.fairy_message || authError.message || 'Onboarding completion failed'
      }));
      throw error;
    }
  }, []);

  const checkOnboardingRenewal = useCallback(async (): Promise<{ needs_renewal: boolean; days_since_last: number }> => {
    try {
      return await authService.checkOnboardingRenewal();
    } catch (error) {
      const authError = error as AuthError;
      setState(prev => ({
        ...prev,
        error: authError.fairy_message || authError.message || 'Onboarding check failed'
      }));
      throw error;
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const user = await authService.getCurrentUser();

      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        error: null
      }));
    } catch (error) {
      // If refresh fails, user might be logged out
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        error: null
      }));
    }
  }, []);

  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    handleCallback,
    logout,
    updateProfile,
    completeOnboarding,
    checkOnboardingRenewal,
    refreshUser,
    clearError
  };
};

// Utility hooks for specific auth scenarios
export const useAuthRedirect = (redirectTo: string = '/dashboard') => {
  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, redirectTo]);

  return { isRedirecting: !isLoading && isAuthenticated };
};

export const useRequireAuth = (redirectTo: string = '/login') => {
  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, redirectTo]);

  return { isAuthorized: !isLoading && isAuthenticated };
};

export const useOnboardingStatus = () => {
  const { user, checkOnboardingRenewal } = useAuthContext();
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    completed: false,
    needs_renewal: false,
    days_since_last: 0,
    is_required: false
  });

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return;

      try {
        const renewalStatus = await checkOnboardingRenewal();

        setOnboardingState({
          completed: user.onboarding_completed,
          needs_renewal: renewalStatus.needs_renewal,
          days_since_last: renewalStatus.days_since_last,
          is_required: !user.onboarding_completed || renewalStatus.needs_renewal
        });
      } catch (error) {
        // Fallback to user data only
        setOnboardingState({
          completed: user.onboarding_completed,
          needs_renewal: false,
          days_since_last: 0,
          is_required: !user.onboarding_completed
        });
      }
    };

    checkStatus();
  }, [user, checkOnboardingRenewal]);

  return onboardingState;
};

export const useSessionExpiry = () => {
  const { sessionExpiry, refreshUser } = useAuthContext();
  const [minutesUntilExpiry, setMinutesUntilExpiry] = useState<number | null>(null);

  useEffect(() => {
    if (!sessionExpiry) return;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = sessionExpiry - now;

      if (remaining <= 0) {
        setMinutesUntilExpiry(0);
        // Attempt to refresh
        refreshUser();
      } else {
        setMinutesUntilExpiry(Math.floor(remaining / (1000 * 60)));
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [sessionExpiry, refreshUser]);

  return {
    minutesUntilExpiry,
    isExpiringSoon: minutesUntilExpiry !== null && minutesUntilExpiry <= 5,
    isExpired: minutesUntilExpiry === 0
  };
};