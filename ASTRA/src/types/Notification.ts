/**
 * Notification Entity Interface
 *
 * Defines the notification system for BookFairy with fairy-themed messaging
 * and web push notification support
 */

import { Book } from './Book';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  fairy_message: string;
  delivery_timestamp: string;
  read_status: boolean;
  related_book?: Book;
  related_wishlist_item_id?: string;
  related_library_item_id?: string;
  action_url?: string;
  action_label?: string;
  priority: NotificationPriority;
  expires_at?: string;
}

export interface NotificationCreate {
  type: NotificationType;
  title: string;
  message: string;
  fairy_message?: string;
  related_book_id?: string;
  related_wishlist_item_id?: string;
  related_library_item_id?: string;
  action_url?: string;
  action_label?: string;
  priority?: NotificationPriority;
  expires_at?: string;
}

export interface NotificationUpdate {
  read_status?: boolean;
}

export interface NotificationResponse {
  notifications: Notification[];
  unread_count: number;
  has_more: boolean;
}

export interface NotificationMarkReadRequest {
  notification_ids?: string[];
  mark_all_read?: boolean;
}

export interface NotificationMarkReadResponse {
  updated_count: number;
  message: string;
}

export type NotificationType =
  | 'download_complete'
  | 'wishlist_promotion'
  | 'new_author'
  | 'system'
  | 'onboarding_reminder'
  | 'reading_milestone'
  | 'recommendation_available'
  | 'library_full'
  | 'wishlist_expiring';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  renotify?: boolean;
  silent?: boolean;
  data?: Record<string, any>;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  types: Record<NotificationType, boolean>;
  quiet_hours: {
    enabled: boolean;
    start_time: string; // HH:MM format
    end_time: string;   // HH:MM format
    timezone: string;
  };
  frequency: {
    instant: NotificationType[];
    daily_digest: NotificationType[];
    weekly_digest: NotificationType[];
  };
}

// Constants
export const NOTIFICATION_CONSTANTS = {
  MAX_TITLE_LENGTH: 100,
  MAX_MESSAGE_LENGTH: 500,
  MAX_FAIRY_MESSAGE_LENGTH: 300,
  DEFAULT_EXPIRY_DAYS: 30,
  BATCH_SIZE: 50,
  RETRY_ATTEMPTS: 3
} as const;

export const NOTIFICATION_ICONS = {
  download_complete: '📚',
  wishlist_promotion: '⭐',
  new_author: '👤',
  system: '⚙️',
  onboarding_reminder: '✨',
  reading_milestone: '🏆',
  recommendation_available: '💡',
  library_full: '📦',
  wishlist_expiring: '⏰'
} as const;

export const NOTIFICATION_COLORS = {
  low: '#9E9E9E',      // Gray
  normal: '#2196F3',   // Blue
  high: '#FF9800',     // Orange
  urgent: '#F44336'    // Red
} as const;

// Default preferences
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  push_enabled: true,
  email_enabled: true,
  types: {
    download_complete: true,
    wishlist_promotion: true,
    new_author: true,
    system: true,
    onboarding_reminder: true,
    reading_milestone: true,
    recommendation_available: true,
    library_full: true,
    wishlist_expiring: true
  },
  quiet_hours: {
    enabled: false,
    start_time: '22:00',
    end_time: '08:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  },
  frequency: {
    instant: ['download_complete', 'wishlist_promotion', 'system'],
    daily_digest: ['new_author', 'recommendation_available'],
    weekly_digest: ['reading_milestone']
  }
};

