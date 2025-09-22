/**
 * Fairy Character Hook
 *
 * Provides fairy character state management, animation control,
 * contextual messaging, and interactive behavior for BookFairy
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type {
  FairyState,
  FairyMessage,
  FairyAnimationState,
  FairyEmotion,
  FairyPosition,
  UseAsyncState
} from '@/types';
import { useAuthContext } from './useAuth';
import {
  createContextualFairyMessage,
  getRandomFairyMessage,
  FAIRY_ANIMATION_TIMINGS,
  FAIRY_POSITIONS
} from '@/types/FairyState';

export interface FairyHookState {
  fairy: FairyState;
  isVisible: boolean;
  isAnimating: boolean;
  messageQueue: FairyMessage[];
  currentMessage: FairyMessage | null;
  isTyping: boolean;
  error: string | null;
}

export interface FairyActions {
  showFairy: (position?: FairyPosition) => void;
  hideFairy: () => void;
  playAnimation: (animation: FairyAnimationState, duration?: number) => Promise<void>;
  sendMessage: (message: string | FairyMessage, emotion?: FairyEmotion) => void;
  sendContextualMessage: (context: string, data?: Record<string, any>) => void;
  queueMessage: (message: string | FairyMessage) => void;
  clearMessageQueue: () => void;
  moveTo: (position: FairyPosition) => void;
  setEmotion: (emotion: FairyEmotion) => void;
  handleUserInteraction: (interactionType: string, data?: Record<string, any>) => void;
  respondToBookAction: (action: string, bookTitle: string) => void;
  celebrateCompletion: (achievement: string) => void;
  clearError: () => void;
}

export interface UseFairyResult extends FairyHookState, FairyActions {}

export const useFairy = (): UseFairyResult => {
  const { user, isAuthenticated } = useAuthContext();
  const [state, setState] = useState<FairyHookState>({
    fairy: {
      current_animation: 'idle',
      message: '',
      is_typing: false,
      is_visible: true,
      position: 'bottom-right',
      emotion: 'happy',
      last_interaction: new Date().toISOString(),
      message_history: [],
      context_awareness: {
        current_page: 'dashboard',
        user_action: null,
        book_context: null,
        time_of_day: 'day'
      },
      personality_traits: {
        helpfulness: 0.9,
        enthusiasm: 0.8,
        patience: 0.7,
        humor: 0.6
      }
    },
    isVisible: true,
    isAnimating: false,
    messageQueue: [],
    currentMessage: null,
    isTyping: false,
    error: null
  });

  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update context awareness based on current page
  useEffect(() => {
    const updateContext = () => {
      const path = window.location.pathname;
      let currentPage = 'dashboard';

      if (path.includes('/library')) currentPage = 'library';
      else if (path.includes('/wishlist')) currentPage = 'wishlist';
      else if (path.includes('/discovery')) currentPage = 'discovery';
      else if (path.includes('/settings')) currentPage = 'settings';
      else if (path.includes('/onboarding')) currentPage = 'onboarding';

      const hour = new Date().getHours();
      const timeOfDay = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'day' : 'evening';

      setState(prev => ({
        ...prev,
        fairy: {
          ...prev.fairy,
          context_awareness: {
            ...prev.fairy.context_awareness,
            current_page: currentPage,
            time_of_day: timeOfDay
          }
        }
      }));
    };

    updateContext();
    const interval = setInterval(updateContext, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Process message queue
  useEffect(() => {
    if (state.messageQueue.length > 0 && !state.isTyping && !state.currentMessage) {
      processNextMessage();
    }
  }, [state.messageQueue, state.isTyping, state.currentMessage]);

  // Auto-hide fairy after period of inactivity
  useEffect(() => {
    if (!isAuthenticated || !state.isVisible) return;

    const hideTimer = setTimeout(() => {
      if (!state.isAnimating && !state.isTyping) {
        playAnimation('wave').then(() => {
          setState(prev => ({ ...prev, isVisible: false }));
        });
      }
    }, 5 * 60 * 1000); // Hide after 5 minutes of inactivity

    return () => clearTimeout(hideTimer);
  }, [state.fairy.last_interaction, isAuthenticated, state.isVisible, state.isAnimating, state.isTyping]);

  const processNextMessage = useCallback(() => {
    if (state.messageQueue.length === 0) return;

    const nextMessage = state.messageQueue[0];
    setState(prev => ({
      ...prev,
      messageQueue: prev.messageQueue.slice(1),
      currentMessage: nextMessage,
      isTyping: true
    }));

    // Simulate typing
    const typingDuration = Math.min(nextMessage.content.length * 50, 3000); // Max 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      setState(prev => ({
        ...prev,
        fairy: {
          ...prev.fairy,
          message: nextMessage.content,
          emotion: nextMessage.emotion,
          is_typing: false,
          message_history: [...prev.fairy.message_history, nextMessage].slice(-10) // Keep last 10 messages
        },
        isTyping: false
      }));

      // Clear message after duration
      messageTimeoutRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          currentMessage: null,
          fairy: {
            ...prev.fairy,
            message: ''
          }
        }));
      }, nextMessage.duration || 4000);
    }, typingDuration);
  }, [state.messageQueue]);

  const showFairy = useCallback((position: FairyPosition = 'bottom-right') => {
    setState(prev => ({
      ...prev,
      isVisible: true,
      fairy: {
        ...prev.fairy,
        position,
        is_visible: true,
        last_interaction: new Date().toISOString()
      }
    }));

    // Play greeting animation
    playAnimation('wave');
  }, []);

  const hideFairy = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVisible: false,
      fairy: {
        ...prev.fairy,
        is_visible: false
      }
    }));
  }, []);

  const playAnimation = useCallback(async (
    animation: FairyAnimationState,
    duration?: number
  ): Promise<void> => {
    return new Promise((resolve) => {
      setState(prev => ({
        ...prev,
        isAnimating: true,
        fairy: {
          ...prev.fairy,
          current_animation: animation,
          last_interaction: new Date().toISOString()
        }
      }));

      const animationDuration = duration || FAIRY_ANIMATION_TIMINGS[animation] || 1000;

      animationTimeoutRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isAnimating: false,
          fairy: {
            ...prev.fairy,
            current_animation: 'idle'
          }
        }));
        resolve();
      }, animationDuration);
    });
  }, []);

  const sendMessage = useCallback((
    message: string | FairyMessage,
    emotion: FairyEmotion = 'happy'
  ) => {
    const fairyMessage: FairyMessage = typeof message === 'string'
      ? {
          id: `msg_${Date.now()}`,
          content: message,
          emotion,
          timestamp: new Date().toISOString(),
          context: state.fairy.context_awareness.current_page,
          duration: Math.max(2000, message.length * 100) // Minimum 2 seconds
        }
      : message;

    setState(prev => ({
      ...prev,
      messageQueue: [...prev.messageQueue, fairyMessage],
      fairy: {
        ...prev.fairy,
        last_interaction: new Date().toISOString()
      }
    }));

    // Show fairy if hidden
    if (!state.isVisible) {
      showFairy();
    }
  }, [state.fairy.context_awareness.current_page, state.isVisible, showFairy]);

  const sendContextualMessage = useCallback((
    context: string,
    data?: Record<string, any>
  ) => {
    const contextualMessage = createContextualFairyMessage(
      context,
      state.fairy.context_awareness,
      data
    );

    if (contextualMessage) {
      sendMessage(contextualMessage);
    }
  }, [state.fairy.context_awareness, sendMessage]);

  const queueMessage = useCallback((message: string | FairyMessage) => {
    const fairyMessage: FairyMessage = typeof message === 'string'
      ? {
          id: `msg_${Date.now()}`,
          content: message,
          emotion: 'happy',
          timestamp: new Date().toISOString(),
          context: state.fairy.context_awareness.current_page,
          duration: Math.max(2000, message.length * 100)
        }
      : message;

    setState(prev => ({
      ...prev,
      messageQueue: [...prev.messageQueue, fairyMessage]
    }));
  }, [state.fairy.context_awareness.current_page]);

  const clearMessageQueue = useCallback(() => {
    setState(prev => ({
      ...prev,
      messageQueue: [],
      currentMessage: null,
      isTyping: false,
      fairy: {
        ...prev.fairy,
        message: '',
        is_typing: false
      }
    }));

    // Clear timeouts
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = null;
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, []);

  const moveTo = useCallback((position: FairyPosition) => {
    setState(prev => ({
      ...prev,
      fairy: {
        ...prev.fairy,
        position,
        last_interaction: new Date().toISOString()
      }
    }));

    // Play move animation
    playAnimation('float');
  }, [playAnimation]);

  const setEmotion = useCallback((emotion: FairyEmotion) => {
    setState(prev => ({
      ...prev,
      fairy: {
        ...prev.fairy,
        emotion,
        last_interaction: new Date().toISOString()
      }
    }));
  }, []);

  const handleUserInteraction = useCallback((
    interactionType: string,
    data?: Record<string, any>
  ) => {
    setState(prev => ({
      ...prev,
      fairy: {
        ...prev.fairy,
        context_awareness: {
          ...prev.fairy.context_awareness,
          user_action: interactionType
        },
        last_interaction: new Date().toISOString()
      }
    }));

    // Send contextual response
    sendContextualMessage(interactionType, data);

    // Play appropriate animation
    switch (interactionType) {
      case 'book_added':
        playAnimation('celebrate');
        break;
      case 'book_completed':
        playAnimation('cheer');
        break;
      case 'search':
        playAnimation('search');
        break;
      case 'error':
        playAnimation('sad');
        setEmotion('sad');
        break;
      default:
        playAnimation('bounce');
        break;
    }
  }, [sendContextualMessage, playAnimation, setEmotion]);

  const respondToBookAction = useCallback((action: string, bookTitle: string) => {
    const responses = {
      added: [
        `Wonderful choice, honey! "${bookTitle}" looks absolutely delightful!`,
        `Oh my stars, "${bookTitle}" is going to be such a treat! I can hardly wait for you to start!`,
        `Perfect pick, sugar! "${bookTitle}" just joined your magical library!`
      ],
      completed: [
        `Congratulations on finishing "${bookTitle}"! You're such a dedicated reader, honey!`,
        `What an accomplishment! "${bookTitle}" was quite the journey, wasn't it?`,
        `Well done, sugar! I hope "${bookTitle}" was everything you hoped for and more!`
      ],
      started: [
        `Ooh, starting "${bookTitle}"! This is going to be such an adventure!`,
        `Perfect timing to dive into "${bookTitle}", honey!`,
        `I'm so excited for you to experience "${bookTitle}"!`
      ]
    };

    const messageOptions = responses[action as keyof typeof responses];
    if (messageOptions) {
      const randomMessage = messageOptions[Math.floor(Math.random() * messageOptions.length)];
      sendMessage(randomMessage, action === 'completed' ? 'excited' : 'happy');
    }

    setState(prev => ({
      ...prev,
      fairy: {
        ...prev.fairy,
        context_awareness: {
          ...prev.fairy.context_awareness,
          book_context: { title: bookTitle, action }
        }
      }
    }));
  }, [sendMessage]);

  const celebrateCompletion = useCallback((achievement: string) => {
    const celebrations = {
      'first_book': 'Your very first book! This is such a special moment, honey! 🌟',
      'streak_week': 'A whole week of reading! You\'re on fire, sugar! 🔥',
      'streak_month': 'A month of consistent reading! I\'m so proud of you! 💖',
      'library_milestone': 'Look at that beautiful library growing! You\'re amazing! 📚',
      'wishlist_cleared': 'You cleared your whole wishlist! Time to find more treasures! ✨'
    };

    const message = celebrations[achievement as keyof typeof celebrations] ||
                   `Congratulations on your ${achievement}! You\'re doing wonderfully!`;

    sendMessage(message, 'excited');
    playAnimation('celebrate');
  }, [sendMessage, playAnimation]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Computed values
  const isIdle = useMemo(() => {
    const lastInteraction = new Date(state.fairy.last_interaction);
    const now = new Date();
    const idleTime = now.getTime() - lastInteraction.getTime();
    return idleTime > 30000; // 30 seconds
  }, [state.fairy.last_interaction]);

  const hasMessages = useMemo(() => {
    return state.messageQueue.length > 0 || state.currentMessage !== null;
  }, [state.messageQueue.length, state.currentMessage]);

  const fairyMood = useMemo(() => {
    if (state.fairy.emotion === 'sad') return 'sad';
    if (state.fairy.emotion === 'excited') return 'energetic';
    if (isIdle) return 'sleepy';
    return 'content';
  }, [state.fairy.emotion, isIdle]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return {
    ...state,
    showFairy,
    hideFairy,
    playAnimation,
    sendMessage,
    sendContextualMessage,
    queueMessage,
    clearMessageQueue,
    moveTo,
    setEmotion,
    handleUserInteraction,
    respondToBookAction,
    celebrateCompletion,
    clearError,
    // Additional computed properties
    isIdle,
    hasMessages,
    fairyMood
  } as UseFairyResult & {
    isIdle: boolean;
    hasMessages: boolean;
    fairyMood: string;
  };
};

// Utility hooks for specific fairy interactions
export const useFairyGreeting = () => {
  const { sendMessage, fairy } = useFairy() as any;

  useEffect(() => {
    const hour = new Date().getHours();
    let greeting = 'Hello there, honey!';

    if (hour < 12) {
      greeting = 'Good morning, sugar! Ready for a magical day of reading?';
    } else if (hour < 18) {
      greeting = 'Good afternoon, sweetie! How\'s your reading going?';
    } else {
      greeting = 'Good evening, dear! Perfect time for a cozy reading session!';
    }

    sendMessage(greeting);
  }, [sendMessage]);

  return { greeting: fairy.message };
};

export const useFairyHelp = () => {
  const { sendMessage, playAnimation } = useFairy();

  const showHelp = useCallback((topic: string) => {
    const helpMessages = {
      navigation: 'Need help getting around? I can guide you to your library, wishlist, or help you discover new books!',
      search: 'Looking for something specific? Try searching by title, author, or genre in the discovery section!',
      library: 'Your library is where all your books live! You can track your progress and rate books there.',
      wishlist: 'Your wishlist is like a magical queue - I\'ll help you manage what to read next!',
      settings: 'Want to customize your experience? Check out settings to adjust your preferences!'
    };

    const message = helpMessages[topic as keyof typeof helpMessages] ||
                   'I\'m here to help with anything you need, honey! Just let me know!';

    sendMessage(message, 'helpful');
    playAnimation('bounce');
  }, [sendMessage, playAnimation]);

  return { showHelp };
};

export const useFairyEncouragement = () => {
  const { sendMessage, playAnimation, fairy } = useFairy() as any;

  const encourage = useCallback(() => {
    const encouragements = [
      'You\'re doing amazing, honey! Keep up the great reading!',
      'I believe in you, sugar! Every page is progress!',
      'You\'ve got this, sweetie! I\'m here cheering you on!',
      'Look how far you\'ve come! I\'m so proud of you!',
      'Reading is such a wonderful journey, and you\'re the perfect companion for it!'
    ];

    const message = encouragements[Math.floor(Math.random() * encouragements.length)];
    sendMessage(message, 'encouraging');
    playAnimation('cheer');
  }, [sendMessage, playAnimation]);

  return { encourage, currentMessage: fairy.message };
};