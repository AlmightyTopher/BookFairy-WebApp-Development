/**
 * Fairy Components Index
 *
 * Centralized exports for all fairy character components
 * and related utilities for the BookFairy application
 */

// Main Components
export { default as FairyCharacter } from './FairyCharacter';
export type { FairyCharacterProps } from './FairyCharacter';

export { default as FairyChat } from './FairyChat';
export type { FairyChatProps } from './FairyChat';

export { default as FairyProvider } from './FairyProvider';
export type { FairyProviderProps, FairyContextType } from './FairyProvider';

// Context Hook
export { useFairyContext } from './FairyProvider';

// Main Hook (re-export for convenience)
export { useFairy, useFairyGreeting, useFairyHelp, useFairyEncouragement } from '@/hooks/useFairy';

// Types (re-export for convenience)
export type {
  FairyState,
  FairyMessage,
  FairyAnimationState,
  FairyEmotion,
  FairyPosition
} from '@/types';

// Utility functions for fairy interactions
export const createFairyGreeting = (userName?: string, timeOfDay?: string): string => {
  const name = userName || 'honey';
  const time = timeOfDay || getCurrentTimeOfDay();

  const greetings = {
    morning: [
      `Good morning, ${name}! Ready for a magical day of reading? 🌅📖`,
      `Rise and shine, ${name}! What literary adventures await today? ☀️📚`,
      `Morning, sweetie! Time to make some reading magic happen! ✨📖`
    ],
    afternoon: [
      `Good afternoon, ${name}! How's your reading journey going? 🌞📚`,
      `Afternoon, sugar! Perfect time for a book break! 📖☀️`,
      `Hey there, ${name}! Ready to dive into a good book? 🌤️📚`
    ],
    evening: [
      `Good evening, ${name}! Perfect time for some cozy reading! 🌙📖`,
      `Evening, dear! Nothing beats a good book as the day winds down! 🌆📚`,
      `Hello, ${name}! Ready for some magical evening reading? ✨🌙`
    ],
    night: [
      `Good night, ${name}! Maybe just one more chapter? 🌙📖`,
      `Evening, honey! Perfect time for a bedtime story! 🌟📚`,
      `Hey there, ${name}! Late night reading session? 🌙✨`
    ]
  };

  const timeGreetings = greetings[time as keyof typeof greetings] || greetings.afternoon;
  return timeGreetings[Math.floor(Math.random() * timeGreetings.length)];
};

export const createBookRecommendationMessage = (bookTitle: string, reason?: string): string => {
  const reasons = [
    `Based on your reading history, I think you'd absolutely love "${bookTitle}"! 📚✨`,
    `"${bookTitle}" caught my eye for you - it seems right up your alley! 🌟📖`,
    `I have a feeling "${bookTitle}" would be perfect for your next read! 💫📚`,
    `"${bookTitle}" is calling your name, honey! Want to give it a try? 📖💖`
  ];

  if (reason) {
    return `"${bookTitle}" looks perfect for you ${reason}! What do you think, sweetie? 📚✨`;
  }

  return reasons[Math.floor(Math.random() * reasons.length)];
};

export const createCelebrationMessage = (achievement: string, details?: any): string => {
  const celebrations = {
    first_book: 'Your very first book! This is such a special moment, honey! Welcome to the wonderful world of reading! 🌟📚',
    book_completed: `Congratulations on finishing "${details?.title || 'your book'}"! What an accomplishment! 🎉📖`,
    reading_streak: `${details?.days || 'Multiple'} days of reading in a row! You're absolutely amazing! 🔥📚`,
    library_milestone: `${details?.count || 'So many'} books in your library! Look at that beautiful collection grow! 🏆📚`,
    genre_explorer: `You've explored ${details?.genres || 'multiple'} different genres! What a diverse reader! 🌍📖`,
    speed_reader: 'Wow, you\'re reading so fast! I can barely keep up! 🚀📚',
    night_owl: 'Late night reading session! I love your dedication, honey! 🌙📖',
    early_bird: 'Early morning reading! Starting the day right! 🌅📚'
  };

  return celebrations[achievement as keyof typeof celebrations] ||
         `Congratulations on your ${achievement}! You\'re doing wonderfully! 🌟`;
};