// Validation functions
export function validateNotificationCreate(notification: NotificationCreate): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!notification.title || notification.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (notification.title.length > NOTIFICATION_CONSTANTS.MAX_TITLE_LENGTH) {
    errors.push(`Title must not exceed ${NOTIFICATION_CONSTANTS.MAX_TITLE_LENGTH} characters`);
  }

  if (!notification.message || notification.message.trim().length === 0) {
    errors.push('Message is required');
  } else if (notification.message.length > NOTIFICATION_CONSTANTS.MAX_MESSAGE_LENGTH) {
    errors.push(`Message must not exceed ${NOTIFICATION_CONSTANTS.MAX_MESSAGE_LENGTH} characters`);
  }

  if (notification.fairy_message && notification.fairy_message.length > NOTIFICATION_CONSTANTS.MAX_FAIRY_MESSAGE_LENGTH) {
    errors.push(`Fairy message must not exceed ${NOTIFICATION_CONSTANTS.MAX_FAIRY_MESSAGE_LENGTH} characters`);
  }

  const validTypes: NotificationType[] = [
    'download_complete', 'wishlist_promotion', 'new_author', 'system',
    'onboarding_reminder', 'reading_milestone', 'recommendation_available',
    'library_full', 'wishlist_expiring'
  ];

  if (!validTypes.includes(notification.type)) {
    errors.push('Invalid notification type');
  }

  const validPriorities: NotificationPriority[] = ['low', 'normal', 'high', 'urgent'];
  if (notification.priority && !validPriorities.includes(notification.priority)) {
    errors.push('Invalid notification priority');
  }

  if (notification.expires_at) {
    const expiryDate = new Date(notification.expires_at);
    if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
      errors.push('Expiry date must be a valid future date');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Utility functions
export function getNotificationIcon(type: NotificationType): string {
  return NOTIFICATION_ICONS[type] || '📋';
}

export function getNotificationColor(priority: NotificationPriority): string {
  return NOTIFICATION_COLORS[priority];
}

export function getNotificationTypeLabel(type: NotificationType): string {
  const labels: Record<NotificationType, string> = {
    download_complete: 'Download Complete',
    wishlist_promotion: 'Wishlist Promotion',
    new_author: 'New Author',
    system: 'System',
    onboarding_reminder: 'Onboarding Reminder',
    reading_milestone: 'Reading Milestone',
    recommendation_available: 'New Recommendations',
    library_full: 'Library Full',
    wishlist_expiring: 'Wishlist Expiring'
  };

  return labels[type];
}

export function isNotificationExpired(notification: Notification): boolean {
  if (!notification.expires_at) return false;
  return new Date(notification.expires_at) <= new Date();
}

export function shouldShowNotification(
  notification: Notification,
  preferences: NotificationPreferences
): boolean {
  // Check if notifications are enabled
  if (!preferences.enabled) return false;

  // Check if this type is enabled
  if (!preferences.types[notification.type]) return false;

  // Check if expired
  if (isNotificationExpired(notification)) return false;

  // Check quiet hours
  if (preferences.quiet_hours.enabled) {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const { start_time, end_time } = preferences.quiet_hours;

    // Handle quiet hours that span midnight
    if (start_time > end_time) {
      if (currentTime >= start_time || currentTime <= end_time) {
        // Only show urgent notifications during quiet hours
        return notification.priority === 'urgent';
      }
    } else {
      if (currentTime >= start_time && currentTime <= end_time) {
        return notification.priority === 'urgent';
      }
    }
  }

  return true;
}

export function generateFairyNotificationMessage(type: NotificationType, context?: any): string {
  const messages: Record<NotificationType, string[]> = {
    download_complete: [
      `Well honey, your book is ready! Time to cozy up with "${context?.title}"!`,
      `Oh my stars! "${context?.title}" just finished downloading, sugar!`,
      `Bless your heart, your audiobook is all set! "${context?.title}" is waiting for you!`
    ],
    wishlist_promotion: [
      `Well sugar, "${context?.title}" just got promoted from your wishlist!`,
      `Oh honey, good news! "${context?.title}" is ready for download!`,
      `Bless your heart, your patience paid off! "${context?.title}" is here!`
    ],
    new_author: [
      `Well honey, ${context?.author} has a new book out! Thought you might like to know!`,
      `Oh my stars! Your favorite author ${context?.author} is back with something new!`,
      `Sugar, you're gonna love this - ${context?.author} just released a new audiobook!`
    ],
    system: [
      `Well honey, just a little system update for you!`,
      `Sugar, we've got some housekeeping news!`,
      `Bless your heart, here's what's happening with your BookFairy!`
    ],
    onboarding_reminder: [
      `Well honey, it's been a while! Ready for your 60-day check-in?`,
      `Sugar, time flies! Let's refresh your reading preferences!`,
      `Bless your heart, let's make sure your BookFairy is still perfect for you!`
    ],
    reading_milestone: [
      `Oh my stars! You've hit a reading milestone, sugar!`,
      `Well honey, look at you go! ${context?.milestone} books completed!`,
      `Bless your heart, you're on fire! ${context?.milestone} audiobooks down!`
    ],
    recommendation_available: [
      `Well sugar, I've found some books you might just love!`,
      `Oh honey, got some sweet recommendations waiting for you!`,
      `Bless your heart, these new suggestions are gonna be perfect!`
    ],
    library_full: [
      `Well honey, your library's getting mighty full! Time to tidy up?`,
      `Sugar, you've got more books than a magnolia has leaves!`,
      `Bless your heart, might be time to archive some finished books!`
    ],
    wishlist_expiring: [
      `Well honey, some of your wishlist items are about to expire!`,
      `Sugar, better check your wishlist - time's tickin'!`,
      `Bless your heart, don't let those book wishes slip away!`
    ]
  };

  const typeMessages = messages[type];
  return typeMessages[Math.floor(Math.random() * typeMessages.length)];
}

export function createPushNotificationPayload(notification: Notification): PushNotificationPayload {
  const payload: PushNotificationPayload = {
    title: notification.title,
    body: notification.fairy_message || notification.message,
    icon: '/icons/bookfairy-notification-icon.png',
    badge: '/icons/bookfairy-badge.png',
    tag: `bookfairy-${notification.type}`,
    data: {
      notification_id: notification.id,
      type: notification.type,
      action_url: notification.action_url,
      timestamp: notification.delivery_timestamp
    }
  };

  // Add book cover as image if available
  if (notification.related_book?.cover_image_url) {
    payload.image = notification.related_book.cover_image_url;
  }

  // Add actions based on notification type
  if (notification.action_url && notification.action_label) {
    payload.actions = [
      {
        action: 'open',
        title: notification.action_label,
        icon: '/icons/open-action.png'
      }
    ];
  }

  // Silent notifications for low priority
  if (notification.priority === 'low') {
    payload.silent = true;
  }

  return payload;
}

export function sortNotifications(
  notifications: Notification[],
  sortBy: 'date' | 'priority' | 'type' | 'read_status' = 'date'
): Notification[] {
  return [...notifications].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        // Fall through to date for secondary sort
        return new Date(b.delivery_timestamp).getTime() - new Date(a.delivery_timestamp).getTime();

      case 'type':
        const typeDiff = a.type.localeCompare(b.type);
        if (typeDiff !== 0) return typeDiff;
        // Fall through to date for secondary sort
        return new Date(b.delivery_timestamp).getTime() - new Date(a.delivery_timestamp).getTime();

      case 'read_status':
        const readDiff = Number(a.read_status) - Number(b.read_status);
        if (readDiff !== 0) return readDiff;
        // Fall through to date for secondary sort
        return new Date(b.delivery_timestamp).getTime() - new Date(a.delivery_timestamp).getTime();

      case 'date':
      default:
        return new Date(b.delivery_timestamp).getTime() - new Date(a.delivery_timestamp).getTime();
    }
  });
}

