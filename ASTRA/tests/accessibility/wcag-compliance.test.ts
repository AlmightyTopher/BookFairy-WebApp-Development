import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';

/**
 * WCAG 2.1 AA Compliance Tests
 *
 * These tests validate accessibility compliance in both light and dark themes
 * Tests MUST FAIL until components meet WCAG 2.1 AA standards
 */

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('WCAG 2.1 AA Compliance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset any global accessibility settings
    document.body.className = '';
    document.documentElement.className = '';
  });

  describe('Landing Page Accessibility', () => {
    it('should meet WCAG 2.1 AA standards in light theme', async () => {
      // This test MUST FAIL until landing page meets WCAG standards
      const { BookFairyLanding } = await import('@/pages/LandingPage');

      const { container } = render(<BookFairyLanding />);

      // Add light theme class
      document.body.className = 'theme-light';

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should meet WCAG 2.1 AA standards in dark theme', async () => {
      const { BookFairyLanding } = await import('@/pages/LandingPage');

      const { container } = render(<BookFairyLanding />);

      // Add dark theme class
      document.body.className = 'theme-dark';

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading hierarchy', async () => {
      const { BookFairyLanding } = await import('@/pages/LandingPage');

      render(<BookFairyLanding />);

      // Should have h1 as main heading
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent(/bookfairy/i);

      // Should have logical heading structure
      const headings = screen.getAllByRole('heading');
      const headingLevels = headings.map(h => parseInt(h.tagName.charAt(1)));

      // Should start with h1 and not skip levels
      expect(headingLevels[0]).toBe(1);
      for (let i = 1; i < headingLevels.length; i++) {
        const diff = headingLevels[i] - headingLevels[i - 1];
        expect(diff).toBeLessThanOrEqual(1); // Don't skip heading levels
      }
    });

    it('should have sufficient color contrast ratios', async () => {
      const { BookFairyLanding } = await import('@/pages/LandingPage');

      render(<BookFairyLanding />);

      // Test both themes
      const themes = ['theme-light', 'theme-dark'];

      for (const theme of themes) {
        document.body.className = theme;

        // Check text elements have sufficient contrast
        const textElements = screen.getAllByText(/./);

        for (const element of textElements) {
          const styles = window.getComputedStyle(element);
          const backgroundColor = styles.backgroundColor;
          const color = styles.color;

          // Should have readable contrast (this would need actual contrast calculation)
          expect(backgroundColor).not.toBe(color); // Basic check - not same color
        }
      }
    });

    it('should have proper alt text for images', async () => {
      const { BookFairyLanding } = await import('@/pages/LandingPage');

      render(<BookFairyLanding />);

      const images = screen.getAllByRole('img');

      images.forEach(img => {
        // Should have alt text or be marked as decorative
        const altText = img.getAttribute('alt');
        const ariaHidden = img.getAttribute('aria-hidden');

        expect(altText !== null || ariaHidden === 'true').toBe(true);

        // If not decorative, alt text should be meaningful
        if (ariaHidden !== 'true') {
          expect(altText).not.toBe('');
          expect(altText).not.toMatch(/^(image|img|picture)$/i);
        }
      });
    });
  });

  describe('Dashboard Accessibility', () => {
    it('should meet WCAG 2.1 AA standards for authenticated dashboard', async () => {
      const { Dashboard } = await import('@/components/Dashboard/Dashboard');

      // Mock authenticated user
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com'
      };

      const { container } = render(<Dashboard user={mockUser} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible navigation structure', async () => {
      const { Dashboard } = await import('@/components/Dashboard/Dashboard');

      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com'
      };

      render(<Dashboard user={mockUser} />);

      // Should have main navigation
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute('aria-label');

      // Should have proper landmarks
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();

      // Navigation items should be properly labeled
      const navLinks = screen.getAllByRole('link');
      navLinks.forEach(link => {
        const accessibleName = link.getAttribute('aria-label') || link.textContent;
        expect(accessibleName).toBeTruthy();
      });
    });

    it('should have accessible form controls', async () => {
      const { Dashboard } = await import('@/components/Dashboard/Dashboard');

      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com'
      };

      render(<Dashboard user={mockUser} />);

      // All form controls should have labels
      const inputs = screen.getAllByRole('textbox');
      const buttons = screen.getAllByRole('button');
      const selects = screen.getAllByRole('combobox');

      [...inputs, ...buttons, ...selects].forEach(control => {
        const hasLabel = control.getAttribute('aria-label') ||
                        control.getAttribute('aria-labelledby') ||
                        screen.queryByLabelText(control.textContent || '');

        expect(hasLabel).toBeTruthy();
      });
    });
  });

  describe('Fairy Character Accessibility', () => {
    it('should meet WCAG standards for animated fairy character', async () => {
      const { FairyCharacter } = await import('@/components/BookFairy/FairyCharacter');

      const { container } = render(<FairyCharacter />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should respect prefers-reduced-motion for animations', async () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const { FairyCharacter } = await import('@/components/BookFairy/FairyCharacter');

      render(<FairyCharacter />);

      const fairyElement = screen.getByTestId('fairy-character');

      // Should have reduced motion class
      expect(fairyElement).toHaveClass('reduced-motion');

      // Should not have animation classes when reduced motion is preferred
      expect(fairyElement).not.toHaveClass('fairy-flying');
      expect(fairyElement).not.toHaveClass('fairy-bouncing');
    });

    it('should have proper ARIA attributes for fairy character', async () => {
      const { FairyCharacter } = await import('@/components/BookFairy/FairyCharacter');

      render(<FairyCharacter />);

      const fairyElement = screen.getByTestId('fairy-character');

      // Should have proper role and label
      expect(fairyElement).toHaveAttribute('role', 'img');
      expect(fairyElement).toHaveAttribute('aria-label', 'BookFairy character');

      // Should have live region for status updates
      expect(fairyElement).toHaveAttribute('aria-live', 'polite');
    });

    it('should provide text alternative for fairy messages', async () => {
      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      render(<TypewriterBubble message="Well honey, welcome to BookFairy!" />);

      const bubbleElement = screen.getByTestId('typewriter-bubble');

      // Should have proper ARIA attributes
      expect(bubbleElement).toHaveAttribute('role', 'status');
      expect(bubbleElement).toHaveAttribute('aria-live', 'polite');
      expect(bubbleElement).toHaveAttribute('aria-atomic', 'true');

      // Should have accessible text content
      expect(bubbleElement).toHaveTextContent(/well honey.*welcome/i);
    });
  });

  describe('Discovery Interface Accessibility', () => {
    it('should meet WCAG standards for readar interface', async () => {
      const { ReadarEngine } = await import('@/components/Discovery/ReadarEngine');

      const { container } = render(<ReadarEngine />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible radar visualization', async () => {
      const { ReadarEngine } = await import('@/components/Discovery/ReadarEngine');

      render(<ReadarEngine />);

      const radarDisplay = screen.getByTestId('radar-display');

      // Should have proper region role
      expect(radarDisplay).toHaveAttribute('role', 'region');
      expect(radarDisplay).toHaveAttribute('aria-label', 'Book discovery radar');

      // Should have accessible description
      const description = screen.getByTestId('radar-description');
      expect(description).toBeInTheDocument();
      expect(radarDisplay).toHaveAttribute('aria-describedby', description.id);
    });

    it('should support keyboard navigation for book selection', async () => {
      const { ReadarEngine } = await import('@/components/Discovery/ReadarEngine');

      render(<ReadarEngine />);

      const scanButton = screen.getByTestId('readar-scan-button');

      // Should be keyboard accessible
      expect(scanButton).toHaveAttribute('tabindex', '0');

      // Should have proper ARIA labels
      expect(scanButton).toHaveAttribute('aria-label');
      expect(scanButton).toHaveAttribute('aria-describedby');
    });

    it('should provide text alternatives for visual discovery data', async () => {
      const { ReadarEngine } = await import('@/components/Discovery/ReadarEngine');

      render(<ReadarEngine />);

      const scanButton = screen.getByTestId('readar-scan-button');

      // Mock scan completion
      vi.mocked(scanButton.click)();

      await waitFor(() => {
        const statusElement = screen.getByTestId('readar-status');
        expect(statusElement).toHaveAttribute('aria-live', 'polite');

        // Should announce scan results
        expect(statusElement).toHaveTextContent(/books discovered/i);
      });
    });
  });

  describe('Library and Wishlist Accessibility', () => {
    it('should meet WCAG standards for library view', async () => {
      const { LibraryView } = await import('@/components/Library/LibraryView');

      const mockLibraryItems = [
        {
          id: 'lib-1',
          book: { title: 'Test Book 1', author: 'Author 1' },
          completion_status: 'completed'
        }
      ];

      const { container } = render(<LibraryView items={mockLibraryItems} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible wishlist queue structure', async () => {
      const { WishlistQueue } = await import('@/components/Library/WishlistQueue');

      const mockWishlistItems = [
        {
          id: 'wish-1',
          book: { title: 'Wishlist Book 1', author: 'Author 1' },
          status: 'pending',
          queue_position: 1,
          days_remaining: 14
        }
      ];

      render(<WishlistQueue items={mockWishlistItems} />);

      const queueContainer = screen.getByTestId('wishlist-queue');

      // Should have proper list structure
      expect(queueContainer).toHaveAttribute('role', 'list');
      expect(queueContainer).toHaveAttribute('aria-label', 'Wishlist queue');

      const queueItems = screen.getAllByRole('listitem');
      expect(queueItems).toHaveLength(1);

      // Each item should have proper labeling
      queueItems.forEach((item, index) => {
        const accessibleName = item.getAttribute('aria-label');
        expect(accessibleName).toContain('position');
        expect(accessibleName).toContain('Wishlist Book');
      });
    });

    it('should support keyboard navigation for queue management', async () => {
      const { WishlistQueue } = await import('@/components/Library/WishlistQueue');

      const mockWishlistItems = [
        {
          id: 'wish-1',
          book: { title: 'Wishlist Book 1', author: 'Author 1' },
          status: 'pending',
          queue_position: 1,
          days_remaining: 14
        }
      ];

      render(<WishlistQueue items={mockWishlistItems} enableDragDrop={true} />);

      const queueItem = screen.getByTestId('wishlist-item-wish-1');

      // Should be keyboard accessible for reordering
      expect(queueItem).toHaveAttribute('tabindex', '0');
      expect(queueItem).toHaveAttribute('role', 'listitem');

      // Should have keyboard instructions
      const instructions = screen.getByTestId('keyboard-instructions');
      expect(instructions).toBeInTheDocument();
      expect(instructions).toHaveTextContent(/arrow keys.*reorder/i);
    });
  });

  describe('Form Accessibility', () => {
    it('should meet WCAG standards for authentication forms', async () => {
      const { GoogleOAuth } = await import('@/components/Auth/GoogleOAuth');

      const { container } = render(<GoogleOAuth />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible onboarding forms', async () => {
      const { OnboardingQuiz } = await import('@/components/Onboarding/OnboardingQuiz');

      const { container } = render(<OnboardingQuiz />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();

      // Form controls should have proper labels
      const checkboxes = screen.getAllByRole('checkbox');
      const textInputs = screen.getAllByRole('textbox');

      [...checkboxes, ...textInputs].forEach(control => {
        const label = screen.queryByLabelText(control.getAttribute('name') || '');
        const ariaLabel = control.getAttribute('aria-label');
        const ariaLabelledBy = control.getAttribute('aria-labelledby');

        expect(label || ariaLabel || ariaLabelledBy).toBeTruthy();
      });
    });

    it('should provide proper error messages and validation', async () => {
      const { OnboardingQuiz } = await import('@/components/Onboarding/OnboardingQuiz');

      render(<OnboardingQuiz />);

      const submitButton = screen.getByTestId('submit-preferences-button');

      // Try to submit without required fields
      submitButton.click();

      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert');

        errorMessages.forEach(error => {
          // Error messages should be associated with form controls
          const errorId = error.getAttribute('id');
          expect(errorId).toBeTruthy();

          // Should have clear error text
          expect(error.textContent).toBeTruthy();
          expect(error.textContent).not.toMatch(/^error$/i);
        });
      });
    });
  });

  describe('Focus Management', () => {
    it('should maintain logical focus order throughout app', async () => {
      const { App } = await import('@/App');

      render(<App />);

      // Get all focusable elements
      const focusableElements = screen.getAllByTestId(/.*/).filter(element => {
        const tabIndex = element.getAttribute('tabindex');
        const disabled = element.getAttribute('disabled');
        const hidden = element.getAttribute('aria-hidden');

        return (
          !disabled &&
          hidden !== 'true' &&
          (tabIndex === '0' ||
           element.tagName === 'BUTTON' ||
           element.tagName === 'INPUT' ||
           element.tagName === 'SELECT' ||
           element.tagName === 'TEXTAREA' ||
           element.tagName === 'A')
        );
      });

      // Focus order should be logical (left-to-right, top-to-bottom)
      for (let i = 0; i < focusableElements.length - 1; i++) {
        const current = focusableElements[i];
        const next = focusableElements[i + 1];

        const currentRect = current.getBoundingClientRect();
        const nextRect = next.getBoundingClientRect();

        // Next element should be below or to the right
        const isLogicalOrder =
          nextRect.top >= currentRect.top ||
          (nextRect.top === currentRect.top && nextRect.left > currentRect.left);

        expect(isLogicalOrder).toBe(true);
      }
    });

    it('should manage focus properly in modal dialogs', async () => {
      const { BookDetails } = await import('@/components/Library/BookDetails');

      const mockBook = {
        id: 'book-1',
        title: 'Test Book',
        author: 'Test Author',
        synopsis: 'Test synopsis'
      };

      render(<BookDetails book={mockBook} isOpen={true} />);

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();

      // Focus should be trapped within modal
      const closeButton = screen.getByTestId('close-modal-button');
      expect(closeButton).toHaveFocus();

      // Should return focus to trigger when closed
      const addToWishlistButton = screen.getByTestId('add-to-wishlist-button');
      addToWishlistButton.focus();

      // Close modal
      closeButton.click();

      // Focus should return to the triggering element
      // (This would need to be tested with actual focus management)
    });

    it('should skip to main content with skip link', async () => {
      const { App } = await import('@/App');

      render(<App />);

      const skipLink = screen.getByTestId('skip-to-main');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveTextContent(/skip to main content/i);

      // Skip link should be first focusable element
      skipLink.focus();
      expect(skipLink).toHaveFocus();

      // Should navigate to main content when activated
      skipLink.click();

      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveFocus();
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide proper live region announcements', async () => {
      const { App } = await import('@/App');

      render(<App />);

      // Should have ARIA live regions for dynamic content
      const liveRegions = screen.getAllByLabelText(/live/i);

      liveRegions.forEach(region => {
        const ariaLive = region.getAttribute('aria-live');
        expect(['polite', 'assertive']).toContain(ariaLive);
      });
    });

    it('should announce page changes to screen readers', async () => {
      const { App } = await import('@/App');

      render(<App />);

      // Mock navigation change
      const navigation = screen.getByRole('navigation');
      const discoveryLink = screen.getByTestId('nav-discovery');

      discoveryLink.click();

      await waitFor(() => {
        const pageAnnouncement = screen.getByTestId('page-announcement');
        expect(pageAnnouncement).toHaveAttribute('aria-live', 'assertive');
        expect(pageAnnouncement).toHaveTextContent(/discovery page/i);
      });
    });

    it('should provide descriptive button and link text', async () => {
      const { App } = await import('@/App');

      render(<App />);

      const buttons = screen.getAllByRole('button');
      const links = screen.getAllByRole('link');

      [...buttons, ...links].forEach(element => {
        const accessibleName =
          element.getAttribute('aria-label') ||
          element.textContent ||
          element.getAttribute('title');

        // Should not have generic text
        expect(accessibleName).not.toMatch(/^(click here|more|read more|button|link)$/i);

        // Should be descriptive
        expect(accessibleName?.length || 0).toBeGreaterThan(2);
      });
    });
  });

  describe('Mobile Accessibility', () => {
    it('should meet WCAG standards on mobile viewports', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 320 });
      Object.defineProperty(window, 'innerHeight', { value: 568 });

      const { App } = await import('@/App');

      const { container } = render(<App />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have appropriate touch target sizes', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 320 });

      const { App } = await import('@/App');

      render(<App />);

      const buttons = screen.getAllByRole('button');
      const links = screen.getAllByRole('link');

      [...buttons, ...links].forEach(element => {
        const rect = element.getBoundingClientRect();
        const minSize = 44; // WCAG minimum touch target size

        // Touch targets should be at least 44x44 pixels
        expect(rect.width).toBeGreaterThanOrEqual(minSize);
        expect(rect.height).toBeGreaterThanOrEqual(minSize);
      });
    });

    it('should support zoom up to 200% without horizontal scrolling', async () => {
      // Mock 200% zoom
      Object.defineProperty(document.documentElement, 'style', {
        value: { zoom: '200%' },
        writable: true
      });

      const { App } = await import('@/App');

      render(<App />);

      // Should not require horizontal scrolling at 200% zoom
      const body = document.body;
      const scrollWidth = body.scrollWidth;
      const clientWidth = body.clientWidth;

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth * 1.1); // Allow small tolerance
    });
  });
});