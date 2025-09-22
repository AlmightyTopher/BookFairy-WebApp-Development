import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/services/supabase/client';

/**
 * Contract Tests for Authentication API
 *
 * These tests validate the authentication service contracts
 * against the OpenAPI specification defined in contracts/auth.yaml
 *
 * Tests MUST FAIL until the auth service is implemented
 */

describe('Auth Contract Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /auth/google - Initiate Google OAuth flow', () => {
    it('should initiate Google OAuth with valid redirect URL', async () => {
      // This test MUST FAIL until GoogleOAuth component is implemented
      const authService = await import('@/services/supabase/auth');

      const result = await authService.initiateGoogleOAuth({
        redirect_url: 'http://localhost:3000/auth/callback'
      });

      expect(result).toBeDefined();
      expect(result.url).toMatch(/^https:\/\/.*google.*oauth/);
      expect(result.state).toBeDefined();
    });

    it('should reject invalid redirect URL with 400 error', async () => {
      const authService = await import('@/services/supabase/auth');

      await expect(
        authService.initiateGoogleOAuth({
          redirect_url: 'invalid-url'
        })
      ).rejects.toThrow('Invalid request parameters');
    });

    it('should require redirect_url parameter', async () => {
      const authService = await import('@/services/supabase/auth');

      await expect(
        authService.initiateGoogleOAuth({} as any)
      ).rejects.toThrow('redirect_url is required');
    });
  });

  describe('POST /auth/callback - Handle Google OAuth callback', () => {
    it('should process OAuth callback with valid code and state', async () => {
      const authService = await import('@/services/supabase/auth');

      const result = await authService.handleOAuthCallback({
        code: 'valid_oauth_code',
        state: 'valid_state_token'
      });

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.id).toBeDefined();
      expect(result.user.email).toMatch(/^.+@.+\..+$/);
      expect(result.session).toBeDefined();
      expect(result.session.access_token).toBeDefined();
      expect(result.requires_onboarding).toBeDefined();
    });

    it('should reject invalid OAuth code with 401 error', async () => {
      const authService = await import('@/services/supabase/auth');

      await expect(
        authService.handleOAuthCallback({
          code: 'invalid_code',
          state: 'valid_state'
        })
      ).rejects.toThrow('Authentication failed');
    });

    it('should require both code and state parameters', async () => {
      const authService = await import('@/services/supabase/auth');

      await expect(
        authService.handleOAuthCallback({
          code: 'valid_code'
        } as any)
      ).rejects.toThrow('state parameter is required');
    });
  });

  describe('GET /auth/user - Get current user profile', () => {
    it('should return authenticated user profile', async () => {
      // Mock authenticated session
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: {
          session: {
            access_token: 'valid_token',
            user: { id: 'user_id', email: 'test@example.com' }
          }
        },
        error: null
      } as any);

      const authService = await import('@/services/supabase/auth');

      const result = await authService.getCurrentUser();

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.email).toMatch(/^.+@.+\..+$/);
      expect(result.hardcover_api_key).toBeDefined();
      expect(result.onboarding_completed).toBeDefined();
    });

    it('should reject unauthenticated requests with 401 error', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null
      } as any);

      const authService = await import('@/services/supabase/auth');

      await expect(authService.getCurrentUser()).rejects.toThrow('Authentication required');
    });
  });

  describe('PATCH /auth/user - Update user profile', () => {
    it('should update user profile with valid data', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: {
          session: {
            access_token: 'valid_token',
            user: { id: 'user_id', email: 'test@example.com' }
          }
        },
        error: null
      } as any);

      const authService = await import('@/services/supabase/auth');

      const result = await authService.updateUserProfile({
        hardcover_api_key: 'new_api_key',
        accessibility_preferences: {
          prefers_reduced_motion: true,
          high_contrast_enabled: false
        }
      });

      expect(result).toBeDefined();
      expect(result.hardcover_api_key).toBe('new_api_key');
      expect(result.accessibility_preferences.prefers_reduced_motion).toBe(true);
    });

    it('should validate hardcover API key format', async () => {
      const authService = await import('@/services/supabase/auth');

      await expect(
        authService.updateUserProfile({
          hardcover_api_key: 'invalid_key_format'
        })
      ).rejects.toThrow('Invalid hardcover API key format');
    });
  });

  describe('POST /auth/logout - Logout user', () => {
    it('should successfully logout authenticated user', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null
      } as any);

      const authService = await import('@/services/supabase/auth');

      const result = await authService.logout();

      expect(result).toBeDefined();
      expect(result.message).toBe('Logout successful');
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle logout errors gracefully', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: new Error('Logout failed')
      } as any);

      const authService = await import('@/services/supabase/auth');

      await expect(authService.logout()).rejects.toThrow('Logout failed');
    });
  });

  describe('Error Response Format', () => {
    it('should return errors in specified format with fairy_message', async () => {
      const authService = await import('@/services/supabase/auth');

      try {
        await authService.initiateGoogleOAuth({
          redirect_url: 'invalid'
        });
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.error).toBeDefined();
        expect(error.message).toBeDefined();
        expect(error.fairy_message).toBeDefined();
        expect(error.fairy_message).toMatch(/Well sugar|Oh honey|Bless your heart/);
      }
    });
  });
});

/**
 * Integration Tests for Authentication Flow
 * These test the complete OAuth flow end-to-end
 */
describe('Auth Integration Contract Tests', () => {
  it('should complete full OAuth flow with valid credentials', async () => {
    const authService = await import('@/services/supabase/auth');

    // Step 1: Initiate OAuth
    const oauthResult = await authService.initiateGoogleOAuth({
      redirect_url: 'http://localhost:3000/auth/callback'
    });

    expect(oauthResult.url).toBeDefined();
    expect(oauthResult.state).toBeDefined();

    // Step 2: Handle callback (mocked)
    const callbackResult = await authService.handleOAuthCallback({
      code: 'mock_auth_code',
      state: oauthResult.state
    });

    expect(callbackResult.user).toBeDefined();
    expect(callbackResult.session).toBeDefined();

    // Step 3: Verify authenticated user can access profile
    const userProfile = await authService.getCurrentUser();
    expect(userProfile.id).toBe(callbackResult.user.id);
  });

  it('should handle authentication state changes', async () => {
    const authService = await import('@/services/supabase/auth');

    let authStateChanges: any[] = [];

    // This should be implemented in the auth service
    authService.onAuthStateChange?.((event, session) => {
      authStateChanges.push({ event, session });
    });

    // Simulate login
    await authService.handleOAuthCallback({
      code: 'valid_code',
      state: 'valid_state'
    });

    // Simulate logout
    await authService.logout();

    expect(authStateChanges).toHaveLength(2);
    expect(authStateChanges[0].event).toBe('SIGNED_IN');
    expect(authStateChanges[1].event).toBe('SIGNED_OUT');
  });
});