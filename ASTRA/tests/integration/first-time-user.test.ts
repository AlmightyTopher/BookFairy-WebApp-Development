import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

/**
 * Integration Tests for First-Time User Complete Flow
 *
 * These tests validate the complete user journey from landing to onboarding
 * Tests MUST FAIL until the complete flow is implemented
 */

describe('First-Time User Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage to simulate first-time user
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Complete First-Time User Journey', () => {
    it('should complete full first-time user flow from landing to dashboard', async () => {
      // This test MUST FAIL until the complete application flow is implemented
      const { App } = await import('@/App');

      render(<App />);

      // Step 1: Should start on landing page for unauthenticated user
      const landingPage = screen.getByTestId('landing-page');
      expect(landingPage).toBeInTheDocument();

      const fairyCharacter = screen.getByTestId('fairy-character');
      expect(fairyCharacter).toBeInTheDocument();
      expect(fairyCharacter).toHaveAttribute('data-animation-state', 'flying');

      // Step 2: Fairy should deliver welcome message
      await waitFor(() => {
        const welcomeMessage = screen.getByTestId('typewriter-bubble');
        expect(welcomeMessage).toBeInTheDocument();
        expect(welcomeMessage).toHaveTextContent(/well honey.*welcome.*bookfairy/i);
      }, { timeout: 3000 });

      // Step 3: User clicks sign in with Google
      const googleOAuthButton = screen.getByTestId('google-oauth-button');
      expect(googleOAuthButton).toBeInTheDocument();

      fireEvent.click(googleOAuthButton);

      // Step 4: Should initiate OAuth flow
      await waitFor(() => {
        expect(googleOAuthButton).toHaveClass('oauth-loading');
      });

      // Mock successful OAuth return
      // This would normally happen via redirect, but we'll simulate it
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User'
      };

      const mockSession = {
        access_token: 'mock-token',
        user: mockUser
      };

      // Simulate OAuth callback success
      vi.mocked(window.dispatchEvent)(new CustomEvent('oauth-success', {
        detail: { user: mockUser, session: mockSession }
      }));

      // Step 5: Should detect first-time user and start onboarding
      await waitFor(() => {
        const onboardingFlow = screen.getByTestId('onboarding-flow');
        expect(onboardingFlow).toBeInTheDocument();
      }, { timeout: 2000 });

      // Step 6: PWA Installation prompt
      const pwaInstaller = screen.getByTestId('pwa-installer');
      expect(pwaInstaller).toBeInTheDocument();
      expect(pwaInstaller).toHaveTextContent(/install.*app/i);

      const skipPWAButton = screen.getByTestId('skip-pwa-button');
      fireEvent.click(skipPWAButton);

      // Step 7: Notification setup
      await waitFor(() => {
        const notificationSetup = screen.getByTestId('notification-setup');
        expect(notificationSetup).toBeInTheDocument();
      });

      const enableNotificationsButton = screen.getByTestId('enable-notifications-button');
      fireEvent.click(enableNotificationsButton);

      // Step 8: Onboarding quiz/preferences
      await waitFor(() => {
        const onboardingQuiz = screen.getByTestId('onboarding-quiz');
        expect(onboardingQuiz).toBeInTheDocument();
      });

      // Fill out preference form
      const genreCheckboxes = screen.getAllByTestId(/genre-checkbox-/);
      fireEvent.click(genreCheckboxes[0]); // Select first genre
      fireEvent.click(genreCheckboxes[2]); // Select third genre

      const authorInput = screen.getByTestId('favorite-authors-input');
      fireEvent.change(authorInput, { target: { value: 'Stephen King, Agatha Christie' } });

      const submitPreferencesButton = screen.getByTestId('submit-preferences-button');
      fireEvent.click(submitPreferencesButton);

      // Step 9: Should transition to main dashboard
      await waitFor(() => {
        const dashboard = screen.getByTestId('dashboard-page');
        expect(dashboard).toBeInTheDocument();
      }, { timeout: 3000 });

      // Step 10: Should show welcome panel for new user
      const welcomePanel = screen.getByTestId('welcome-panel');
      expect(welcomePanel).toBeInTheDocument();
      expect(welcomePanel).toHaveTextContent(/welcome.*test user/i);

      // Step 11: Should show empty library state
      const libraryView = screen.getByTestId('library-view');
      expect(libraryView).toBeInTheDocument();

      const emptyLibraryMessage = screen.getByTestId('empty-library-message');
      expect(emptyLibraryMessage).toBeInTheDocument();
      expect(emptyLibraryMessage).toHaveTextContent(/no books.*yet/i);

      // Step 12: Should prompt to start discovery
      const startDiscoveryButton = screen.getByTestId('start-discovery-button');
      expect(startDiscoveryButton).toBeInTheDocument();

      fireEvent.click(startDiscoveryButton);

      // Step 13: Should navigate to discovery page with readar
      await waitFor(() => {
        const discoveryPage = screen.getByTestId('discovery-page');
        expect(discoveryPage).toBeInTheDocument();
      });

      const readarEngine = screen.getByTestId('readar-engine');
      expect(readarEngine).toBeInTheDocument();

      // Step 14: Should show onboarding completed in localStorage
      expect(localStorage.getItem('bookfairy_onboarding_completed')).toBe('true');
      expect(localStorage.getItem('bookfairy_last_onboarding_date')).toBeTruthy();
    });

    it('should handle OAuth errors gracefully during first-time flow', async () => {
      const { App } = await import('@/App');

      render(<App />);

      const googleOAuthButton = screen.getByTestId('google-oauth-button');
      fireEvent.click(googleOAuthButton);

      // Simulate OAuth error
      vi.mocked(window.dispatchEvent)(new CustomEvent('oauth-error', {
        detail: { error: 'OAuth configuration error' }
      }));

      await waitFor(() => {
        const errorMessage = screen.getByTestId('oauth-error');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveTextContent(/oauth configuration error/i);

        const fairyErrorMessage = screen.getByTestId('fairy-error-message');
        expect(fairyErrorMessage).toHaveTextContent(/well sugar.*something went wrong/i);
      });

      // Should show retry option
      const retryButton = screen.getByTestId('oauth-retry-button');
      expect(retryButton).toBeInTheDocument();
    });

    it('should persist onboarding state across page refreshes', async () => {
      const { App } = await import('@/App');

      // Start onboarding
      render(<App />);

      const googleOAuthButton = screen.getByTestId('google-oauth-button');
      fireEvent.click(googleOAuthButton);

      // Mock successful auth
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User'
      };

      vi.mocked(window.dispatchEvent)(new CustomEvent('oauth-success', {
        detail: { user: mockUser, session: { access_token: 'token' } }
      }));

      await waitFor(() => {
        const onboardingFlow = screen.getByTestId('onboarding-flow');
        expect(onboardingFlow).toBeInTheDocument();
      });

      // Complete PWA step
      const skipPWAButton = screen.getByTestId('skip-pwa-button');
      fireEvent.click(skipPWAButton);

      // Simulate page refresh during onboarding
      const { unmount } = render(<App />);
      unmount();

      // Re-render app (simulating refresh)
      render(<App />);

      // Should resume from notification setup step
      await waitFor(() => {
        const notificationSetup = screen.getByTestId('notification-setup');
        expect(notificationSetup).toBeInTheDocument();
      });
    });
  });

  describe('Fairy Character Integration During Onboarding', () => {
    it('should show contextual fairy messages throughout onboarding', async () => {
      const { App } = await import('@/App');

      render(<App />);

      // Landing page fairy message
      await waitFor(() => {
        const landingMessage = screen.getByTestId('typewriter-bubble');
        expect(landingMessage).toHaveTextContent(/well honey.*welcome/i);
      });

      // Complete auth flow
      const googleOAuthButton = screen.getByTestId('google-oauth-button');
      fireEvent.click(googleOAuthButton);

      const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test User' };
      vi.mocked(window.dispatchEvent)(new CustomEvent('oauth-success', {
        detail: { user: mockUser, session: { access_token: 'token' } }
      }));

      // Onboarding start fairy message
      await waitFor(() => {
        const onboardingMessage = screen.getByTestId('typewriter-bubble');
        expect(onboardingMessage).toHaveTextContent(/oh my stars.*let's get you set up/i);
      });

      // PWA installation fairy message
      await waitFor(() => {
        const pwaInstaller = screen.getByTestId('pwa-installer');
        expect(pwaInstaller).toBeInTheDocument();

        const pwaMessage = screen.getByTestId('typewriter-bubble');
        expect(pwaMessage).toHaveTextContent(/sugar.*install.*phone/i);
      });

      const skipPWAButton = screen.getByTestId('skip-pwa-button');
      fireEvent.click(skipPWAButton);

      // Notification setup fairy message
      await waitFor(() => {
        const notificationMessage = screen.getByTestId('typewriter-bubble');
        expect(notificationMessage).toHaveTextContent(/honey.*notifications.*new books/i);
      });
    });

    it('should synchronize fairy animations with onboarding progress', async () => {
      const { App } = await import('@/App');

      render(<App />);

      const fairyCharacter = screen.getByTestId('fairy-character');

      // Should start flying
      expect(fairyCharacter).toHaveAttribute('data-animation-state', 'flying');

      // Complete auth to start onboarding
      const googleOAuthButton = screen.getByTestId('google-oauth-button');
      fireEvent.click(googleOAuthButton);

      const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test User' };
      vi.mocked(window.dispatchEvent)(new CustomEvent('oauth-success', {
        detail: { user: mockUser, session: { access_token: 'token' } }
      }));

      // Should transition to typing for onboarding message
      await waitFor(() => {
        expect(fairyCharacter).toHaveAttribute('data-animation-state', 'typing');
      }, { timeout: 2000 });

      // Complete onboarding steps
      const skipPWAButton = screen.getByTestId('skip-pwa-button');
      fireEvent.click(skipPWAButton);

      const enableNotificationsButton = screen.getByTestId('enable-notifications-button');
      fireEvent.click(enableNotificationsButton);

      const submitPreferencesButton = screen.getByTestId('submit-preferences-button');
      fireEvent.click(submitPreferencesButton);

      // Should show celebration animation when onboarding completes
      await waitFor(() => {
        expect(fairyCharacter).toHaveClass('fairy-celebrating');
      }, { timeout: 3000 });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors during onboarding', async () => {
      const { App } = await import('@/App');

      // Mock network error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      render(<App />);

      const googleOAuthButton = screen.getByTestId('google-oauth-button');
      fireEvent.click(googleOAuthButton);

      await waitFor(() => {
        const networkError = screen.getByTestId('network-error');
        expect(networkError).toBeInTheDocument();
        expect(networkError).toHaveTextContent(/network error/i);

        const fairyErrorMessage = screen.getByTestId('typewriter-bubble');
        expect(fairyErrorMessage).toHaveTextContent(/well sugar.*connection trouble/i);
      });
    });

    it('should handle interrupted onboarding flow', async () => {
      const { App } = await import('@/App');

      render(<App />);

      // Start onboarding
      const googleOAuthButton = screen.getByTestId('google-oauth-button');
      fireEvent.click(googleOAuthButton);

      const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test User' };
      vi.mocked(window.dispatchEvent)(new CustomEvent('oauth-success', {
        detail: { user: mockUser, session: { access_token: 'token' } }
      }));

      await waitFor(() => {
        const onboardingFlow = screen.getByTestId('onboarding-flow');
        expect(onboardingFlow).toBeInTheDocument();
      });

      // Simulate user closing tab/browser during onboarding
      const beforeUnloadEvent = new Event('beforeunload');
      window.dispatchEvent(beforeUnloadEvent);

      // Should save onboarding progress
      expect(localStorage.getItem('bookfairy_onboarding_step')).toBeTruthy();
      expect(localStorage.getItem('bookfairy_onboarding_interrupted')).toBe('true');
    });

    it('should handle user skipping entire onboarding', async () => {
      const { App } = await import('@/App');

      render(<App />);

      // Complete auth
      const googleOAuthButton = screen.getByTestId('google-oauth-button');
      fireEvent.click(googleOAuthButton);

      const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test User' };
      vi.mocked(window.dispatchEvent)(new CustomEvent('oauth-success', {
        detail: { user: mockUser, session: { access_token: 'token' } }
      }));

      await waitFor(() => {
        const onboardingFlow = screen.getByTestId('onboarding-flow');
        expect(onboardingFlow).toBeInTheDocument();
      });

      // Find and click skip onboarding button
      const skipOnboardingButton = screen.getByTestId('skip-onboarding-button');
      fireEvent.click(skipOnboardingButton);

      // Should go directly to dashboard with minimal setup
      await waitFor(() => {
        const dashboard = screen.getByTestId('dashboard-page');
        expect(dashboard).toBeInTheDocument();
      });

      // Should mark onboarding as skipped
      expect(localStorage.getItem('bookfairy_onboarding_skipped')).toBe('true');

      // Should show fairy message about skipping
      const fairyMessage = screen.getByTestId('typewriter-bubble');
      expect(fairyMessage).toHaveTextContent(/well honey.*jumped right in/i);
    });
  });

  describe('Accessibility During First-Time Flow', () => {
    it('should maintain accessibility throughout onboarding', async () => {
      const { App } = await import('@/App');

      render(<App />);

      // Landing page accessibility
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent(/bookfairy/i);

      // Auth flow accessibility
      const googleOAuthButton = screen.getByTestId('google-oauth-button');
      expect(googleOAuthButton).toHaveAttribute('aria-label', 'Sign in with Google');

      // Complete auth
      fireEvent.click(googleOAuthButton);

      const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test User' };
      vi.mocked(window.dispatchEvent)(new CustomEvent('oauth-success', {
        detail: { user: mockUser, session: { access_token: 'token' } }
      }));

      // Onboarding accessibility
      await waitFor(() => {
        const onboardingFlow = screen.getByTestId('onboarding-flow');
        expect(onboardingFlow).toHaveAttribute('role', 'dialog');
        expect(onboardingFlow).toHaveAttribute('aria-labelledby', 'onboarding-title');
      });

      // Progress indicator should be accessible
      const progressIndicator = screen.getByTestId('onboarding-progress');
      expect(progressIndicator).toHaveAttribute('role', 'progressbar');
      expect(progressIndicator).toHaveAttribute('aria-valuenow');
      expect(progressIndicator).toHaveAttribute('aria-valuemax');
    });

    it('should support keyboard navigation throughout flow', async () => {
      const { App } = await import('@/App');

      render(<App />);

      // Tab navigation on landing page
      const googleOAuthButton = screen.getByTestId('google-oauth-button');
      googleOAuthButton.focus();
      expect(googleOAuthButton).toHaveFocus();

      // Enter key should trigger OAuth
      fireEvent.keyDown(googleOAuthButton, { key: 'Enter' });

      const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test User' };
      vi.mocked(window.dispatchEvent)(new CustomEvent('oauth-success', {
        detail: { user: mockUser, session: { access_token: 'token' } }
      }));

      // Keyboard navigation in onboarding
      await waitFor(() => {
        const skipPWAButton = screen.getByTestId('skip-pwa-button');
        skipPWAButton.focus();
        expect(skipPWAButton).toHaveFocus();

        fireEvent.keyDown(skipPWAButton, { key: 'Enter' });
      });

      // Continue with keyboard navigation
      await waitFor(() => {
        const enableNotificationsButton = screen.getByTestId('enable-notifications-button');
        enableNotificationsButton.focus();
        expect(enableNotificationsButton).toHaveFocus();
      });
    });
  });
});