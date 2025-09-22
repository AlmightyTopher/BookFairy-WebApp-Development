/**
 * WishlistItem Entity Interface
 *
 * Defines the wishlist queue item structure with auto-promotion logic
 * and expiration management for the BookFairy system
 */

import { Book } from './Book';

export interface WishlistItem {
  id: string;
  user_id: string;
  book: Book;
  requested_date: string;
  priority: number;
  status: WishlistStatus;
  expiration_date: string;
  queue_position: number;
  days_remaining: number;
  processing_progress?: number;
  promotion_notification?: boolean;
  promotion_error?: string;
  fairy_celebration?: string;
  estimated_promotion_date?: string;
}

export interface WishlistItemCreate {
  book_id: string;
  priority?: number;
}

export interface WishlistItemUpdate {
  priority?: number;
  retry_expired?: boolean;
}

export interface QueueInfo {
  total_items: number;
  pending_items: number;
  processing_items: number;
  expired_items: number;
  fulfilled_items: number;
  next_promotion_estimate: string;
  available_slots: number;
  queue_velocity: number; // items processed per day
  average_wait_time_days: number;
}

export type WishlistStatus = 'pending' | 'processing' | 'expired' | 'fulfilled';

export interface WishlistResponse {
  wishlist_items: WishlistItem[];
  queue_info: QueueInfo;
  fairy_status: string;
}

export interface WishlistAddResponse {
  wishlist_item: WishlistItem;
  queue_position: number;
  fairy_response: string;
}

export interface WishlistUpdateResponse {
  wishlist_item: WishlistItem;
  fairy_response: string;
}

export interface WishlistRemoveResponse {
  message: string;
  fairy_response: string;
}

// Queue management constants
export const WISHLIST_CONSTANTS = {
  DEFAULT_PRIORITY: 5,
  MAX_PRIORITY: 10,
  MIN_PRIORITY: 1,
  EXPIRATION_DAYS: 30,
  MAX_QUEUE_SIZE: 50,
  DEFAULT_PROCESSING_SLOTS: 3,
  PROMOTION_CHECK_INTERVAL_HOURS: 6,
  HIGH_PRIORITY_THRESHOLD: 8,
  LOW_PRIORITY_THRESHOLD: 3
} as const;

// Validation functions
export function validatePriority(priority: number): boolean {
  return Number.isInteger(priority) &&
         priority >= WISHLIST_CONSTANTS.MIN_PRIORITY &&
         priority <= WISHLIST_CONSTANTS.MAX_PRIORITY;
}

export function validateWishlistItemCreate(item: WishlistItemCreate): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!item.book_id) {
    errors.push('book_id is required');
  } else {
    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(item.book_id)) {
      errors.push('Invalid book_id format');
    }
  }

  if (item.priority !== undefined && !validatePriority(item.priority)) {
    errors.push(`Priority must be between ${WISHLIST_CONSTANTS.MIN_PRIORITY} and ${WISHLIST_CONSTANTS.MAX_PRIORITY}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateWishlistItemUpdate(update: WishlistItemUpdate): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (update.priority !== undefined && !validatePriority(update.priority)) {
    errors.push(`Priority must be between ${WISHLIST_CONSTANTS.MIN_PRIORITY} and ${WISHLIST_CONSTANTS.MAX_PRIORITY}`);
  }

  if (update.retry_expired !== undefined && typeof update.retry_expired !== 'boolean') {
    errors.push('retry_expired must be a boolean');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Utility functions
export function calculateDaysRemaining(expirationDate: string): number {
  const expiration = new Date(expirationDate);
  const now = new Date();
  const diffTime = expiration.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function calculateExpirationDate(requestedDate: string): string {
  const requested = new Date(requestedDate);
  const expiration = new Date(requested);
  expiration.setDate(expiration.getDate() + WISHLIST_CONSTANTS.EXPIRATION_DAYS);

  return expiration.toISOString();
}

export function isWishlistItemExpired(item: WishlistItem): boolean {
  return item.days_remaining < 0 || item.status === 'expired';
}

export function isWishlistItemExpiringSoon(item: WishlistItem, daysThreshold: number = 3): boolean {
  return item.days_remaining <= daysThreshold && item.days_remaining > 0;
}

export function getWishlistItemStatusColor(status: WishlistStatus): string {
  const statusColors = {
    pending: '#FFA500',    // Orange
    processing: '#007AFF',  // Blue
    expired: '#FF4444',     // Red
    fulfilled: '#00C851'    // Green
  };

  return statusColors[status];
}

export function getWishlistItemStatusIcon(status: WishlistStatus): string {
  const statusIcons = {
    pending: '⏳',
    processing: '⚙️',
    expired: '❌',
    fulfilled: '✅'
  };

  return statusIcons[status];
}

export function getPriorityLabel(priority: number): string {
  if (priority >= WISHLIST_CONSTANTS.HIGH_PRIORITY_THRESHOLD) {
    return 'High';
  } else if (priority <= WISHLIST_CONSTANTS.LOW_PRIORITY_THRESHOLD) {
    return 'Low';
  } else {
    return 'Medium';
  }
}

export function getPriorityColor(priority: number): string {
  if (priority >= WISHLIST_CONSTANTS.HIGH_PRIORITY_THRESHOLD) {
    return '#FF4444'; // Red
  } else if (priority <= WISHLIST_CONSTANTS.LOW_PRIORITY_THRESHOLD) {
    return '#666666'; // Gray
  } else {
    return '#FFA500'; // Orange
  }
}

export function calculateQueuePosition(
  items: WishlistItem[],
  targetItem: WishlistItem
): number {
  const pendingItems = items
    .filter(item => item.status === 'pending')
    .sort((a, b) => {
      // Sort by priority (descending), then by requested date (ascending)
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return new Date(a.requested_date).getTime() - new Date(b.requested_date).getTime();
    });

  const position = pendingItems.findIndex(item => item.id === targetItem.id);
  return position === -1 ? -1 : position + 1;
}

export function estimatePromotionDate(
  item: WishlistItem,
  queueInfo: QueueInfo
): string {
  if (item.status !== 'pending') {
    return '';
  }

  const daysToPromotion = Math.ceil(
    (item.queue_position - 1) / Math.max(queueInfo.queue_velocity, 0.1)
  );

  const promotionDate = new Date();
  promotionDate.setDate(promotionDate.getDate() + daysToPromotion);

  return promotionDate.toISOString();
}

export function generateFairyQueueMessage(queueInfo: QueueInfo): string {
  const { total_items, pending_items, processing_items, available_slots } = queueInfo;

  if (total_items === 0) {
    return "Well honey, your wishlist is emptier than a sweet tea pitcher in August! Time to find some books!";
  }

  if (pending_items === 0 && processing_items > 0) {
    return `Oh my stars! You've got ${processing_items} book${processing_items > 1 ? 's' : ''} cookin' right now!`;
  }

  if (available_slots > 0) {
    return `Well sugar, there are ${available_slots} open slot${available_slots > 1 ? 's' : ''} - your books are movin' along nicely!`;
  }

  return `Bless your heart, you've got ${pending_items} book${pending_items > 1 ? 's' : ''} waiting in line. Good things come to those who wait!`;
}

