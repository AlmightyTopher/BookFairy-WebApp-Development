/**
 * Fairy Chat Component
 *
 * Interactive chat interface with the BookFairy character
 * providing contextual help, recommendations, and friendly conversation
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFairy } from '@/hooks/useFairy';
import { useAuthContext } from '@/hooks/useAuth';
import type { FairyMessage, FairyEmotion } from '@/types';
import './FairyChat.css';

export interface FairyChatProps {
  className?: string;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
  maxMessages?: number;
  showTypingIndicator?: boolean;
  autoFocus?: boolean;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'fairy';
  timestamp: string;
  emotion?: FairyEmotion;
}

interface QuickAction {
  id: string;
  label: string;
  action: string;
  icon?: string;
}

export const FairyChat: React.FC<FairyChatProps> = ({
  className = '',
  isOpen = false,
  onToggle,
  maxMessages = 50,
  showTypingIndicator = true,
  autoFocus = true
}) => {
  const { user } = useAuthContext();
  const {
    fairy,
    sendMessage,
    sendContextualMessage,
    handleUserInteraction,
    playAnimation,
    isTyping
  } = useFairy();

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize chat with greeting
  useEffect(() => {
    if (isOpen && chatMessages.length === 0) {
      const hour = new Date().getHours();
      let greeting = `Hello there, ${user?.name || 'honey'}! I'm here to help with all your reading adventures! 📚✨`;

      if (hour < 12) {
        greeting = `Good morning, ${user?.name || 'sugar'}! Ready to discover some magical books today? 🌅📖`;
      } else if (hour < 18) {
        greeting = `Good afternoon, ${user?.name || 'sweetie'}! How's your reading journey going? 🌞📚`;
      } else {
        greeting = `Good evening, ${user?.name || 'dear'}! Perfect time for some cozy reading! 🌙📖`;
      }

      addFairyMessage(greeting, 'happy');
      updateQuickActions('greeting');
    }
  }, [isOpen, chatMessages.length, user?.name]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && autoFocus && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, autoFocus]);

  // Listen for fairy messages
  useEffect(() => {
    if (fairy.message && fairy.message !== chatMessages[chatMessages.length - 1]?.content) {
      addFairyMessage(fairy.message, fairy.emotion);
    }
  }, [fairy.message, fairy.emotion, chatMessages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const addFairyMessage = useCallback((content: string, emotion: FairyEmotion = 'happy') => {
    const message: ChatMessage = {
      id: `fairy_${Date.now()}`,
      content,
      sender: 'fairy',
      timestamp: new Date().toISOString(),
      emotion
    };

    setChatMessages(prev => [...prev.slice(-(maxMessages - 1)), message]);
  }, [maxMessages]);

  const addUserMessage = useCallback((content: string) => {
    const message: ChatMessage = {
      id: `user_${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev.slice(-(maxMessages - 1)), message]);
  }, [maxMessages]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsUserTyping(false);

    // Add user message to chat
    addUserMessage(userMessage);

    // Process user input and generate fairy response
    const response = await processUserInput(userMessage);

    // Send to fairy system
    sendMessage(response.content, response.emotion);
    handleUserInteraction('chat_message', { message: userMessage });

    // Update quick actions based on context
    updateQuickActions(response.context);
  }, [inputValue, addUserMessage, sendMessage, handleUserInteraction]);

  const processUserInput = useCallback(async (input: string): Promise<{
    content: string;
    emotion: FairyEmotion;
    context: string;
  }> => {
    const lowerInput = input.toLowerCase();

    // Book-related queries
    if (lowerInput.includes('recommend') || lowerInput.includes('suggest') || lowerInput.includes('book')) {
      playAnimation('search');
      return {
        content: "Oh wonderful! I'd love to help you find the perfect book! What genres do you enjoy? Or would you like me to look at your reading history for personalized recommendations? 📚✨",
        emotion: 'excited',
        context: 'recommendations'
      };
    }

    // Library-related queries
    if (lowerInput.includes('library') || lowerInput.includes('reading') || lowerInput.includes('progress')) {
      return {
        content: "Your library is such a treasure! Would you like me to show you your reading progress, help you organize your books, or maybe celebrate a recent completion? 🏆📖",
        emotion: 'helpful',
        context: 'library'
      };
    }

    // Wishlist-related queries
    if (lowerInput.includes('wishlist') || lowerInput.includes('want to read') || lowerInput.includes('queue')) {
      return {
        content: "Ah, your wishlist! That magical queue of future adventures! Would you like me to help you manage it, or shall we add some exciting new books to it? 🌟📚",
        emotion: 'happy',
        context: 'wishlist'
      };
    }

    // Help queries
    if (lowerInput.includes('help') || lowerInput.includes('how') || lowerInput.includes('what')) {
      return {
        content: "I'm here to help with everything, honey! I can help you discover books, manage your library, organize your wishlist, or just have a lovely chat about reading! What would you like to explore? 💫",
        emotion: 'helpful',
        context: 'help'
      };
    }

    // Greeting responses
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      playAnimation('wave');
      return {
        content: "Well hello there, sweetie! It's always wonderful to chat with you! How can I make your reading journey even more magical today? ✨😊",
        emotion: 'happy',
        context: 'greeting'
      };
    }

    // Compliments
    if (lowerInput.includes('thank') || lowerInput.includes('great') || lowerInput.includes('awesome')) {
      playAnimation('celebrate');
      return {
        content: "Aww, you're so sweet! That just makes my little fairy heart flutter! I'm so happy I could help, sugar! 💖✨",
        emotion: 'excited',
        context: 'appreciation'
      };
    }

    // Settings/preferences
    if (lowerInput.includes('setting') || lowerInput.includes('preference') || lowerInput.includes('customize')) {
      return {
        content: "Oh, you want to make things just right! I love that! Let me help you customize your BookFairy experience. What would you like to adjust, honey? 🎛️✨",
        emotion: 'helpful',
        context: 'settings'
      };
    }

    // Default friendly response
    const responses = [
      "That's interesting, honey! Tell me more about what you're thinking! 💭✨",
      "Oh my, I love our conversations! What else would you like to chat about? 😊📚",
      "You always have such thoughtful things to say! How can I help you today? 🌟",
      "I'm all ears, sweetie! What's on your mind about your reading adventures? 📖💫"
    ];

    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      emotion: 'happy',
      context: 'general'
    };
  }, [playAnimation]);

  const updateQuickActions = useCallback((context: string) => {
    const actionSets = {
      greeting: [
        { id: 'recommend', label: 'Recommend books', action: 'recommend', icon: '🔍' },
        { id: 'library', label: 'Check my library', action: 'library', icon: '📚' },
        { id: 'wishlist', label: 'Manage wishlist', action: 'wishlist', icon: '⭐' },
        { id: 'help', label: 'Get help', action: 'help', icon: '❓' }
      ],
      recommendations: [
        { id: 'by-genre', label: 'By genre', action: 'by-genre', icon: '🎭' },
        { id: 'by-author', label: 'By author', action: 'by-author', icon: '✍️' },
        { id: 'trending', label: 'Trending books', action: 'trending', icon: '🔥' },
        { id: 'similar', label: 'Similar to my books', action: 'similar', icon: '🔄' }
      ],
      library: [
        { id: 'current', label: 'Currently reading', action: 'current', icon: '📖' },
        { id: 'completed', label: 'Completed books', action: 'completed', icon: '✅' },
        { id: 'stats', label: 'Reading stats', action: 'stats', icon: '📊' },
        { id: 'organize', label: 'Organize library', action: 'organize', icon: '🗂️' }
      ],
      wishlist: [
        { id: 'view-queue', label: 'View queue', action: 'view-queue', icon: '📋' },
        { id: 'add-book', label: 'Add book', action: 'add-book', icon: '➕' },
        { id: 'reorder', label: 'Reorder list', action: 'reorder', icon: '🔄' },
        { id: 'expired', label: 'Check expired', action: 'expired', icon: '⏰' }
      ],
      help: [
        { id: 'navigation', label: 'Navigation help', action: 'navigation', icon: '🧭' },
        { id: 'features', label: 'App features', action: 'features', icon: '⭐' },
        { id: 'tips', label: 'Reading tips', action: 'tips', icon: '💡' },
        { id: 'contact', label: 'Contact support', action: 'contact', icon: '📞' }
      ]
    };

    setQuickActions(actionSets[context as keyof typeof actionSets] || actionSets.greeting);
  }, []);

  const handleQuickAction = useCallback((action: string) => {
    // Add user message for the action
    addUserMessage(`Help me with: ${action}`);

    // Send contextual message to fairy
    sendContextualMessage(action);
    handleUserInteraction('quick_action', { action });
  }, [addUserMessage, sendContextualMessage, handleUserInteraction]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    // Show typing indicator
    setIsUserTyping(true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Hide typing indicator after 1 second of no typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsUserTyping(false);
    }, 1000);
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const formatTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`fairy-chat ${className}`}>
      <div className="fairy-chat-header">
        <div className="fairy-chat-title">
          <span className="fairy-chat-icon">🧚‍♀️</span>
          <h3>Chat with BookFairy</h3>
        </div>
        {onToggle && (
          <button
            className="fairy-chat-close"
            onClick={() => onToggle(false)}
            aria-label="Close chat"
          >
            ✕
          </button>
        )}
      </div>

      <div className="fairy-chat-messages">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`fairy-chat-message fairy-chat-message--${message.sender}`}
          >
            <div className="fairy-chat-message-content">
              <p>{message.content}</p>
              <span className="fairy-chat-message-time">
                {formatTime(message.timestamp)}
              </span>
            </div>
            {message.sender === 'fairy' && message.emotion && (
              <span className={`fairy-chat-emotion fairy-chat-emotion--${message.emotion}`}>
                {getEmotionIcon(message.emotion)}
              </span>
            )}
          </div>
        ))}

        {(isTyping || showTypingIndicator) && (
          <div className="fairy-chat-message fairy-chat-message--fairy">
            <div className="fairy-chat-typing">
              <div className="fairy-chat-typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="fairy-chat-typing-text">BookFairy is typing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {quickActions.length > 0 && (
        <div className="fairy-chat-quick-actions">
          {quickActions.map((action) => (
            <button
              key={action.id}
              className="fairy-chat-quick-action"
              onClick={() => handleQuickAction(action.action)}
              title={action.label}
            >
              <span className="fairy-chat-quick-action-icon">{action.icon}</span>
              <span className="fairy-chat-quick-action-label">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="fairy-chat-input">
        <div className="fairy-chat-input-container">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about books..."
            className="fairy-chat-input-field"
            aria-label="Chat message input"
            maxLength={500}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="fairy-chat-send-button"
            aria-label="Send message"
          >
            <span className="fairy-chat-send-icon">📤</span>
          </button>
        </div>
        {isUserTyping && (
          <div className="fairy-chat-user-typing">
            You are typing...
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get emotion icons
function getEmotionIcon(emotion: FairyEmotion): string {
  const icons = {
    happy: '😊',
    excited: '🤩',
    sad: '😢',
    surprised: '😲',
    thoughtful: '🤔',
    playful: '😄',
    helpful: '🥰',
    encouraging: '💪'
  };

  return icons[emotion] || '😊';
}

export default FairyChat;