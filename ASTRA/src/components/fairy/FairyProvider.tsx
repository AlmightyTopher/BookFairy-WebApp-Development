/**
 * Fairy Provider Component
 *
 * Context provider that manages fairy state across the application
 * and integrates fairy interactions with user actions
 */

import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useFairy } from '@/hooks/useFairy';
import { useAuthContext } from '@/hooks/useAuth';
import { useLibrary } from '@/hooks/useLibrary';
import { useWishlist } from '@/hooks/useWishlist';
import { useNotifications } from '@/hooks/useNotifications';
import type { FairyPosition, FairyEmotion } from '@/types';
import FairyCharacter from './FairyCharacter';
import FairyChat from './FairyChat';

export interface FairyContextType {
  showFairy: (position?: FairyPosition) => void;
  hideFairy: () => void;
  sendMessage: (message: string, emotion?: FairyEmotion) => void;
  celebrateAction: (action: string, data?: any) => void;
  showHelp: (topic: string) => void;
  toggleChat: () => void;
  isChatOpen: boolean;
  isVisible: boolean;
}

const FairyContext = createContext<FairyContextType | null>(null);

export const useFairyContext = (): FairyContextType => {
  const context = useContext(FairyContext);
  if (!context) {
    throw new Error('useFairyContext must be used within a FairyProvider');
  }
  return context;
};

export interface FairyProviderProps {
  children: React.ReactNode;
  autoShow?: boolean;
  defaultPosition?: FairyPosition;
  enableInteractions?: boolean;
  showChat?: boolean;
}