export function generateFairyPromotionMessage(item: WishlistItem): string {
  const celebrations = [
    `Oh honey, "${item.book.title}" just got promoted to your library! Time to celebrate!`,
    `Well sugar, your book is ready! "${item.book.title}" by ${item.book.author} is waiting for you!`,
    `Bless your heart, the wait is over! "${item.book.title}" has arrived and it's looking mighty fine!`,
    `Oh my stars! "${item.book.title}" just landed in your library like a butterfly on a magnolia!`
  ];

  return celebrations[Math.floor(Math.random() * celebrations.length)];
}

export function generateFairyAddedMessage(item: WishlistItem, queuePosition: number): string {
  const messages = [
    `Well honey, "${item.book.title}" is now #${queuePosition} in your wishlist queue!`,
    `Sugar, I've added "${item.book.title}" to your wishlist - position ${queuePosition} and counting!`,
    `Bless your heart, "${item.book.title}" is all queued up at position ${queuePosition}!`,
    `Oh my stars, "${item.book.title}" is in line at spot ${queuePosition} - patience is a virtue, darling!`
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

export function sortWishlistItems(
  items: WishlistItem[],
  sortBy: 'priority' | 'date' | 'position' | 'expiration' = 'position'
): WishlistItem[] {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        return b.priority - a.priority ||
               new Date(a.requested_date).getTime() - new Date(b.requested_date).getTime();

      case 'date':
        return new Date(b.requested_date).getTime() - new Date(a.requested_date).getTime();

      case 'expiration':
        return a.days_remaining - b.days_remaining;

      case 'position':
      default:
        return a.queue_position - b.queue_position;
    }
  });
}

export function filterWishlistItems(
  items: WishlistItem[],
  filters: {
    status?: WishlistStatus[];
    includeExpired?: boolean;
    priorityMin?: number;
    priorityMax?: number;
    expiringSoon?: boolean;
  }
): WishlistItem[] {
  return items.filter(item => {
    // Status filter
    if (filters.status && !filters.status.includes(item.status)) {
      return false;
    }

    // Expired filter
    if (!filters.includeExpired && isWishlistItemExpired(item)) {
      return false;
    }

    // Priority range filter
    if (filters.priorityMin !== undefined && item.priority < filters.priorityMin) {
      return false;
    }

    if (filters.priorityMax !== undefined && item.priority > filters.priorityMax) {
      return false;
    }

    // Expiring soon filter
    if (filters.expiringSoon && !isWishlistItemExpiringSoon(item)) {
      return false;
    }

    return true;
  });
}

// Type guards
export function isWishlistItem(obj: any): obj is WishlistItem {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    obj.book &&
    typeof obj.requested_date === 'string' &&
    typeof obj.priority === 'number' &&
    ['pending', 'processing', 'expired', 'fulfilled'].includes(obj.status) &&
    typeof obj.expiration_date === 'string' &&
    typeof obj.queue_position === 'number' &&
    typeof obj.days_remaining === 'number'
  );
}

export function isWishlistResponse(obj: any): obj is WishlistResponse {
  return (
    obj &&
    Array.isArray(obj.wishlist_items) &&
    obj.queue_info &&
    typeof obj.fairy_status === 'string'
  );
}