import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

/**
 * Unit Tests for TypewriterBubble Component
 *
 * These tests validate the typewriter effect synchronization and behavior
 * Tests MUST FAIL until the TypewriterBubble component is implemented
 */

describe('TypewriterBubble Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Rendering and Props', () => {
    it('should render with basic message', async () => {
      // This test MUST FAIL until TypewriterBubble component is implemented
      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      render(<TypewriterBubble message="Hello, sugar!" />);

      const bubbleElement = screen.getByTestId('typewriter-bubble');
      expect(bubbleElement).toBeInTheDocument();
      expect(bubbleElement).toHaveClass('speech-bubble');
    });

    it('should handle empty message gracefully', async () => {
      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      render(<TypewriterBubble message="" />);

      const bubbleElement = screen.getByTestId('typewriter-bubble');
      expect(bubbleElement).toBeInTheDocument();
      expect(bubbleElement).toHaveClass('bubble-empty');
    });

    it('should accept custom styling props', async () => {
      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      render(
        <TypewriterBubble
          message="Styled message"
          bubbleStyle="southern-charm"
          size="large"
        />
      );

      const bubbleElement = screen.getByTestId('typewriter-bubble');
      expect(bubbleElement).toHaveClass('bubble-southern-charm');
      expect(bubbleElement).toHaveClass('bubble-large');
    });
  });

  describe('Typewriter Animation', () => {
    it('should animate text character by character', async () => {
      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      const message = "Well honey, bless your heart!";
      render(<TypewriterBubble message={message} speed={50} />);

      const textElement = screen.getByTestId('typewriter-text');

      // Initially should be empty or have cursor
      expect(textElement.textContent).toBe('');

      // Advance time to see first character
      vi.advanceTimersByTime(50);
      await waitFor(() => {
        expect(textElement.textContent).toBe('W');
      });

      // Advance time to see more characters
      vi.advanceTimersByTime(250); // 5 more characters
      await waitFor(() => {
        expect(textElement.textContent).toBe('Well h');
      });

      // Advance to completion
      vi.advanceTimersByTime(message.length * 50);
      await waitFor(() => {
        expect(textElement.textContent).toBe(message);
      });
    });

    it('should respect custom typing speed', async () => {
      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      const message = "Fast typing";
      render(<TypewriterBubble message={message} speed={10} />);

      const textElement = screen.getByTestId('typewriter-text');

      // With speed=10, should see characters faster
      vi.advanceTimersByTime(50); // 5 characters at 10ms each
      await waitFor(() => {
        expect(textElement.textContent).toBe('Fast ');
      });
    });

    it('should handle variable speed for punctuation', async () => {
      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      const message = "Well, sugar... how are you?";
      render(<TypewriterBubble message={message} speed={50} punctuationDelay={200} />);

      const textElement = screen.getByTestId('typewriter-text');

      // Type until first comma
      vi.advanceTimersByTime(200); // 4 characters + comma
      await waitFor(() => {
        expect(textElement.textContent).toBe('Well,');
      });

      // Comma should add extra delay
      vi.advanceTimersByTime(200); // punctuation delay
      vi.advanceTimersByTime(50);  // next character
      await waitFor(() => {
        expect(textElement.textContent).toBe('Well, ');
      });
    });

    it('should show blinking cursor during typing', async () => {
      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      render(<TypewriterBubble message="Test cursor" showCursor={true} />);

      const cursorElement = screen.getByTestId('typewriter-cursor');
      expect(cursorElement).toBeInTheDocument();
      expect(cursorElement).toHaveClass('cursor-blink');

      // Cursor should be visible during typing
      expect(cursorElement).toHaveClass('cursor-visible');
    });

    it('should hide cursor after completion', async () => {
      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      const message = "Done";
      render(<TypewriterBubble message={message} speed={10} showCursor={true} />);

      const cursorElement = screen.getByTestId('typewriter-cursor');

      // Complete the animation
      vi.advanceTimersByTime(message.length * 10 + 100);

      await waitFor(() => {
        expect(cursorElement).not.toHaveClass('cursor-visible');
      });
    });
  });

  describe('Synchronization with FairyCharacter', () => {
    it('should call onTypingStart when animation begins', async () => {
      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      const onTypingStart = vi.fn();
      render(
        <TypewriterBubble
          message="Sync test"
          onTypingStart={onTypingStart}
        />
      );

      await waitFor(() => {
        expect(onTypingStart).toHaveBeenCalledOnce();
      });
    });

    it('should call onTypingComplete when animation finishes', async () => {
      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      const onTypingComplete = vi.fn();
      const message = "Complete";

      render(
        <TypewriterBubble
          message={message}
          speed={10}
          onTypingComplete={onTypingComplete}
        />
      );

      // Complete the animation
      vi.advanceTimersByTime(message.length * 10 + 100);

      await waitFor(() => {
        expect(onTypingComplete).toHaveBeenCalledOnce();
        expect(onTypingComplete).toHaveBeenCalledWith(message.length * 10);
      });
    });

    it('should provide accurate duration calculation', async () => {
      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      const message = "Duration test, with punctuation!";
      const speed = 50;
      const punctuationDelay = 200;

      const onTypingComplete = vi.fn();

      render(
        <TypewriterBubble
          message={message}
          speed={speed}
          punctuationDelay={punctuationDelay}
          onTypingComplete={onTypingComplete}
        />
      );

      // Calculate expected duration
      const commas = (message.match(/,/g) || []).length;
      const exclamations = (message.match(/!/g) || []).length;
      const expectedDuration = (message.length * speed) + ((commas + exclamations) * punctuationDelay);

      vi.advanceTimersByTime(expectedDuration + 100);

      await waitFor(() => {
        expect(onTypingComplete).toHaveBeenCalledWith(expect.closeTo(expectedDuration, 50));
      });
    });

    it('should handle restart during typing', async () => {
      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      const { rerender } = render(<TypewriterBubble message="First message" speed={50} />);

      const textElement = screen.getByTestId('typewriter-text');

      // Start typing first message
      vi.advanceTimersByTime(200);
      await waitFor(() => {
        expect(textElement.textContent).toBe('Firs');
      });

      // Change to new message mid-typing
      rerender(<TypewriterBubble message="New message" speed={50} />);

      // Should restart with new message
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        expect(textElement.textContent).toBe('Ne');
      });
    });
  });

  describe('Southern Fairy Personality', () => {
    it('should apply southern charm styling', async () => {
      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      render(
        <TypewriterBubble
          message="Well, sugar!"
          fairyPersonality="southern-charm"
        />
      );

      const bubbleElement = screen.getByTestId('typewriter-bubble');
      expect(bubbleElement).toHaveClass('fairy-southern-charm');
    });

    it('should handle fairy expressions appropriately', async () => {
      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      const expressions = [
        "Well honey",
        "Bless your heart",
        "Oh sugar",
        "My stars"
      ];

      expressions.forEach(expression => {
        const { unmount } = render(<TypewriterBubble message={expression} />);

        const bubbleElement = screen.getByTestId('typewriter-bubble');
        expect(bubbleElement).toHaveClass('fairy-expression');

        unmount();
      });
    });

    it('should add appropriate emphasis to fairy phrases', async () => {
      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      render(<TypewriterBubble message="Well honey, that's just wonderful!" />);

      const textElement = screen.getByTestId('typewriter-text');

      // Complete animation
      vi.advanceTimersByTime(5000);

      await waitFor(() => {
        const emphasisElements = textElement.querySelectorAll('.fairy-emphasis');
        expect(emphasisElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Responsive Design and Accessibility', () => {
    it('should adapt to mobile screen sizes', async () => {
      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 320 });

      render(<TypewriterBubble message="Mobile test" />);

      const bubbleElement = screen.getByTestId('typewriter-bubble');
      expect(bubbleElement).toHaveClass('bubble-mobile');
    });

    it('should respect prefers-reduced-motion', async () => {
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

      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      render(<TypewriterBubble message="Reduced motion test" />);

      const textElement = screen.getByTestId('typewriter-text');

      // With reduced motion, text should appear immediately
      await waitFor(() => {
        expect(textElement.textContent).toBe('Reduced motion test');
      });
    });

    it('should have proper ARIA attributes', async () => {
      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      render(<TypewriterBubble message="Accessibility test" />);

      const bubbleElement = screen.getByTestId('typewriter-bubble');
      expect(bubbleElement).toHaveAttribute('role', 'status');
      expect(bubbleElement).toHaveAttribute('aria-live', 'polite');
      expect(bubbleElement).toHaveAttribute('aria-atomic', 'true');
    });

    it('should announce completed message to screen readers', async () => {
      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      render(<TypewriterBubble message="Screen reader test" speed={10} />);

      const textElement = screen.getByTestId('typewriter-text');

      // Complete animation
      vi.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(textElement).toHaveAttribute('aria-label', 'BookFairy says: Screen reader test');
      });
    });
  });

  describe('Performance and Optimization', () => {
    it('should cleanup timers on unmount', async () => {
      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      const { unmount } = render(<TypewriterBubble message="Cleanup test" speed={50} />);

      // Start animation
      vi.advanceTimersByTime(100);

      // Unmount before completion
      unmount();

      // Advance timers - should not cause errors
      expect(() => {
        vi.advanceTimersByTime(1000);
      }).not.toThrow();
    });

    it('should handle rapid message changes efficiently', async () => {
      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      const { rerender } = render(<TypewriterBubble message="Message 1" />);

      // Rapidly change messages
      for (let i = 2; i <= 10; i++) {
        rerender(<TypewriterBubble message={`Message ${i}`} />);
      }

      const textElement = screen.getByTestId('typewriter-text');

      // Should eventually show the last message
      vi.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(textElement.textContent).toContain('Message 10');
      });
    });

    it('should maintain 60fps during animation', async () => {
      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      render(<TypewriterBubble message="Performance test with a longer message" speed={16} />);

      // Animation should run at reasonable frame rate (16ms = ~60fps)
      const startTime = performance.now();

      vi.advanceTimersByTime(500);

      const elapsed = performance.now() - startTime;
      expect(elapsed).toBeLessThan(100); // Should be very fast in test environment
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed messages gracefully', async () => {
      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      const malformedMessages = [
        null,
        undefined,
        123,
        {},
        [],
      ];

      malformedMessages.forEach((message) => {
        expect(() => {
          render(<TypewriterBubble message={message as any} />);
        }).not.toThrow();
      });
    });

    it('should handle extreme speed values', async () => {
      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      // Very fast
      expect(() => {
        render(<TypewriterBubble message="Fast" speed={0} />);
      }).not.toThrow();

      // Very slow
      expect(() => {
        render(<TypewriterBubble message="Slow" speed={10000} />);
      }).not.toThrow();

      // Negative (should use default)
      const { } = render(<TypewriterBubble message="Negative" speed={-10} />);
      const bubbleElement = screen.getByTestId('typewriter-bubble');
      expect(bubbleElement).toHaveAttribute('data-speed', '50'); // default fallback
    });

    it('should handle component unmount during animation', async () => {
      const { TypewriterBubble } = await import('@/components/BookFairy/TypewriterBubble');

      const onTypingComplete = vi.fn();
      const { unmount } = render(
        <TypewriterBubble
          message="Unmount test"
          speed={50}
          onTypingComplete={onTypingComplete}
        />
      );

      // Start animation
      vi.advanceTimersByTime(100);

      // Unmount before completion
      unmount();

      // onTypingComplete should not be called after unmount
      vi.advanceTimersByTime(1000);
      expect(onTypingComplete).not.toHaveBeenCalled();
    });
  });
});