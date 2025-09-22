/**
 * Fairy Character Component
 *
 * Main fairy character with animations, expressions, and interactive behavior
 * for the BookFairy application
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFairy } from '@/hooks/useFairy';
import type { FairyAnimationState, FairyEmotion, FairyPosition } from '@/types';
import './FairyCharacter.css';

export interface FairyCharacterProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  autoShow?: boolean;
  position?: FairyPosition;
  onInteraction?: (type: string, data?: any) => void;
}

export const FairyCharacter: React.FC<FairyCharacterProps> = ({
  className = '',
  size = 'medium',
  interactive = true,
  autoShow = true,
  position,
  onInteraction
}) => {
  const {
    fairy,
    isVisible,
    isAnimating,
    currentMessage,
    isTyping,
    showFairy,
    hideFairy,
    playAnimation,
    sendMessage,
    handleUserInteraction,
    moveTo
  } = useFairy();

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const fairyRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // Auto-show fairy on mount if enabled
  useEffect(() => {
    if (autoShow && !isVisible) {
      showFairy(position);
    }
  }, [autoShow, isVisible, showFairy, position]);

  // Handle position changes
  useEffect(() => {
    if (position && position !== fairy.position) {
      moveTo(position);
    }
  }, [position, fairy.position, moveTo]);

  const handleClick = useCallback(() => {
    if (!interactive) return;

    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    // Reset click count after 2 seconds
    setTimeout(() => setClickCount(0), 2000);

    if (newClickCount === 1) {
      // Single click - wave
      playAnimation('wave');
      const greetings = [
        'Hello there, honey!',
        'Hi sweetie! How can I help?',
        'Well hello, sugar!',
        'Good to see you, dear!',
        'What can I do for you today?'
      ];
      const greeting = greetings[Math.floor(Math.random() * greetings.length)];
      sendMessage(greeting, 'happy');
    } else if (newClickCount === 2) {
      // Double click - bounce
      playAnimation('bounce');
      sendMessage('Oh my, you\'re quite the clicker! 😄', 'playful');
    } else if (newClickCount >= 3) {
      // Triple+ click - special animation
      playAnimation('spin');
      sendMessage('Wheee! That tickles! 🌟', 'excited');
    }

    onInteraction?.('click', { clickCount: newClickCount });
    handleUserInteraction('fairy_clicked', { clicks: newClickCount });
  }, [interactive, clickCount, playAnimation, sendMessage, onInteraction, handleUserInteraction]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (interactive && !isAnimating) {
      playAnimation('float');
    }
    onInteraction?.('hover', { type: 'enter' });
  }, [interactive, isAnimating, playAnimation, onInteraction]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    onInteraction?.('hover', { type: 'leave' });
  }, [onInteraction]);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!interactive) return;

    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current || !fairyRef.current) return;

      const deltaX = moveEvent.clientX - dragStartRef.current.x;
      const deltaY = moveEvent.clientY - dragStartRef.current.y;

      fairyRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;

      if (fairyRef.current) {
        fairyRef.current.style.transform = '';
      }

      playAnimation('land');
      sendMessage('Thanks for the ride, honey!', 'happy');

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    onInteraction?.('drag', { type: 'start' });
  }, [interactive, playAnimation, sendMessage, onInteraction]);

  const getFairyClassName = useCallback(() => {
    const classes = [
      'fairy-character',
      `fairy-character--${size}`,
      `fairy-character--${fairy.position}`,
      `fairy-character--${fairy.emotion}`,
      className
    ];

    if (isVisible) classes.push('fairy-character--visible');
    if (isAnimating) classes.push('fairy-character--animating');
    if (isHovered) classes.push('fairy-character--hovered');
    if (isDragging) classes.push('fairy-character--dragging');
    if (fairy.current_animation !== 'idle') classes.push(`fairy-character--${fairy.current_animation}`);

    return classes.filter(Boolean).join(' ');
  }, [size, fairy.position, fairy.emotion, fairy.current_animation, className, isVisible, isAnimating, isHovered, isDragging]);

  const renderFairyBody = () => (
    <div className="fairy-body">
      <div className="fairy-head">
        <div className="fairy-face">
          <div className="fairy-eyes">
            <div className="fairy-eye fairy-eye--left">
              <div className="fairy-pupil"></div>
            </div>
            <div className="fairy-eye fairy-eye--right">
              <div className="fairy-pupil"></div>
            </div>
          </div>
          <div className="fairy-nose"></div>
          <div className="fairy-mouth">
            <div className="fairy-smile"></div>
          </div>
        </div>
        <div className="fairy-hair">
          <div className="fairy-hair-strand fairy-hair-strand--1"></div>
          <div className="fairy-hair-strand fairy-hair-strand--2"></div>
          <div className="fairy-hair-strand fairy-hair-strand--3"></div>
        </div>
      </div>
      <div className="fairy-body-torso">
        <div className="fairy-dress">
          <div className="fairy-dress-top"></div>
          <div className="fairy-dress-bottom"></div>
        </div>
        <div className="fairy-arms">
          <div className="fairy-arm fairy-arm--left"></div>
          <div className="fairy-arm fairy-arm--right"></div>
        </div>
      </div>
      <div className="fairy-wings">
        <div className="fairy-wing fairy-wing--left">
          <div className="fairy-wing-pattern"></div>
        </div>
        <div className="fairy-wing fairy-wing--right">
          <div className="fairy-wing-pattern"></div>
        </div>
      </div>
    </div>
  );

  const renderMagicEffects = () => (
    <div className="fairy-magic-effects">
      <div className="fairy-sparkles">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`fairy-sparkle fairy-sparkle--${i + 1}`}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${2 + Math.random()}s`
            }}
          >
            ✨
          </div>
        ))}
      </div>
      <div className="fairy-glow"></div>
      <div className="fairy-trail"></div>
    </div>
  );

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={fairyRef}
      className={getFairyClassName()}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleDragStart}
      role={interactive ? "button" : "img"}
      tabIndex={interactive ? 0 : -1}
      aria-label="BookFairy character - your magical reading companion"
      aria-describedby={currentMessage ? "fairy-message" : undefined}
      style={{
        cursor: interactive ? (isDragging ? 'grabbing' : 'grab') : 'default',
        userSelect: 'none'
      }}
    >
      {renderFairyBody()}
      {renderMagicEffects()}

      {/* Message bubble */}
      {currentMessage && (
        <div className="fairy-message-bubble">
          <div className="fairy-message-content" id="fairy-message">
            {isTyping ? (
              <div className="fairy-typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              <p>{fairy.message}</p>
            )}
          </div>
          <div className="fairy-message-tail"></div>
        </div>
      )}

      {/* Animation indicators */}
      {isAnimating && (
        <div className="fairy-animation-indicator">
          <div className={`fairy-animation-effect fairy-animation-effect--${fairy.current_animation}`}></div>
        </div>
      )}
    </div>
  );
};

export default FairyCharacter;