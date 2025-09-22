/**
 * FairyState Entity Interface
 *
 * Defines the fairy character animation states, timing, and behavior
 * for the BookFairy magical companion system
 */

export interface FairyState {
  current_animation: FairyAnimationState;
  message: string;
  is_typing: boolean;
  is_visible: boolean;
  position: FairyPosition;
  emotion: FairyEmotion;
  interaction_context: FairyInteractionContext;
  animation_settings: FairyAnimationSettings;
  last_message_time: string;
  message_queue: FairyMessage[];
}

export interface FairyMessage {
  id: string;
  content: string;
  emotion: FairyEmotion;
  priority: FairyMessagePriority;
  duration_ms?: number;
  context?: Record<string, any>;
  created_at: string;
}

export interface FairyPosition {
  x: number; // 0-1 relative to viewport
  y: number; // 0-1 relative to viewport
  z_index: number;
  animation_origin: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

export interface FairyAnimationSettings {
  flying_duration_ms: number;
  landing_duration_ms: number;
  typing_speed_ms: number;
  takeoff_duration_ms: number;
  reduced_motion: boolean;
  auto_hide_delay_ms: number;
  message_display_duration_ms: number;
}

export interface FairyInteractionContext {
  page: string;
  action: string;
  user_emotion?: 'happy' | 'frustrated' | 'confused' | 'excited' | 'neutral';
  error_context?: string;
  success_context?: string;
  book_context?: {
    book_id: string;
    title: string;
    author: string;
  };
}

export type FairyAnimationState =
  | 'flying'
  | 'landing'
  | 'typing'
  | 'takeoff'
  | 'idle'
  | 'celebrating'
  | 'thinking'
  | 'sleeping'
  | 'error'
  | 'hidden';

export type FairyEmotion =
  | 'happy'
  | 'excited'
  | 'helpful'
  | 'concerned'
  | 'apologetic'
  | 'encouraging'
  | 'celebratory'
  | 'thoughtful'
  | 'sleepy'
  | 'neutral';

export type FairyMessagePriority = 'low' | 'normal' | 'high' | 'urgent';

export interface FairyAnimationEvent {
  type: 'animation_start' | 'animation_end' | 'message_start' | 'message_end' | 'user_interaction';
  animation_state: FairyAnimationState;
  timestamp: string;
  duration_ms?: number;
  message_id?: string;
}

// Animation timing constants
export const FAIRY_ANIMATION_TIMINGS = {
  FLYING_DURATION: 2000,        // 2 seconds
  LANDING_DURATION: 1500,       // 1.5 seconds
  TYPING_SPEED: 50,             // 50ms per character
  TAKEOFF_DURATION: 1200,       // 1.2 seconds
  AUTO_HIDE_DELAY: 5000,        // 5 seconds after message
  MESSAGE_MIN_DISPLAY: 2000,    // Minimum 2 seconds
  CELEBRATION_DURATION: 3000,   // 3 seconds
  THINKING_DURATION: 1500,      // 1.5 seconds
  ERROR_DISPLAY: 8000,          // 8 seconds for errors
  PUNCTUATION_DELAY: 200        // Extra delay for punctuation
} as const;

export const FAIRY_POSITIONS = {
  DEFAULT: { x: 0.85, y: 0.15, z_index: 1000, animation_origin: 'top-right' as const },
  ONBOARDING: { x: 0.5, y: 0.3, z_index: 1001, animation_origin: 'center' as const },
  ERROR: { x: 0.5, y: 0.5, z_index: 1002, animation_origin: 'center' as const },
  CELEBRATION: { x: 0.5, y: 0.2, z_index: 1001, animation_origin: 'center' as const },
  MOBILE: { x: 0.8, y: 0.1, z_index: 1000, animation_origin: 'top-right' as const }
} as const;

// Default fairy state
export const DEFAULT_FAIRY_STATE: FairyState = {
  current_animation: 'flying',
  message: '',
  is_typing: false,
  is_visible: true,
  position: FAIRY_POSITIONS.DEFAULT,
  emotion: 'neutral',
  interaction_context: {
    page: '',
    action: ''
  },
  animation_settings: {
    flying_duration_ms: FAIRY_ANIMATION_TIMINGS.FLYING_DURATION,
    landing_duration_ms: FAIRY_ANIMATION_TIMINGS.LANDING_DURATION,
    typing_speed_ms: FAIRY_ANIMATION_TIMINGS.TYPING_SPEED,
    takeoff_duration_ms: FAIRY_ANIMATION_TIMINGS.TAKEOFF_DURATION,
    reduced_motion: false,
    auto_hide_delay_ms: FAIRY_ANIMATION_TIMINGS.AUTO_HIDE_DELAY,
    message_display_duration_ms: FAIRY_ANIMATION_TIMINGS.MESSAGE_MIN_DISPLAY
  },
  last_message_time: '',
  message_queue: []
};

// Validation functions
export function validateFairyMessage(message: FairyMessage): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!message.id) {
    errors.push('Message ID is required');
  }

  if (!message.content || message.content.trim().length === 0) {
    errors.push('Message content is required');
  } else if (message.content.length > 500) {
    errors.push('Message content too long (max 500 characters)');
  }

  const validEmotions: FairyEmotion[] = [
    'happy', 'excited', 'helpful', 'concerned', 'apologetic',
    'encouraging', 'celebratory', 'thoughtful', 'sleepy', 'neutral'
  ];

  if (!validEmotions.includes(message.emotion)) {
    errors.push('Invalid fairy emotion');
  }

  const validPriorities: FairyMessagePriority[] = ['low', 'normal', 'high', 'urgent'];
  if (!validPriorities.includes(message.priority)) {
    errors.push('Invalid message priority');
  }

  if (message.duration_ms !== undefined && (message.duration_ms < 1000 || message.duration_ms > 30000)) {
    errors.push('Message duration must be between 1 and 30 seconds');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateFairyPosition(position: FairyPosition): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (position.x < 0 || position.x > 1) {
    errors.push('Position X must be between 0 and 1');
  }

  if (position.y < 0 || position.y > 1) {
    errors.push('Position Y must be between 0 and 1');
  }

  if (position.z_index < 0 || position.z_index > 9999) {
    errors.push('Z-index must be between 0 and 9999');
  }

  const validOrigins = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'];
  if (!validOrigins.includes(position.animation_origin)) {
    errors.push('Invalid animation origin');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Utility functions
export function createFairyMessage(
  content: string,
  emotion: FairyEmotion = 'neutral',
  priority: FairyMessagePriority = 'normal',
  context?: Record<string, any>
): FairyMessage {
  return {
    id: `fairy-msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    content,
    emotion,
    priority,
    context,
    created_at: new Date().toISOString()
  };
}

export function calculateMessageDuration(content: string, typingSpeed: number): number {
  // Base duration from typing speed
  const typingDuration = content.length * typingSpeed;

  // Add extra time for punctuation
  const punctuationCount = (content.match(/[.!?,:;]/g) || []).length;
  const punctuationDelay = punctuationCount * FAIRY_ANIMATION_TIMINGS.PUNCTUATION_DELAY;

  // Minimum display time
  const totalDuration = typingDuration + punctuationDelay + FAIRY_ANIMATION_TIMINGS.MESSAGE_MIN_DISPLAY;

  return Math.max(totalDuration, FAIRY_ANIMATION_TIMINGS.MESSAGE_MIN_DISPLAY);
}

export function getAnimationDuration(state: FairyAnimationState, settings: FairyAnimationSettings): number {
  if (settings.reduced_motion) {
    // Instant transitions for reduced motion
    return 0;
  }

  switch (state) {
    case 'flying':
      return settings.flying_duration_ms;
    case 'landing':
      return settings.landing_duration_ms;
    case 'takeoff':
      return settings.takeoff_duration_ms;
    case 'celebrating':
      return FAIRY_ANIMATION_TIMINGS.CELEBRATION_DURATION;
    case 'thinking':
      return FAIRY_ANIMATION_TIMINGS.THINKING_DURATION;
    case 'typing':
    case 'idle':
    case 'sleeping':
    case 'error':
    case 'hidden':
    default:
      return 0;
  }
}

export function getEmotionColor(emotion: FairyEmotion): string {
  const emotionColors = {
    happy: '#FFD700',      // Gold
    excited: '#FF6B35',    // Orange-Red
    helpful: '#4CAF50',    // Green
    concerned: '#FF9800',  // Orange
    apologetic: '#9C27B0', // Purple
    encouraging: '#2196F3', // Blue
    celebratory: '#E91E63', // Pink
    thoughtful: '#607D8B',  // Blue-Gray
    sleepy: '#9E9E9E',     // Gray
    neutral: '#757575'     // Medium Gray
  };

  return emotionColors[emotion];
}

export function getEmotionAnimation(emotion: FairyEmotion): string {
  const emotionAnimations = {
    happy: 'bounce',
    excited: 'shake',
    helpful: 'float',
    concerned: 'sway',
    apologetic: 'droop',
    encouraging: 'nod',
    celebratory: 'spin',
    thoughtful: 'rock',
    sleepy: 'slow-float',
    neutral: 'gentle-float'
  };

  return emotionAnimations[emotion];
}

export function determineFairyEmotion(context: FairyInteractionContext): FairyEmotion {
  // Error context
  if (context.error_context) {
    return 'apologetic';
  }

  // Success context
  if (context.success_context) {
    return 'celebratory';
  }

  // User emotion mapping
  if (context.user_emotion) {
    const emotionMapping = {
      happy: 'happy',
      frustrated: 'helpful',
      confused: 'helpful',
      excited: 'excited',
      neutral: 'neutral'
    } as const;

    return emotionMapping[context.user_emotion];
  }

  // Page-based emotions
  switch (context.page) {
    case 'onboarding':
      return 'encouraging';
    case 'discovery':
      return 'excited';
    case 'library':
      return 'helpful';
    case 'settings':
      return 'thoughtful';
    default:
      return 'neutral';
  }
}

export function shouldShowFairy(context: FairyInteractionContext, lastMessageTime: string): boolean {
  // Always show for errors
  if (context.error_context) {
    return true;
  }

  // Always show for success
  if (context.success_context) {
    return true;
  }

  // Show for onboarding
  if (context.page === 'onboarding') {
    return true;
  }

  // Throttle messages - don't show if last message was recent
  if (lastMessageTime) {
    const timeSinceLastMessage = Date.now() - new Date(lastMessageTime).getTime();
    const throttleTime = 10000; // 10 seconds

    if (timeSinceLastMessage < throttleTime) {
      return false;
    }
  }

  return true;
}

export function generateContextualMessage(context: FairyInteractionContext): string {
  // Error messages
  if (context.error_context) {
    const errorMessages = [
      `Well sugar, something went a little sideways. ${context.error_context}`,
      `Oh honey, bless your heart! We hit a little snag: ${context.error_context}`,
      `Well, that didn't go as planned, darling. ${context.error_context}`
    ];
    return errorMessages[Math.floor(Math.random() * errorMessages.length)];
  }

  // Success messages
  if (context.success_context) {
    const successMessages = [
      `Oh my stars! ${context.success_context}`,
      `Well honey, that worked perfectly! ${context.success_context}`,
      `Bless your heart, you did it! ${context.success_context}`
    ];
    return successMessages[Math.floor(Math.random() * successMessages.length)];
  }

  // Book-specific messages
  if (context.book_context) {
    const bookMessages = [
      `Oh honey, "${context.book_context.title}" by ${context.book_context.author} looks delightful!`,
      `Well sugar, that's a fine choice with "${context.book_context.title}"!`,
      `Bless your heart, ${context.book_context.author} writes the most wonderful stories!`
    ];
    return bookMessages[Math.floor(Math.random() * bookMessages.length)];
  }

  // Page-specific messages
  const pageMessages = {
    landing: [
      "Well honey, welcome to BookFairy! I'm here to help you find your next favorite audiobook!",
      "Oh my stars! You've found your way to the most magical place for audiobook lovers!",
      "Bless your heart, you're in for a treat! Let's find some wonderful books together!"
    ],
    dashboard: [
      "Well sugar, what shall we discover today?",
      "Oh honey, your library is looking mighty fine!",
      "Bless your heart, ready for some reading adventures?"
    ],
    discovery: [
      "Well honey, let's fire up that readar and see what magical books we can find!",
      "Oh sugar, the book scanning is my favorite part! Let's see what treasures await!",
      "Bless your heart, get ready for some wonderful discoveries!"
    ],
    library: [
      "Well honey, look at all these beautiful books you've collected!",
      "Oh my stars, your library is growing like kudzu in summer!",
      "Sugar, you've got quite the collection going here!"
    ],
    settings: [
      "Well honey, let's make sure everything is just right for you!",
      "Oh sugar, tweaking the settings to perfection, I see!",
      "Bless your heart, making sure everything runs smooth as molasses!"
    ]
  };

  const messages = pageMessages[context.page as keyof typeof pageMessages] || pageMessages.dashboard;
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getNextAnimationState(
  currentState: FairyAnimationState,
  hasMessage: boolean,
  isCompleted: boolean
): FairyAnimationState {
  switch (currentState) {
    case 'flying':
      return hasMessage ? 'landing' : 'idle';

    case 'landing':
      return hasMessage ? 'typing' : 'idle';

    case 'typing':
      return isCompleted ? 'takeoff' : 'typing';

    case 'takeoff':
      return 'flying';

    case 'celebrating':
      return isCompleted ? 'takeoff' : 'celebrating';

    case 'thinking':
      return hasMessage ? 'typing' : 'idle';

    case 'error':
      return isCompleted ? 'takeoff' : 'error';

    case 'idle':
    case 'sleeping':
    case 'hidden':
    default:
      return hasMessage ? 'landing' : currentState;
  }
}

export function optimizeForMobile(position: FairyPosition): FairyPosition {
  return {
    ...position,
    x: Math.min(position.x, 0.9), // Keep within safe area
    y: Math.max(position.y, 0.1), // Avoid notch area
    z_index: Math.min(position.z_index, 999) // Lower z-index for mobile
  };
}

export function applyReducedMotionSettings(settings: FairyAnimationSettings): FairyAnimationSettings {
  return {
    ...settings,
    flying_duration_ms: 0,
    landing_duration_ms: 0,
    takeoff_duration_ms: 0,
    typing_speed_ms: 0, // Instant text appearance
    auto_hide_delay_ms: settings.auto_hide_delay_ms * 2 // Longer display time
  };
}

export function prioritizeMessageQueue(messages: FairyMessage[]): FairyMessage[] {
  return [...messages].sort((a, b) => {
    const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];

    if (priorityDiff !== 0) return priorityDiff;

    // Secondary sort by creation time
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

// Type guards
export function isFairyState(obj: any): obj is FairyState {
  return (
    obj &&
    typeof obj.current_animation === 'string' &&
    typeof obj.message === 'string' &&
    typeof obj.is_typing === 'boolean' &&
    typeof obj.is_visible === 'boolean' &&
    obj.position &&
    typeof obj.emotion === 'string' &&
    obj.interaction_context &&
    obj.animation_settings &&
    Array.isArray(obj.message_queue)
  );
}

export function isFairyMessage(obj: any): obj is FairyMessage {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.content === 'string' &&
    typeof obj.emotion === 'string' &&
    typeof obj.priority === 'string' &&
    typeof obj.created_at === 'string'
  );
}