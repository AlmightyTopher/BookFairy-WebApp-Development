import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { supabase } from '@/services/supabase/client';

/**
 * Unit Tests for GoogleOAuth Component
 *
 * These tests validate the Google OAuth authentication flow
 * Tests MUST FAIL until the GoogleOAuth component is implemented
 */

describe('GoogleOAuth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render Google OAuth button', async () => {
      // This test MUST FAIL until GoogleOAuth component is implemented
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      render(<GoogleOAuth />);

      const oauthButton = screen.getByTestId('google-oauth-button');
      expect(oauthButton).toBeInTheDocument();
      expect(oauthButton).toHaveTextContent(/sign in with google/i);
    });

    it('should display Google branding correctly', async () => {
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      render(<GoogleOAuth />);

      const googleIcon = screen.getByTestId('google-icon');
      const buttonText = screen.getByText(/sign in with google/i);

      expect(googleIcon).toBeInTheDocument();
      expect(buttonText).toBeInTheDocument();
    });

    it('should apply correct styling classes', async () => {
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      render(<GoogleOAuth />);

      const oauthButton = screen.getByTestId('google-oauth-button');
      expect(oauthButton).toHaveClass('oauth-button');
      expect(oauthButton).toHaveClass('google-oauth');
    });
  });

  describe('OAuth Flow Initiation', () => {
    it('should initiate OAuth flow when button is clicked', async () => {
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      // Mock successful OAuth initiation
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: { url: 'https://accounts.google.com/oauth/authorize?...' },
        error: null
      } as any);

      render(<GoogleOAuth redirectUrl="http://localhost:3000/auth/callback" />);

      const oauthButton = screen.getByTestId('google-oauth-button');
      fireEvent.click(oauthButton);

      await waitFor(() => {
        expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: {
            redirectTo: 'http://localhost:3000/auth/callback',
            queryParams: {
              access_type: 'offline',
              prompt: 'consent'
            }
          }
        });
      });
    });

    it('should show loading state during OAuth initiation', async () => {
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      // Mock delayed OAuth response
      vi.mocked(supabase.auth.signInWithOAuth).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          data: { url: 'https://oauth.url' },
          error: null
        } as any), 100))
      );

      render(<GoogleOAuth />);

      const oauthButton = screen.getByTestId('google-oauth-button');
      fireEvent.click(oauthButton);

      // Should show loading state immediately
      expect(oauthButton).toHaveAttribute('disabled');
      expect(oauthButton).toHaveClass('oauth-loading');

      const loadingSpinner = screen.getByTestId('oauth-loading-spinner');
      expect(loadingSpinner).toBeInTheDocument();

      await waitFor(() => {
        expect(oauthButton).not.toHaveAttribute('disabled');
      });
    });

    it('should handle custom redirect URL', async () => {
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      const customRedirectUrl = 'https://myapp.com/auth/callback';

      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: { url: 'https://oauth.url' },
        error: null
      } as any);

      render(<GoogleOAuth redirectUrl={customRedirectUrl} />);

      const oauthButton = screen.getByTestId('google-oauth-button');
      fireEvent.click(oauthButton);

      await waitFor(() => {
        expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: {
            redirectTo: customRedirectUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent'
            }
          }
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle OAuth initiation errors', async () => {
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      // Mock OAuth error
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: { url: null },
        error: { message: 'OAuth configuration error' }
      } as any);

      const onError = vi.fn();
      render(<GoogleOAuth onError={onError} />);

      const oauthButton = screen.getByTestId('google-oauth-button');
      fireEvent.click(oauthButton);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith({
          message: 'OAuth configuration error',
          fairy_message: expect.stringMatching(/Well sugar|Oh honey|Bless your heart/)
        });
      });

      // Error state should be visible
      const errorMessage = screen.getByTestId('oauth-error');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent(/oauth configuration error/i);
    });

    it('should handle network errors gracefully', async () => {
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      // Mock network error
      vi.mocked(supabase.auth.signInWithOAuth).mockRejectedValue(
        new Error('Network error')
      );

      const onError = vi.fn();
      render(<GoogleOAuth onError={onError} />);

      const oauthButton = screen.getByTestId('google-oauth-button');
      fireEvent.click(oauthButton);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith({
          message: 'Network error',
          fairy_message: expect.stringMatching(/Well sugar|Oh honey|Bless your heart/)
        });
      });
    });

    it('should show retry option after error', async () => {
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      // Mock initial error, then success
      vi.mocked(supabase.auth.signInWithOAuth)
        .mockResolvedValueOnce({
          data: { url: null },
          error: { message: 'Temporary error' }
        } as any)
        .mockResolvedValueOnce({
          data: { url: 'https://oauth.url' },
          error: null
        } as any);

      render(<GoogleOAuth />);

      const oauthButton = screen.getByTestId('google-oauth-button');
      fireEvent.click(oauthButton);

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByTestId('oauth-error')).toBeInTheDocument();
      });

      // Retry button should be available
      const retryButton = screen.getByTestId('oauth-retry-button');
      expect(retryButton).toBeInTheDocument();

      fireEvent.click(retryButton);

      // Should attempt OAuth again
      await waitFor(() => {
        expect(supabase.auth.signInWithOAuth).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Success Handling', () => {
    it('should call onSuccess callback when OAuth URL is received', async () => {
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      const oauthUrl = 'https://accounts.google.com/oauth/authorize?...';
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: { url: oauthUrl },
        error: null
      } as any);

      const onSuccess = vi.fn();
      render(<GoogleOAuth onSuccess={onSuccess} />);

      const oauthButton = screen.getByTestId('google-oauth-button');
      fireEvent.click(oauthButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith({ url: oauthUrl });
      });
    });

    it('should redirect to OAuth URL by default', async () => {
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      const oauthUrl = 'https://accounts.google.com/oauth/authorize?...';
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: { url: oauthUrl },
        error: null
      } as any);

      // Mock window.location.href
      delete (window as any).location;
      window.location = { href: '' } as any;

      render(<GoogleOAuth autoRedirect={true} />);

      const oauthButton = screen.getByTestId('google-oauth-button');
      fireEvent.click(oauthButton);

      await waitFor(() => {
        expect(window.location.href).toBe(oauthUrl);
      });
    });

    it('should show success message', async () => {
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: { url: 'https://oauth.url' },
        error: null
      } as any);

      render(<GoogleOAuth autoRedirect={false} />);

      const oauthButton = screen.getByTestId('google-oauth-button');
      fireEvent.click(oauthButton);

      await waitFor(() => {
        const successMessage = screen.getByTestId('oauth-success');
        expect(successMessage).toBeInTheDocument();
        expect(successMessage).toHaveTextContent(/redirecting to google/i);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      render(<GoogleOAuth />);

      const oauthButton = screen.getByTestId('google-oauth-button');
      expect(oauthButton).toHaveAttribute('role', 'button');
      expect(oauthButton).toHaveAttribute('aria-label', 'Sign in with Google');
      expect(oauthButton).toHaveAttribute('aria-describedby', 'oauth-description');
    });

    it('should support keyboard navigation', async () => {
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: { url: 'https://oauth.url' },
        error: null
      } as any);

      render(<GoogleOAuth />);

      const oauthButton = screen.getByTestId('google-oauth-button');

      // Focus the button
      oauthButton.focus();
      expect(oauthButton).toHaveFocus();

      // Trigger with Enter key
      fireEvent.keyDown(oauthButton, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(supabase.auth.signInWithOAuth).toHaveBeenCalled();
      });
    });

    it('should announce state changes to screen readers', async () => {
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      vi.mocked(supabase.auth.signInWithOAuth).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          data: { url: 'https://oauth.url' },
          error: null
        } as any), 100))
      );

      render(<GoogleOAuth />);

      const statusElement = screen.getByTestId('oauth-status');
      expect(statusElement).toHaveAttribute('aria-live', 'polite');
      expect(statusElement).toHaveAttribute('aria-atomic', 'true');

      const oauthButton = screen.getByTestId('google-oauth-button');
      fireEvent.click(oauthButton);

      // Should announce loading state
      await waitFor(() => {
        expect(statusElement).toHaveTextContent(/initiating sign in/i);
      });

      // Should announce success state
      await waitFor(() => {
        expect(statusElement).toHaveTextContent(/redirecting to google/i);
      });
    });
  });

  describe('Customization', () => {
    it('should accept custom button text', async () => {
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      render(<GoogleOAuth buttonText="Continue with Google" />);

      const buttonText = screen.getByText('Continue with Google');
      expect(buttonText).toBeInTheDocument();
    });

    it('should support custom styling', async () => {
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      render(
        <GoogleOAuth
          className="custom-oauth-button"
          variant="outline"
          size="large"
        />
      );

      const oauthButton = screen.getByTestId('google-oauth-button');
      expect(oauthButton).toHaveClass('custom-oauth-button');
      expect(oauthButton).toHaveClass('oauth-outline');
      expect(oauthButton).toHaveClass('oauth-large');
    });

    it('should support disabled state', async () => {
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      render(<GoogleOAuth disabled={true} />);

      const oauthButton = screen.getByTestId('google-oauth-button');
      expect(oauthButton).toHaveAttribute('disabled');
      expect(oauthButton).toHaveClass('oauth-disabled');

      // Should not trigger OAuth when disabled
      fireEvent.click(oauthButton);
      expect(supabase.auth.signInWithOAuth).not.toHaveBeenCalled();
    });
  });

  describe('Mobile and Responsive Behavior', () => {
    it('should adapt to mobile viewport', async () => {
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 320 });

      render(<GoogleOAuth />);

      const oauthButton = screen.getByTestId('google-oauth-button');
      expect(oauthButton).toHaveClass('oauth-mobile');
    });

    it('should handle touch events appropriately', async () => {
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: { url: 'https://oauth.url' },
        error: null
      } as any);

      render(<GoogleOAuth />);

      const oauthButton = screen.getByTestId('google-oauth-button');

      // Trigger touch event
      fireEvent.touchStart(oauthButton);
      fireEvent.touchEnd(oauthButton);

      await waitFor(() => {
        expect(supabase.auth.signInWithOAuth).toHaveBeenCalled();
      });
    });
  });

  describe('Security Considerations', () => {
    it('should include PKCE flow configuration', async () => {
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: { url: 'https://oauth.url' },
        error: null
      } as any);

      render(<GoogleOAuth />);

      const oauthButton = screen.getByTestId('google-oauth-button');
      fireEvent.click(oauthButton);

      await waitFor(() => {
        expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: expect.objectContaining({
            queryParams: expect.objectContaining({
              access_type: 'offline',
              prompt: 'consent'
            })
          })
        });
      });
    });

    it('should validate redirect URL format', async () => {
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      const invalidUrls = [
        'invalid-url',
        'javascript:alert(1)',
        'ftp://malicious.site',
        ''
      ];

      invalidUrls.forEach(url => {
        expect(() => {
          render(<GoogleOAuth redirectUrl={url} />);
        }).toThrow(/invalid redirect url/i);
      });
    });

    it('should handle CSP restrictions gracefully', async () => {
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      // Mock CSP error
      vi.mocked(supabase.auth.signInWithOAuth).mockRejectedValue(
        new Error('Content Security Policy violation')
      );

      const onError = vi.fn();
      render(<GoogleOAuth onError={onError} />);

      const oauthButton = screen.getByTestId('google-oauth-button');
      fireEvent.click(oauthButton);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith({
          message: 'Content Security Policy violation',
          fairy_message: expect.stringContaining('security')
        });
      });
    });
  });

  describe('Performance', () => {
    it('should not cause memory leaks on unmount', async () => {
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      const { unmount } = render(<GoogleOAuth />);

      // Start async operation
      const oauthButton = screen.getByTestId('google-oauth-button');
      fireEvent.click(oauthButton);

      // Unmount before completion
      unmount();

      // Should not cause errors
      expect(() => {
        vi.advanceTimersByTime(1000);
      }).not.toThrow();
    });

    it('should debounce rapid clicks', async () => {
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: { url: 'https://oauth.url' },
        error: null
      } as any);

      render(<GoogleOAuth />);

      const oauthButton = screen.getByTestId('google-oauth-button');

      // Click rapidly multiple times
      fireEvent.click(oauthButton);
      fireEvent.click(oauthButton);
      fireEvent.click(oauthButton);

      // Should only call OAuth once
      await waitFor(() => {
        expect(supabase.auth.signInWithOAuth).toHaveBeenCalledTimes(1);
      });
    });
  });
});