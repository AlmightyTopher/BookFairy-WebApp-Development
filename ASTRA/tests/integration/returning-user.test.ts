import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

/**
 * Integration Tests for Returning User with Valid Credentials
 *
 * These tests validate the returning user experience and session management
 * Tests MUST FAIL until the complete flow is implemented
 */

describe('Returning User Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear storage to start fresh
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Returning User with Valid Session', () => {
    it('should automatically authenticate returning user with valid session', async () => {
      // This test MUST FAIL until the complete application flow is implemented

      // Setup: Mock existing valid session
      const mockUser = {
        id: 'user-123',
        email: 'returning@example.com',
        name: 'Returning User'
      };

      const mockSession = {
        access_token: 'valid-token',
        refresh_token: 'valid-refresh-token',
        expires_at: Date.now() + 3600000, // 1 hour from now
        user: mockUser
      };

      // Mock Supabase session
      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === 'supabase.auth.token') {
          return JSON.stringify(mockSession);
        }
        if (key === 'bookfairy_onboarding_completed') {
          return 'true';
        }
        if (key === 'bookfairy_last_onboarding_date') {
          return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago
        }
        return null;
      });

      const { App } = await import('@/App');

      render(<App />);

      // Should skip landing page and go directly to dashboard
      await waitFor(() => {
        const dashboard = screen.getByTestId('dashboard-page');
        expect(dashboard).toBeInTheDocument();
      }, { timeout: 2000 });

      // Should not show onboarding flow
      expect(screen.queryByTestId('onboarding-flow')).not.toBeInTheDocument();

      // Should show user-specific content
      const welcomePanel = screen.getByTestId('welcome-panel');
      expect(welcomePanel).toHaveTextContent(/welcome back.*returning user/i);

      // Should show fairy greeting for returning user
      const fairyMessage = screen.getByTestId('typewriter-bubble');
      expect(fairyMessage).toHaveTextContent(/well honey.*good to see you again/i);

      // Should load user's library
      const libraryView = screen.getByTestId('library-view');
      expect(libraryView).toBeInTheDocument();

      // Should load user's wishlist
      const wishlistQueue = screen.getByTestId('wishlist-queue');
      expect(wishlistQueue).toBeInTheDocument();
    });

    it('should refresh expired session automatically', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'returning@example.com',
        name: 'Returning User'
      };

      // Mock expired session
      const expiredSession = {
        access_token: 'expired-token',
        refresh_token: 'valid-refresh-token',
        expires_at: Date.now() - 3600000, // 1 hour ago
        user: mockUser
      };

      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === 'supabase.auth.token') {
          return JSON.stringify(expiredSession);
        }
        if (key === 'bookfairy_onboarding_completed') {
          return 'true';
        }
        return null;
      });

      // Mock successful refresh
      const refreshedSession = {
        access_token: 'new-token',
        refresh_token: 'new-refresh-token',
        expires_at: Date.now() + 3600000,
        user: mockUser
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(refreshedSession)
      });

      const { App } = await import('@/App');

      render(<App />);

      // Should show loading state during refresh
      const loadingSpinner = screen.getByTestId('auth-loading');
      expect(loadingSpinner).toBeInTheDocument();

      // Should successfully refresh and load dashboard
      await waitFor(() => {
        const dashboard = screen.getByTestId('dashboard-page');
        expect(dashboard).toBeInTheDocument();
      }, { timeout: 3000 });

      // Should update session in storage
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'supabase.auth.token',
        JSON.stringify(refreshedSession)
      );
    });

    it('should handle refresh token failure gracefully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'returning@example.com',
        name: 'Returning User'
      };

      const expiredSession = {
        access_token: 'expired-token',
        refresh_token: 'invalid-refresh-token',
        expires_at: Date.now() - 3600000,
        user: mockUser
      };

      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === 'supabase.auth.token') {
          return JSON.stringify(expiredSession);
        }
        return null;
      });

      // Mock failed refresh
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Invalid refresh token' })
      });

      const { App } = await import('@/App');

      render(<App />);

      // Should fallback to landing page for re-authentication
      await waitFor(() => {
        const landingPage = screen.getByTestId('landing-page');
        expect(landingPage).toBeInTheDocument();
      }, { timeout: 3000 });

      // Should show fairy message about needing to sign in again
      const fairyMessage = screen.getByTestId('typewriter-bubble');
      expect(fairyMessage).toHaveTextContent(/well sugar.*sign in again/i);

      // Should clear invalid session
      expect(localStorage.removeItem).toHaveBeenCalledWith('supabase.auth.token');
    });
  });

  describe('User Library and Wishlist Restoration', () => {
    it('should restore user library and wishlist on return', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'returning@example.com',
        name: 'Returning User'
      };

      const mockSession = {
        access_token: 'valid-token',
        user: mockUser
      };

      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === 'supabase.auth.token') {
          return JSON.stringify(mockSession);
        }
        if (key === 'bookfairy_onboarding_completed') {
          return 'true';
        }
        return null;
      });

      // Mock API responses for user data
      global.fetch = vi.fn().mockImplementation((url) => {
        if (url.includes('/library/books')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              library_items: [
                {
                  id: 'lib-1',
                  book: { title: 'User Library Book 1', author: 'Author 1' },
                  completion_status: 'completed'
                },
                {
                  id: 'lib-2',
                  book: { title: 'User Library Book 2', author: 'Author 2' },
                  completion_status: 'started'
                }
              ],
              library_stats: {
                total_books: 2,
                completed_books: 1,
                total_listening_hours: 25
              }
            })
          });
        }
        if (url.includes('/library/wishlist')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              wishlist_items: [
                {
                  id: 'wish-1',
                  book: { title: 'Wishlist Book 1', author: 'Author 3' },
                  status: 'pending',
                  queue_position: 1,
                  days_remaining: 14
                },
                {
                  id: 'wish-2',
                  book: { title: 'Wishlist Book 2', author: 'Author 4' },
                  status: 'processing',
                  queue_position: 2,
                  days_remaining: 7
                }
              ],
              queue_info: {
                total_items: 2,
                pending_items: 1,
                processing_items: 1
              }
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      const { App } = await import('@/App');

      render(<App />);

      await waitFor(() => {
        const dashboard = screen.getByTestId('dashboard-page');
        expect(dashboard).toBeInTheDocument();
      });

      // Should display library stats
      const libraryStats = screen.getByTestId('library-stats');
      expect(libraryStats).toHaveTextContent(/2 books.*1 completed.*25 hours/i);

      // Should display library items
      expect(screen.getByText('User Library Book 1')).toBeInTheDocument();
      expect(screen.getByText('User Library Book 2')).toBeInTheDocument();

      // Should display wishlist queue
      const wishlistQueue = screen.getByTestId('wishlist-queue');
      expect(wishlistQueue).toBeInTheDocument();
      expect(screen.getByText('Wishlist Book 1')).toBeInTheDocument();
      expect(screen.getByText('Wishlist Book 2')).toBeInTheDocument();

      // Should show queue info
      const queueInfo = screen.getByTestId('queue-summary');
      expect(queueInfo).toHaveTextContent(/2 total.*1 pending.*1 processing/i);
    });

    it('should handle empty library for returning user', async () => {
      const mockUser = {
        id: 'user-new',
        email: 'newuser@example.com',
        name: 'New User'
      };

      const mockSession = {
        access_token: 'valid-token',
        user: mockUser
      };

      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === 'supabase.auth.token') {
          return JSON.stringify(mockSession);
        }
        if (key === 'bookfairy_onboarding_completed') {
          return 'true';
        }
        return null;
      });

      // Mock empty library responses
      global.fetch = vi.fn().mockImplementation((url) => {
        if (url.includes('/library/books')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              library_items: [],
              library_stats: {
                total_books: 0,
                completed_books: 0,
                total_listening_hours: 0
              }
            })
          });
        }
        if (url.includes('/library/wishlist')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              wishlist_items: [],
              queue_info: {
                total_items: 0,
                pending_items: 0,
                processing_items: 0
              }
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      const { App } = await import('@/App');

      render(<App />);

      await waitFor(() => {
        const dashboard = screen.getByTestId('dashboard-page');
        expect(dashboard).toBeInTheDocument();
      });

      // Should show empty state
      const emptyLibraryMessage = screen.getByTestId('empty-library-message');
      expect(emptyLibraryMessage).toBeInTheDocument();

      const emptyWishlistMessage = screen.getByTestId('empty-wishlist-message');
      expect(emptyWishlistMessage).toBeInTheDocument();

      // Should show discovery prompt
      const startDiscoveryButton = screen.getByTestId('start-discovery-button');
      expect(startDiscoveryButton).toBeInTheDocument();

      // Should show appropriate fairy message
      const fairyMessage = screen.getByTestId('typewriter-bubble');
      expect(fairyMessage).toHaveTextContent(/well honey.*let's find some books/i);
    });
  });

  describe('60-Day Onboarding Renewal Check', () => {
    it('should trigger onboarding renewal after 60 days', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'returning@example.com',
        name: 'Returning User'
      };

      const mockSession = {
        access_token: 'valid-token',
        user: mockUser
      };

      // Mock last onboarding date as 65 days ago
      const lastOnboardingDate = new Date(Date.now() - 65 * 24 * 60 * 60 * 1000);

      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === 'supabase.auth.token') {
          return JSON.stringify(mockSession);
        }
        if (key === 'bookfairy_onboarding_completed') {
          return 'true';
        }
        if (key === 'bookfairy_last_onboarding_date') {
          return lastOnboardingDate.toISOString();
        }
        return null;
      });

      const { App } = await import('@/App');

      render(<App />);

      // Should show onboarding renewal instead of dashboard
      await waitFor(() => {
        const onboardingRenewal = screen.getByTestId('onboarding-renewal');
        expect(onboardingRenewal).toBeInTheDocument();
      }, { timeout: 2000 });

      // Should show fairy message about renewal
      const fairyMessage = screen.getByTestId('typewriter-bubble');
      expect(fairyMessage).toHaveTextContent(/well sugar.*been a while.*refresh/i);

      // Should show simplified renewal flow
      const renewalQuiz = screen.getByTestId('renewal-quiz');
      expect(renewalQuiz).toBeInTheDocument();

      // Should have option to skip renewal
      const skipRenewalButton = screen.getByTestId('skip-renewal-button');
      expect(skipRenewalButton).toBeInTheDocument();
    });

    it('should not trigger renewal if within 60-day window', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'returning@example.com',
        name: 'Returning User'
      };

      const mockSession = {
        access_token: 'valid-token',
        user: mockUser
      };

      // Mock last onboarding date as 30 days ago (within 60-day window)
      const lastOnboardingDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === 'supabase.auth.token') {
          return JSON.stringify(mockSession);
        }
        if (key === 'bookfairy_onboarding_completed') {
          return 'true';
        }
        if (key === 'bookfairy_last_onboarding_date') {
          return lastOnboardingDate.toISOString();
        }
        return null;
      });

      const { App } = await import('@/App');

      render(<App />);

      // Should go directly to dashboard
      await waitFor(() => {
        const dashboard = screen.getByTestId('dashboard-page');
        expect(dashboard).toBeInTheDocument();
      }, { timeout: 2000 });

      // Should not show onboarding renewal
      expect(screen.queryByTestId('onboarding-renewal')).not.toBeInTheDocument();
    });

    it('should complete onboarding renewal and update date', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'returning@example.com',
        name: 'Returning User'
      };

      const mockSession = {
        access_token: 'valid-token',
        user: mockUser
      };

      const lastOnboardingDate = new Date(Date.now() - 65 * 24 * 60 * 60 * 1000);

      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === 'supabase.auth.token') {
          return JSON.stringify(mockSession);
        }
        if (key === 'bookfairy_onboarding_completed') {
          return 'true';
        }
        if (key === 'bookfairy_last_onboarding_date') {
          return lastOnboardingDate.toISOString();
        }
        return null;
      });

      const { App } = await import('@/App');

      render(<App />);

      await waitFor(() => {
        const onboardingRenewal = screen.getByTestId('onboarding-renewal');
        expect(onboardingRenewal).toBeInTheDocument();
      });

      // Complete renewal quiz
      const genreCheckboxes = screen.getAllByTestId(/renewal-genre-checkbox-/);
      fireEvent.click(genreCheckboxes[0]);

      const submitRenewalButton = screen.getByTestId('submit-renewal-button');
      fireEvent.click(submitRenewalButton);

      // Should proceed to dashboard
      await waitFor(() => {
        const dashboard = screen.getByTestId('dashboard-page');
        expect(dashboard).toBeInTheDocument();
      }, { timeout: 2000 });

      // Should update last onboarding date
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'bookfairy_last_onboarding_date',
        expect.any(String)
      );

      // Should show fairy completion message
      const fairyMessage = screen.getByTestId('typewriter-bubble');
      expect(fairyMessage).toHaveTextContent(/wonderful.*all set.*another 60 days/i);
    });
  });

  describe('Navigation and Deep Links', () => {
    it('should handle deep links for authenticated users', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'returning@example.com',
        name: 'Returning User'
      };

      const mockSession = {
        access_token: 'valid-token',
        user: mockUser
      };

      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === 'supabase.auth.token') {
          return JSON.stringify(mockSession);
        }
        if (key === 'bookfairy_onboarding_completed') {
          return 'true';
        }
        return null;
      });

      // Mock starting with deep link to discovery page
      Object.defineProperty(window, 'location', {
        value: { pathname: '/discovery' },
        writable: true
      });

      const { App } = await import('@/App');

      render(<App />);

      // Should navigate directly to discovery page
      await waitFor(() => {
        const discoveryPage = screen.getByTestId('discovery-page');
        expect(discoveryPage).toBeInTheDocument();
      }, { timeout: 2000 });

      // Should still load user context
      const readarEngine = screen.getByTestId('readar-engine');
      expect(readarEngine).toBeInTheDocument();
    });

    it('should maintain navigation state across page refreshes', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'returning@example.com',
        name: 'Returning User'
      };

      const mockSession = {
        access_token: 'valid-token',
        user: mockUser
      };

      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === 'supabase.auth.token') {
          return JSON.stringify(mockSession);
        }
        if (key === 'bookfairy_onboarding_completed') {
          return 'true';
        }
        if (key === 'bookfairy_current_page') {
          return 'library';
        }
        return null;
      });

      const { App } = await import('@/App');

      render(<App />);

      // Should restore to library page
      await waitFor(() => {
        const libraryPage = screen.getByTestId('library-page');
        expect(libraryPage).toBeInTheDocument();
      }, { timeout: 2000 });

      // Navigate to discovery
      const discoveryNavLink = screen.getByTestId('nav-discovery');
      fireEvent.click(discoveryNavLink);

      await waitFor(() => {
        const discoveryPage = screen.getByTestId('discovery-page');
        expect(discoveryPage).toBeInTheDocument();
      });

      // Should save navigation state
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'bookfairy_current_page',
        'discovery'
      );
    });
  });

  describe('User Preferences and Settings Restoration', () => {
    it('should restore user theme and accessibility preferences', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'returning@example.com',
        name: 'Returning User'
      };

      const mockSession = {
        access_token: 'valid-token',
        user: mockUser
      };

      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === 'supabase.auth.token') {
          return JSON.stringify(mockSession);
        }
        if (key === 'bookfairy_onboarding_completed') {
          return 'true';
        }
        if (key === 'bookfairy_theme') {
          return 'dark';
        }
        if (key === 'bookfairy_reduced_motion') {
          return 'true';
        }
        if (key === 'bookfairy_high_contrast') {
          return 'true';
        }
        return null;
      });

      const { App } = await import('@/App');

      render(<App />);

      await waitFor(() => {
        const dashboard = screen.getByTestId('dashboard-page');
        expect(dashboard).toBeInTheDocument();
      });

      // Should apply saved theme
      const body = document.body;
      expect(body).toHaveClass('theme-dark');

      // Should apply accessibility preferences
      expect(body).toHaveClass('reduced-motion');
      expect(body).toHaveClass('high-contrast');

      // Fairy animations should respect reduced motion
      const fairyCharacter = screen.getByTestId('fairy-character');
      expect(fairyCharacter).toHaveClass('reduced-motion');
    });

    it('should sync preferences with server on return', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'returning@example.com',
        name: 'Returning User'
      };

      const mockSession = {
        access_token: 'valid-token',
        user: mockUser
      };

      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === 'supabase.auth.token') {
          return JSON.stringify(mockSession);
        }
        if (key === 'bookfairy_onboarding_completed') {
          return 'true';
        }
        return null;
      });

      // Mock user preferences API
      global.fetch = vi.fn().mockImplementation((url) => {
        if (url.includes('/auth/user')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              id: 'user-123',
              email: 'returning@example.com',
              accessibility_preferences: {
                prefers_reduced_motion: true,
                high_contrast_enabled: false
              },
              theme_preference: 'light'
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      const { App } = await import('@/App');

      render(<App />);

      await waitFor(() => {
        const dashboard = screen.getByTestId('dashboard-page');
        expect(dashboard).toBeInTheDocument();
      });

      // Should apply server preferences
      expect(localStorage.setItem).toHaveBeenCalledWith('bookfairy_theme', 'light');
      expect(localStorage.setItem).toHaveBeenCalledWith('bookfairy_reduced_motion', 'true');
      expect(localStorage.setItem).toHaveBeenCalledWith('bookfairy_high_contrast', 'false');
    });
  });
});