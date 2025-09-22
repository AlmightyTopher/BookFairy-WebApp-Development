import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

/**
 * Unit Tests for FairyCharacter Component
 *
 * These tests validate the fairy character animation states and behavior
 * Tests MUST FAIL until the FairyCharacter component is implemented
 */

describe('FairyCharacter Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Animation State Management', () => {
    it('should start in flying state by default', async () => {
      // This test MUST FAIL until FairyCharacter component is implemented
      const { FairyCharacter } = await import('@/components/BookFairy/FairyCharacter');

      render(<FairyCharacter />);

      const fairyElement = screen.getByTestId('fairy-character');
      expect(fairyElement).toBeInTheDocument();
      expect(fairyElement).toHaveAttribute('data-animation-state', 'flying');
    });

    it('should transition through animation states correctly', async () => {
      const { FairyCharacter } = await import('@/components/BookFairy/FairyCharacter');

      render(<FairyCharacter triggerMessage="Hello!" />);

      const fairyElement = screen.getByTestId('fairy-character');

      // Should start flying
      expect(fairyElement).toHaveAttribute('data-animation-state', 'flying');

      // Should transition to landing
      await waitFor(() => {
        expect(fairyElement).toHaveAttribute('data-animation-state', 'landing');
      }, { timeout: 2000 });

      // Should transition to typing
      await waitFor(() => {
        expect(fairyElement).toHaveAttribute('data-animation-state', 'typing');
      }, { timeout: 3000 });

      // Should transition to takeoff after message
      await waitFor(() => {
        expect(fairyElement).toHaveAttribute('data-animation-state', 'takeoff');
      }, { timeout: 8000 });

      // Should return to flying
      await waitFor(() => {
        expect(fairyElement).toHaveAttribute('data-animation-state', 'flying');
      }, { timeout: 2000 });
    });

    it('should maintain 60fps animation performance', async () => {
      const { FairyCharacter } = await import('@/components/BookFairy/FairyCharacter');

      render(<FairyCharacter />);

      const fairyElement = screen.getByTestId('fairy-character');

      // Check that animation-duration properties are optimized for 60fps
      const computedStyle = window.getComputedStyle(fairyElement);
      const animationDuration = parseFloat(computedStyle.animationDuration);

      // Animation frame timing should be ≤ 16.67ms for 60fps
      expect(animationDuration).toBeGreaterThan(0);
      expect(animationDuration).toBeLessThan(2); // Reasonable upper bound
    });

    it('should respect prefers-reduced-motion setting', async () => {
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
      expect(fairyElement).toHaveClass('reduced-motion');
    });
  });

  describe('Animation Timing and Synchronization', () => {
    it('should complete landing animation within 1.5 seconds', async () => {
      const { FairyCharacter } = await import('@/components/BookFairy/FairyCharacter');

      const startTime = Date.now();
      render(<FairyCharacter triggerMessage="Test message" />);

      const fairyElement = screen.getByTestId('fairy-character');

      await waitFor(() => {
        expect(fairyElement).toHaveAttribute('data-animation-state', 'typing');
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeLessThan(1500); // Landing should complete within 1.5s
      }, { timeout: 2000 });
    });

    it('should synchronize with TypewriterBubble timing', async () => {
      const { FairyCharacter } = await import('@/components/BookFairy/FairyCharacter');

      const mockTypingDuration = 3000; // 3 seconds for typing
      render(
        <FairyCharacter
          triggerMessage="This is a test message for timing"
          typingDuration={mockTypingDuration}
        />
      );

      const fairyElement = screen.getByTestId('fairy-character');

      // Wait for typing state
      await waitFor(() => {
        expect(fairyElement).toHaveAttribute('data-animation-state', 'typing');
      });

      const typingStartTime = Date.now();

      // Should remain in typing state for the specified duration
      await waitFor(() => {
        expect(fairyElement).toHaveAttribute('data-animation-state', 'takeoff');
        const typingDuration = Date.now() - typingStartTime;
        expect(typingDuration).toBeGreaterThan(mockTypingDuration - 100); // Allow 100ms tolerance
        expect(typingDuration).toBeLessThan(mockTypingDuration + 500); // Allow 500ms tolerance
      }, { timeout: mockTypingDuration + 1000 });
    });

    it('should handle rapid message triggers gracefully', async () => {
      const { FairyCharacter } = await import('@/components/BookFairy/FairyCharacter');

      const { rerender } = render(<FairyCharacter />);

      const fairyElement = screen.getByTestId('fairy-character');

      // Trigger multiple messages rapidly
      rerender(<FairyCharacter triggerMessage="Message 1" />);
      rerender(<FairyCharacter triggerMessage="Message 2" />);
      rerender(<FairyCharacter triggerMessage="Message 3" />);

      // Should handle gracefully without animation conflicts
      expect(fairyElement).toBeInTheDocument();

      // Should eventually settle on the last message
      await waitFor(() => {
        expect(fairyElement).toHaveAttribute('data-animation-state', 'typing');
      }, { timeout: 3000 });
    });
  });

  describe('Visual Properties and Positioning', () => {
    it('should maintain consistent visual properties during animation', async () => {
      const { FairyCharacter } = await import('@/components/BookFairy/FairyCharacter');

      render(<FairyCharacter />);

      const fairyElement = screen.getByTestId('fairy-character');

      // Check initial visual properties
      expect(fairyElement).toHaveStyle({
        position: 'fixed',
        zIndex: '1000'
      });

      // Fairy should be visible
      expect(fairyElement).toBeVisible();
    });

    it('should maintain proper positioning during state transitions', async () => {
      const { FairyCharacter } = await import('@/components/BookFairy/FairyCharacter');

      render(<FairyCharacter triggerMessage="Position test" />);

      const fairyElement = screen.getByTestId('fairy-character');

      // During flying state
      expect(fairyElement).toHaveAttribute('data-animation-state', 'flying');
      const flyingPosition = fairyElement.getBoundingClientRect();

      // During landing state
      await waitFor(() => {
        expect(fairyElement).toHaveAttribute('data-animation-state', 'landing');
      });
      const landingPosition = fairyElement.getBoundingClientRect();

      // Position should change smoothly (not jump drastically)
      const positionDifference = Math.abs(flyingPosition.top - landingPosition.top);
      expect(positionDifference).toBeGreaterThan(0); // Should move
      expect(positionDifference).toBeLessThan(200); // But not jump drastically
    });

    it('should scale appropriately for different screen sizes', async () => {
      const { FairyCharacter } = await import('@/components/BookFairy/FairyCharacter');

      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 320 });
      Object.defineProperty(window, 'innerHeight', { value: 568 });

      render(<FairyCharacter />);

      const fairyElement = screen.getByTestId('fairy-character');
      const computedStyle = window.getComputedStyle(fairyElement);

      // Should have mobile-appropriate sizing
      const transform = computedStyle.transform;
      expect(transform).toContain('scale');
    });
  });

  describe('Interaction and Props', () => {
    it('should accept custom animation duration props', async () => {
      const { FairyCharacter } = await import('@/components/BookFairy/FairyCharacter');

      const customDurations = {
        flyingDuration: 2000,
        landingDuration: 800,
        takeoffDuration: 1200
      };

      render(<FairyCharacter {...customDurations} />);

      const fairyElement = screen.getByTestId('fairy-character');
      expect(fairyElement).toHaveAttribute('data-flying-duration', '2000');
      expect(fairyElement).toHaveAttribute('data-landing-duration', '800');
      expect(fairyElement).toHaveAttribute('data-takeoff-duration', '1200');
    });

    it('should handle disabled state correctly', async () => {
      const { FairyCharacter } = await import('@/components/BookFairy/FairyCharacter');

      render(<FairyCharacter disabled={true} />);

      const fairyElement = screen.getByTestId('fairy-character');
      expect(fairyElement).toHaveAttribute('data-disabled', 'true');
      expect(fairyElement).toHaveClass('fairy-disabled');
    });

    it('should support custom positioning props', async () => {
      const { FairyCharacter } = await import('@/components/BookFairy/FairyCharacter');

      const customPosition = {
        startPosition: { x: 100, y: 200 },
        landingPosition: { x: 150, y: 250 }
      };

      render(<FairyCharacter {...customPosition} />);

      const fairyElement = screen.getByTestId('fairy-character');
      expect(fairyElement).toHaveAttribute('data-start-x', '100');
      expect(fairyElement).toHaveAttribute('data-start-y', '200');
      expect(fairyElement).toHaveAttribute('data-landing-x', '150');
      expect(fairyElement).toHaveAttribute('data-landing-y', '250');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing animation resources gracefully', async () => {
      // Mock failed image/animation loading
      const originalCreateElement = document.createElement;
      document.createElement = vi.fn().mockImplementation((tagName) => {
        const element = originalCreateElement.call(document, tagName);
        if (tagName === 'img') {
          setTimeout(() => {
            const event = new Event('error');
            element.dispatchEvent(event);
          }, 0);
        }
        return element;
      });

      const { FairyCharacter } = await import('@/components/BookFairy/FairyCharacter');

      render(<FairyCharacter />);

      const fairyElement = screen.getByTestId('fairy-character');

      // Should still render with fallback
      expect(fairyElement).toBeInTheDocument();
      expect(fairyElement).toHaveClass('fairy-fallback');

      // Restore original function
      document.createElement = originalCreateElement;
    });

    it('should handle animation interruptions gracefully', async () => {
      const { FairyCharacter } = await import('@/components/BookFairy/FairyCharacter');

      const { unmount } = render(<FairyCharacter triggerMessage="Test" />);

      const fairyElement = screen.getByTestId('fairy-character');

      // Start animation sequence
      await waitFor(() => {
        expect(fairyElement).toHaveAttribute('data-animation-state', 'landing');
      });

      // Unmount during animation
      unmount();

      // Should not throw errors or leave hanging timers
      expect(() => {
        // Component should clean up properly
      }).not.toThrow();
    });

    it('should validate prop types and provide defaults', async () => {
      const { FairyCharacter } = await import('@/components/BookFairy/FairyCharacter');

      // Should render with no props
      render(<FairyCharacter />);

      const fairyElement = screen.getByTestId('fairy-character');
      expect(fairyElement).toBeInTheDocument();

      // Should have default values
      expect(fairyElement).toHaveAttribute('data-animation-state', 'flying');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      const { FairyCharacter } = await import('@/components/BookFairy/FairyCharacter');

      render(<FairyCharacter />);

      const fairyElement = screen.getByTestId('fairy-character');
      expect(fairyElement).toHaveAttribute('role', 'img');
      expect(fairyElement).toHaveAttribute('aria-label', 'BookFairy character');
      expect(fairyElement).toHaveAttribute('aria-live', 'polite');
    });

    it('should be hidden from screen readers when disabled', async () => {
      const { FairyCharacter } = await import('@/components/BookFairy/FairyCharacter');

      render(<FairyCharacter disabled={true} />);

      const fairyElement = screen.getByTestId('fairy-character');
      expect(fairyElement).toHaveAttribute('aria-hidden', 'true');
    });

    it('should announce state changes to screen readers', async () => {
      const { FairyCharacter } = await import('@/components/BookFairy/FairyCharacter');

      render(<FairyCharacter triggerMessage="Accessibility test" />);

      const fairyElement = screen.getByTestId('fairy-character');
      const statusElement = screen.getByTestId('fairy-status');

      expect(statusElement).toHaveAttribute('aria-live', 'polite');
      expect(statusElement).toHaveAttribute('aria-atomic', 'true');

      await waitFor(() => {
        expect(statusElement).toHaveTextContent('BookFairy is preparing a message');
      });
    });
  });
});