export const createHelpMessage = (topic: string): string => {
  const helpMessages = {
    navigation: 'Need help getting around? I can guide you to your library, wishlist, or help you discover new books! Just let me know where you\'d like to go! 🧭✨',
    search: 'Looking for something specific? Try searching by title, author, or genre in the discovery section! I\'ll help you find the perfect match! 🔍📚',
    library: 'Your library is your personal treasure trove! You can track progress, rate books, add notes, and see your reading stats. Want a tour? 📚⭐',
    wishlist: 'Your wishlist is where future reading adventures live! Add books you want to read, and I\'ll help you manage your magical queue! 📋✨',
    settings: 'Want to customize your experience? In settings, you can adjust notifications, connect accounts, and make BookFairy truly yours! ⚙️💫',
    onboarding: 'New here? I\'ll guide you through everything! We\'ll set up your preferences and get you started on your reading journey! 🌟📖',
    sync: 'Want to connect your existing accounts? I can help you sync with Audiobookshelf or other services to import your library! 🔄📚'
  };

  return helpMessages[topic as keyof typeof helpMessages] ||
         'I\'m here to help with anything you need, honey! Just ask me about books, navigation, or anything else! 💬📖';
};

export const createErrorMessage = (errorType: string, context?: string): string => {
  const errorMessages = {
    network: 'Oh honey, I\'m having trouble connecting right now. Let\'s try again in a moment! 🌐💫',
    loading: 'Well sugar, things are taking a bit longer than expected. Bear with me! ⏳✨',
    not_found: 'Hmm, I can\'t seem to find what you\'re looking for. Let\'s try something else! 🔍💭',
    permission: 'Oh my, it looks like we need permission for that. Can you help me out? 🔐✨',
    sync: 'I\'m having a little trouble syncing your data, honey. Let\'s give it another try! 🔄💫',
    search: 'Well bless your heart, that search didn\'t turn up anything. Want to try different keywords? 🔍📚'
  };

  const baseMessage = errorMessages[errorType as keyof typeof errorMessages] ||
                     'Oh honey, something went a little sideways there. Let\'s try again! 💫';

  if (context) {
    return `${baseMessage} (${context})`;
  }

  return baseMessage;
};

// Utility function to get current time of day
function getCurrentTimeOfDay(): string {
  const hour = new Date().getHours();

  if (hour < 6) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  if (hour < 22) return 'evening';
  return 'night';
}

// Constants for easy access
export const FAIRY_CONSTANTS = {
  DEFAULT_POSITION: 'bottom-right' as FairyPosition,
  DEFAULT_EMOTION: 'happy' as FairyEmotion,
  ANIMATION_DURATIONS: {
    short: 500,
    medium: 1000,
    long: 2000
  },
  MESSAGE_DURATIONS: {
    short: 2000,
    medium: 4000,
    long: 6000
  }
} as const;

// Helper function to validate fairy configuration
export const validateFairyConfig = (config: any): boolean => {
  const requiredFields = ['position', 'interactive', 'autoShow'];
  return requiredFields.every(field => field in config);
};

// Helper function to create contextual messages based on user action
export const createContextualMessage = (
  action: string,
  context: Record<string, any> = {}
): string => {
  const { page, bookTitle, genre, author, count } = context;

  const contextualMessages = {
    page_visit: {
      library: 'Welcome to your magical library! 📚✨',
      wishlist: 'Your wishlist awaits! What treasures shall we add? ⭐📖',
      discovery: 'Time for book discovery! I love this part! 🔍📚',
      settings: 'Let\'s make everything perfect for you! ⚙️💫'
    },
    book_action: {
      view: `"${bookTitle}" looks interesting! Want to know more about it? 📖👀`,
      add: `"${bookTitle}" has been added! Great choice, honey! 🎉📚`,
      remove: `Goodbye "${bookTitle}"! Making room for new adventures! 👋📖`
    },
    search_action: {
      genre: `Exploring ${genre} books! Excellent taste, sweetie! 🎭📚`,
      author: `${author}'s works are wonderful! Let's see what we can find! ✍️📖`,
      general: 'Let\'s find you the perfect book! 🔍✨'
    }
  };

  // Navigate the nested structure based on action and context
  const actionGroup = contextualMessages[action as keyof typeof contextualMessages] as any;
  if (actionGroup && typeof actionGroup === 'object') {
    const subAction = Object.keys(context)[0];
    return actionGroup[subAction] || 'How exciting! ✨';
  }

  return 'Something wonderful is happening! ✨📚';
};