export function filterNotifications(
  notifications: Notification[],
  filters: {
    types?: NotificationType[];
    read_status?: boolean;
    priority?: NotificationPriority[];
    date_from?: string;
    date_to?: string;
    has_action?: boolean;
  }
): Notification[] {
  return notifications.filter(notification => {
    // Type filter
    if (filters.types && !filters.types.includes(notification.type)) {
      return false;
    }

    // Read status filter
    if (filters.read_status !== undefined && notification.read_status !== filters.read_status) {
      return false;
    }

    // Priority filter
    if (filters.priority && !filters.priority.includes(notification.priority)) {
      return false;
    }

    // Date range filter
    if (filters.date_from) {
      const notificationDate = new Date(notification.delivery_timestamp);
      if (notificationDate < new Date(filters.date_from)) {
        return false;
      }
    }

    if (filters.date_to) {
      const notificationDate = new Date(notification.delivery_timestamp);
      if (notificationDate > new Date(filters.date_to)) {
        return false;
      }
    }

    // Action filter
    if (filters.has_action !== undefined) {
      const hasAction = !!(notification.action_url && notification.action_label);
      if (hasAction !== filters.has_action) {
        return false;
      }
    }

    return true;
  });
}

export function groupNotificationsByDate(notifications: Notification[]): Record<string, Notification[]> {
  const groups: Record<string, Notification[]> = {};

  notifications.forEach(notification => {
    const date = new Date(notification.delivery_timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
  });

  return groups;
}

export function getUnreadCount(notifications: Notification[]): number {
  return notifications.filter(n => !n.read_status).length;
}

export function getNotificationAge(notification: Notification): string {
  const now = new Date();
  const notificationDate = new Date(notification.delivery_timestamp);
  const diffMs = now.getTime() - notificationDate.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return notificationDate.toLocaleDateString();
}

// Type guards
export function isNotification(obj: any): obj is Notification {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.message === 'string' &&
    typeof obj.fairy_message === 'string' &&
    typeof obj.delivery_timestamp === 'string' &&
    typeof obj.read_status === 'boolean' &&
    typeof obj.priority === 'string'
  );
}

export function isNotificationResponse(obj: any): obj is NotificationResponse {
  return (
    obj &&
    Array.isArray(obj.notifications) &&
    typeof obj.unread_count === 'number' &&
    typeof obj.has_more === 'boolean'
  );
}