export const FairyProvider: React.FC<FairyProviderProps> = ({
  children,
  autoShow = true,
  defaultPosition = 'bottom-right',
  enableInteractions = true,
  showChat = true
}) => {
  const { user, isAuthenticated } = useAuthContext();
  const {
    fairy,
    isVisible,
    showFairy: showFairyHook,
    hideFairy: hideFairyHook,
    sendMessage: sendMessageHook,
    handleUserInteraction,
    celebrateCompletion,
    respondToBookAction,
    playAnimation
  } = useFairy();

  const {
    items: libraryItems,
    isLoading: libraryLoading,
    error: libraryError
  } = useLibrary();

  const {
    items: wishlistItems,
    isLoading: wishlistLoading,
    error: wishlistError
  } = useWishlist();

  const {
    unreadCount,
    notifications
  } = useNotifications();

  const [isChatOpen, setIsChatOpen] = React.useState(false);

  // Show fairy on authentication
  useEffect(() => {
    if (isAuthenticated && autoShow && !isVisible) {
      setTimeout(() => {
        showFairyHook(defaultPosition);
      }, 1000); // Delay to allow page to settle
    }
  }, [isAuthenticated, autoShow, isVisible, showFairyHook, defaultPosition]);

  // React to library changes
  useEffect(() => {
    if (!enableInteractions || !isAuthenticated) return;

    const previousCount = parseInt(localStorage.getItem('fairy_library_count') || '0');
    const currentCount = libraryItems.length;

    if (currentCount > previousCount && previousCount > 0) {
      const newBooksCount = currentCount - previousCount;
      celebrateAction('library_growth', { count: newBooksCount });
    }

    localStorage.setItem('fairy_library_count', currentCount.toString());
  }, [libraryItems.length, enableInteractions, isAuthenticated]);

  // React to wishlist changes
  useEffect(() => {
    if (!enableInteractions || !isAuthenticated) return;

    const previousCount = parseInt(localStorage.getItem('fairy_wishlist_count') || '0');
    const currentCount = wishlistItems.length;

    if (currentCount > previousCount && previousCount > 0) {
      const newWishesCount = currentCount - previousCount;
      celebrateAction('wishlist_growth', { count: newWishesCount });
    }

    localStorage.setItem('fairy_wishlist_count', currentCount.toString());
  }, [wishlistItems.length, enableInteractions, isAuthenticated]);

  // React to notifications
  useEffect(() => {
    if (!enableInteractions || !isAuthenticated || unreadCount === 0) return;

    const lastNotificationCount = parseInt(localStorage.getItem('fairy_notification_count') || '0');

    if (unreadCount > lastNotificationCount) {
      const newNotificationsCount = unreadCount - lastNotificationCount;

      if (newNotificationsCount === 1) {
        sendMessageHook('You have a new notification, honey! 📬✨', 'happy');
      } else {
        sendMessageHook(`You have ${newNotificationsCount} new notifications, sweetie! 📬✨`, 'excited');
      }

      playAnimation('bounce');
    }

    localStorage.setItem('fairy_notification_count', unreadCount.toString());
  }, [unreadCount, enableInteractions, isAuthenticated, sendMessageHook, playAnimation]);

  // React to errors
  useEffect(() => {
    if (!enableInteractions) return;

    if (libraryError) {
      sendMessageHook('Oh honey, I\'m having trouble with your library right now. Let\'s try again in a moment! 🌟', 'sad');
      handleUserInteraction('error', { type: 'library', message: libraryError });
    }
  }, [libraryError, enableInteractions, sendMessageHook, handleUserInteraction]);

  useEffect(() => {
    if (!enableInteractions) return;

    if (wishlistError) {
      sendMessageHook('Well sugar, your wishlist seems a bit grumpy today. Give me a second to sort this out! 💫', 'thoughtful');
      handleUserInteraction('error', { type: 'wishlist', message: wishlistError });
    }
  }, [wishlistError, enableInteractions, sendMessageHook, handleUserInteraction]);

  // Handle page navigation
  useEffect(() => {
    if (!enableInteractions || !isAuthenticated) return;

    const handleLocationChange = () => {
      const path = window.location.pathname;
      let contextMessage = '';

      switch (true) {
        case path.includes('/library'):
          contextMessage = 'Welcome to your magical library! 📚✨';
          break;
        case path.includes('/wishlist'):
          contextMessage = 'Ah, your treasure wishlist! What wonderful adventures await! ⭐';
          break;
        case path.includes('/discovery'):
          contextMessage = 'Time for book discovery! I love this part! 🔍📖';
          break;
        case path.includes('/settings'):
          contextMessage = 'Let\'s make everything just right for you, honey! ⚙️';
          break;
        case path.includes('/onboarding'):
          contextMessage = 'Welcome to BookFairy! I\'m so excited to be your reading companion! 🎉';
          break;
        default:
          if (path === '/' || path === '/dashboard') {
            contextMessage = 'Welcome back to your reading dashboard, sweetie! 🏡📚';
          }
      }

      if (contextMessage) {
        setTimeout(() => {
          sendMessageHook(contextMessage, 'happy');
        }, 500);
      }

      handleUserInteraction('navigation', { path });
    };

    // Listen for navigation changes
    window.addEventListener('popstate', handleLocationChange);

    // Call once for initial load
    handleLocationChange();

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [enableInteractions, isAuthenticated, sendMessageHook, handleUserInteraction]);

  const showFairy = useCallback((position?: FairyPosition) => {
    showFairyHook(position || defaultPosition);
  }, [showFairyHook, defaultPosition]);

  const hideFairy = useCallback(() => {
    hideFairyHook();
    setIsChatOpen(false); // Close chat when hiding fairy
  }, [hideFairyHook]);

  const sendMessage = useCallback((message: string, emotion: FairyEmotion = 'happy') => {
    sendMessageHook(message, emotion);

    // Show fairy if hidden
    if (!isVisible) {
      showFairy();
    }
  }, [sendMessageHook, isVisible, showFairy]);

  const celebrateAction = useCallback((action: string, data?: any) => {
    if (!enableInteractions) return;

    const celebrations = {
      book_added: (title: string) => {
        celebrateCompletion('book_added');
        respondToBookAction('added', title);
      },
      book_completed: (title: string) => {
        celebrateCompletion('book_completed');
        respondToBookAction('completed', title);

        // Check for milestones
        const completedCount = libraryItems.filter(item => item.completion_status === 'completed').length;
        if (completedCount === 1) {
          setTimeout(() => {
            celebrateCompletion('first_book');
          }, 2000);
        } else if (completedCount % 5 === 0) {
          setTimeout(() => {
            celebrateCompletion('library_milestone');
          }, 2000);
        }
      },
      library_growth: (count: number) => {
        if (count === 1) {
          sendMessage('A new book joined your library! How exciting! 🎉📚', 'excited');
        } else {
          sendMessage(`Wow! ${count} new books in your library! You're building quite the collection! 🌟📚`, 'excited');
        }
        playAnimation('celebrate');
      },
      wishlist_growth: (count: number) => {
        if (count === 1) {
          sendMessage('A new wish has been added! I can\'t wait to see you read it! ⭐', 'happy');
        } else {
          sendMessage(`${count} new wishes! Your reading future looks bright! ✨📖`, 'excited');
        }
        playAnimation('bounce');
      },
      reading_streak: (days: number) => {
        if (days === 7) {
          celebrateCompletion('streak_week');
        } else if (days === 30) {
          celebrateCompletion('streak_month');
        } else {
          sendMessage(`${days} days of reading! You're on fire, honey! 🔥📚`, 'excited');
          playAnimation('cheer');
        }
      }
    };

    if (action in celebrations) {
      const celebrate = celebrations[action as keyof typeof celebrations] as Function;
      celebrate(data?.title || data?.count || data?.days);
    } else {
      sendMessage('Way to go, sweetie! 🌟', 'excited');
      playAnimation('celebrate');
    }

    handleUserInteraction('celebration', { action, data });
  }, [
    enableInteractions,
    celebrateCompletion,
    respondToBookAction,
    libraryItems,
    sendMessage,
    playAnimation,
    handleUserInteraction
  ]);

  const showHelp = useCallback((topic: string) => {
    const helpMessages = {
      navigation: 'Need help getting around? Use the menu to explore your library, wishlist, or discover new books! I\'m here to guide you every step of the way! 🧭✨',
      search: 'Looking for something specific? Head to the discovery section and search by title, author, or genre. I\'ll help you find the perfect book! 🔍📚',
      library: 'Your library is your personal collection! Track your reading progress, rate books, and see your stats. It\'s like your own magical bookshelf! 📚⭐',
      wishlist: 'Your wishlist is where future reading adventures live! Add books you want to read, and I\'ll help you manage your queue! 📋✨',
      settings: 'Want to customize your experience? In settings, you can adjust notifications, connect your accounts, and make BookFairy truly yours! ⚙️💫',
      general: 'I\'m here to help with anything you need, honey! Whether it\'s finding books, managing your library, or just having a chat about reading! 💬📖'
    };

    const message = helpMessages[topic as keyof typeof helpMessages] || helpMessages.general;
    sendMessage(message, 'helpful');
    playAnimation('bounce');

    handleUserInteraction('help_requested', { topic });
  }, [sendMessage, playAnimation, handleUserInteraction]);

  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev);

    if (!isChatOpen) {
      // Opening chat
      handleUserInteraction('chat_opened');
      if (!isVisible) {
        showFairy();
      }
    } else {
      // Closing chat
      handleUserInteraction('chat_closed');
    }
  }, [isChatOpen, handleUserInteraction, isVisible, showFairy]);

  const contextValue: FairyContextType = {
    showFairy,
    hideFairy,
    sendMessage,
    celebrateAction,
    showHelp,
    toggleChat,
    isChatOpen,
    isVisible
  };

  return (
    <FairyContext.Provider value={contextValue}>
      {children}

      {/* Render fairy character */}
      <FairyCharacter
        size="medium"
        interactive={enableInteractions}
        autoShow={autoShow}
        position={defaultPosition}
        onInteraction={(type, data) => {
          if (type === 'click' && showChat) {
            setIsChatOpen(true);
          }
          handleUserInteraction(type, data);
        }}
      />

      {/* Render chat interface */}
      {showChat && (
        <FairyChat
          isOpen={isChatOpen}
          onToggle={setIsChatOpen}
          maxMessages={50}
          showTypingIndicator={true}
          autoFocus={true}
        />
      )}
    </FairyContext.Provider>
  );
};

export default FairyProvider;