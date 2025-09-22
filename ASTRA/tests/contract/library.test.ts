import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/services/supabase/client';

/**
 * Contract Tests for Library Management API
 *
 * These tests validate the library service contracts
 * against the OpenAPI specification defined in contracts/library.yaml
 *
 * Tests MUST FAIL until the library service is implemented
 */

describe('Library Contract Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /library/wishlist - Get user\'s wishlist', () => {
    it('should return user\'s complete wishlist', async () => {
      // This test MUST FAIL until WishlistQueue component is implemented
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: {
          session: {
            access_token: 'valid_token',
            user: { id: 'user_id', email: 'test@example.com' }
          }
        },
        error: null
      } as any);

      const libraryService = await import('@/services/library/wishlist');

      const result = await libraryService.getUserWishlist({});

      expect(result).toBeDefined();
      expect(result.wishlist_items).toBeInstanceOf(Array);
      expect(result.queue_info).toBeDefined();
      expect(result.queue_info.total_items).toBeGreaterThanOrEqual(0);
      expect(result.queue_info.pending_items).toBeGreaterThanOrEqual(0);
      expect(result.queue_info.processing_items).toBeGreaterThanOrEqual(0);
      expect(result.queue_info.available_slots).toBeGreaterThanOrEqual(0);
      expect(result.fairy_status).toBeDefined();
      expect(result.fairy_status).toMatch(/Well honey|Sugar|Bless your heart|Oh my stars/);
    });

    it('should filter wishlist by status', async () => {
      const libraryService = await import('@/services/library/wishlist');

      const result = await libraryService.getUserWishlist({
        status: 'pending'
      });

      expect(result.wishlist_items).toBeInstanceOf(Array);
      result.wishlist_items.forEach(item => {
        expect(item.status).toBe('pending');
        expect(item.id).toBeDefined();
        expect(item.book).toBeDefined();
        expect(item.requested_date).toBeDefined();
        expect(item.expiration_date).toBeDefined();
        expect(item.queue_position).toBeGreaterThan(0);
        expect(item.days_remaining).toBeTypeOf('number');
      });
    });

    it('should exclude expired items by default', async () => {
      const libraryService = await import('@/services/library/wishlist');

      const result = await libraryService.getUserWishlist({});

      result.wishlist_items.forEach(item => {
        expect(item.status).not.toBe('expired');
      });
    });

    it('should include expired items when requested', async () => {
      const libraryService = await import('@/services/library/wishlist');

      const result = await libraryService.getUserWishlist({
        include_expired: true
      });

      expect(result.wishlist_items).toBeInstanceOf(Array);
      expect(result.queue_info.expired_items).toBeGreaterThanOrEqual(0);
    });

    it('should require authentication', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null
      } as any);

      const libraryService = await import('@/services/library/wishlist');

      await expect(libraryService.getUserWishlist({})).rejects.toThrow('Authentication required');
    });
  });

  describe('POST /library/wishlist - Add book to wishlist', () => {
    it('should add book to wishlist with queue position', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: {
          session: {
            access_token: 'valid_token',
            user: { id: 'user_id', email: 'test@example.com' }
          }
        },
        error: null
      } as any);

      const libraryService = await import('@/services/library/wishlist');

      const result = await libraryService.addToWishlist({
        book_id: '123e4567-e89b-12d3-a456-426614174000'
      });

      expect(result).toBeDefined();
      expect(result.wishlist_item).toBeDefined();
      expect(result.wishlist_item.id).toBeDefined();
      expect(result.wishlist_item.book.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result.queue_position).toBeGreaterThan(0);
      expect(result.fairy_response).toBeDefined();
      expect(result.fairy_response).toMatch(/Well sugar|Oh honey|Bless your heart/);
    });

    it('should add book with priority', async () => {
      const libraryService = await import('@/services/library/wishlist');

      const result = await libraryService.addToWishlist({
        book_id: '123e4567-e89b-12d3-a456-426614174000',
        priority: 5
      });

      expect(result.wishlist_item.priority).toBe(5);
      expect(result.queue_position).toBeGreaterThan(0);
    });

    it('should reject invalid book ID', async () => {
      const libraryService = await import('@/services/library/wishlist');

      await expect(
        libraryService.addToWishlist({
          book_id: 'invalid-uuid'
        })
      ).rejects.toThrow('Invalid book ID format');
    });

    it('should reject duplicate book in wishlist', async () => {
      const libraryService = await import('@/services/library/wishlist');

      await expect(
        libraryService.addToWishlist({
          book_id: '123e4567-e89b-12d3-a456-426614174000'
        })
      ).rejects.toThrow('Book already in wishlist');
    });

    it('should require book_id parameter', async () => {
      const libraryService = await import('@/services/library/wishlist');

      await expect(
        libraryService.addToWishlist({} as any)
      ).rejects.toThrow('book_id is required');
    });
  });

  describe('DELETE /library/wishlist/{wishlist_item_id} - Remove item from wishlist', () => {
    it('should remove item from wishlist', async () => {
      const libraryService = await import('@/services/library/wishlist');

      const result = await libraryService.removeFromWishlist('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toBeDefined();
      expect(result.message).toBe('Item removed from wishlist');
      expect(result.fairy_response).toBeDefined();
      expect(result.fairy_response).toMatch(/Well sugar|Oh honey|Bless your heart/);
    });

    it('should handle non-existent wishlist item', async () => {
      const libraryService = await import('@/services/library/wishlist');

      await expect(
        libraryService.removeFromWishlist('non-existent-id')
      ).rejects.toThrow('Wishlist item not found');
    });

    it('should validate UUID format', async () => {
      const libraryService = await import('@/services/library/wishlist');

      await expect(
        libraryService.removeFromWishlist('invalid-uuid')
      ).rejects.toThrow('Invalid wishlist item ID format');
    });
  });

  describe('PATCH /library/wishlist/{wishlist_item_id} - Update wishlist item', () => {
    it('should update wishlist item priority', async () => {
      const libraryService = await import('@/services/library/wishlist');

      const result = await libraryService.updateWishlistItem('123e4567-e89b-12d3-a456-426614174000', {
        priority: 10
      });

      expect(result).toBeDefined();
      expect(result.wishlist_item.priority).toBe(10);
      expect(result.fairy_response).toBeDefined();
    });

    it('should retry expired item', async () => {
      const libraryService = await import('@/services/library/wishlist');

      const result = await libraryService.updateWishlistItem('123e4567-e89b-12d3-a456-426614174000', {
        retry_expired: true
      });

      expect(result.wishlist_item.status).toBe('pending');
      expect(result.wishlist_item.expiration_date).toBeDefined();
    });

    it('should validate priority bounds', async () => {
      const libraryService = await import('@/services/library/wishlist');

      await expect(
        libraryService.updateWishlistItem('123e4567-e89b-12d3-a456-426614174000', {
          priority: 0 // below minimum
        })
      ).rejects.toThrow('Priority must be at least 1');
    });

    it('should handle non-existent item', async () => {
      const libraryService = await import('@/services/library/wishlist');

      await expect(
        libraryService.updateWishlistItem('non-existent-id', { priority: 5 })
      ).rejects.toThrow('Wishlist item not found');
    });
  });

  describe('GET /library/books - Get user\'s library', () => {
    it('should return user\'s complete library', async () => {
      const libraryService = await import('@/services/library/books');

      const result = await libraryService.getUserLibrary({});

      expect(result).toBeDefined();
      expect(result.library_items).toBeInstanceOf(Array);
      expect(result.pagination).toBeDefined();
      expect(result.library_stats).toBeDefined();
      expect(result.library_stats.total_books).toBeGreaterThanOrEqual(0);
      expect(result.library_stats.completed_books).toBeGreaterThanOrEqual(0);
      expect(result.library_stats.total_listening_hours).toBeGreaterThanOrEqual(0);
      expect(result.library_stats.favorite_genres).toBeInstanceOf(Array);
      expect(result.library_stats.reading_streak_days).toBeGreaterThanOrEqual(0);
    });

    it('should filter by completion status', async () => {
      const libraryService = await import('@/services/library/books');

      const result = await libraryService.getUserLibrary({
        completion_status: 'completed'
      });

      result.library_items.forEach(item => {
        expect(item.completion_status).toBe('completed');
        expect(item.id).toBeDefined();
        expect(item.book).toBeDefined();
        expect(item.added_date).toBeDefined();
        expect(item.download_completed_date).toBeDefined();
      });
    });

    it('should handle pagination correctly', async () => {
      const libraryService = await import('@/services/library/books');

      const result = await libraryService.getUserLibrary({
        page: 2,
        limit: 10
      });

      expect(result.pagination.current_page).toBe(2);
      expect(result.pagination.items_per_page).toBe(10);
      expect(result.library_items.length).toBeLessThanOrEqual(10);
    });

    it('should validate limit bounds', async () => {
      const libraryService = await import('@/services/library/books');

      await expect(
        libraryService.getUserLibrary({
          limit: 101 // exceeds maximum
        })
      ).rejects.toThrow('Limit must be between 1 and 100');
    });
  });

  describe('PATCH /library/books/{library_item_id} - Update library item', () => {
    it('should update library item completion status', async () => {
      const libraryService = await import('@/services/library/books');

      const result = await libraryService.updateLibraryItem('123e4567-e89b-12d3-a456-426614174000', {
        completion_status: 'completed'
      });

      expect(result).toBeDefined();
      expect(result.library_item.completion_status).toBe('completed');
      expect(result.fairy_response).toBeDefined();
      expect(result.fairy_response).toMatch(/Well sugar|Oh honey|Bless your heart/);
    });

    it('should update user rating', async () => {
      const libraryService = await import('@/services/library/books');

      const result = await libraryService.updateLibraryItem('123e4567-e89b-12d3-a456-426614174000', {
        user_rating: 5
      });

      expect(result.library_item.user_rating).toBe(5);
    });

    it('should update user notes', async () => {
      const libraryService = await import('@/services/library/books');

      const result = await libraryService.updateLibraryItem('123e4567-e89b-12d3-a456-426614174000', {
        user_notes: 'Amazing book! Loved the narrator.'
      });

      expect(result.library_item.user_notes).toBe('Amazing book! Loved the narrator.');
    });

    it('should validate rating bounds', async () => {
      const libraryService = await import('@/services/library/books');

      await expect(
        libraryService.updateLibraryItem('123e4567-e89b-12d3-a456-426614174000', {
          user_rating: 6 // exceeds maximum
        })
      ).rejects.toThrow('Rating must be between 1 and 5');
    });

    it('should validate notes length', async () => {
      const libraryService = await import('@/services/library/books');

      await expect(
        libraryService.updateLibraryItem('123e4567-e89b-12d3-a456-426614174000', {
          user_notes: 'x'.repeat(1001) // exceeds maximum length
        })
      ).rejects.toThrow('Notes must not exceed 1000 characters');
    });

    it('should handle non-existent library item', async () => {
      const libraryService = await import('@/services/library/books');

      await expect(
        libraryService.updateLibraryItem('non-existent-id', {
          completion_status: 'completed'
        })
      ).rejects.toThrow('Library item not found');
    });
  });

  describe('GET /library/notifications - Get user\'s notifications', () => {
    it('should return user\'s notifications', async () => {
      const libraryService = await import('@/services/library/notifications');

      const result = await libraryService.getUserNotifications({});

      expect(result).toBeDefined();
      expect(result.notifications).toBeInstanceOf(Array);
      expect(result.unread_count).toBeGreaterThanOrEqual(0);

      result.notifications.forEach(notification => {
        expect(notification.id).toBeDefined();
        expect(notification.type).toMatch(/download_complete|wishlist_promotion|new_author|system/);
        expect(notification.title).toBeDefined();
        expect(notification.message).toBeDefined();
        expect(notification.message).toMatch(/Well honey|Sugar|Bless your heart|Oh my stars/);
        expect(notification.delivery_timestamp).toBeDefined();
        expect(notification.read_status).toBeTypeOf('boolean');
      });
    });

    it('should filter by notification type', async () => {
      const libraryService = await import('@/services/library/notifications');

      const result = await libraryService.getUserNotifications({
        type: 'download_complete'
      });

      result.notifications.forEach(notification => {
        expect(notification.type).toBe('download_complete');
      });
    });

    it('should filter unread notifications only', async () => {
      const libraryService = await import('@/services/library/notifications');

      const result = await libraryService.getUserNotifications({
        unread_only: true
      });

      result.notifications.forEach(notification => {
        expect(notification.read_status).toBe(false);
      });
    });

    it('should respect limit parameter', async () => {
      const libraryService = await import('@/services/library/notifications');

      const result = await libraryService.getUserNotifications({
        limit: 5
      });

      expect(result.notifications.length).toBeLessThanOrEqual(5);
    });

    it('should validate limit bounds', async () => {
      const libraryService = await import('@/services/library/notifications');

      await expect(
        libraryService.getUserNotifications({
          limit: 101 // exceeds maximum
        })
      ).rejects.toThrow('Limit must be between 1 and 100');
    });
  });

  describe('PATCH /library/notifications - Mark notifications as read', () => {
    it('should mark specific notifications as read', async () => {
      const libraryService = await import('@/services/library/notifications');

      const result = await libraryService.markNotificationsRead({
        notification_ids: [
          '123e4567-e89b-12d3-a456-426614174000',
          '987fcdeb-51d2-43a1-b123-456789abcdef'
        ]
      });

      expect(result).toBeDefined();
      expect(result.updated_count).toBe(2);
      expect(result.message).toBeDefined();
    });

    it('should mark all notifications as read', async () => {
      const libraryService = await import('@/services/library/notifications');

      const result = await libraryService.markNotificationsRead({
        mark_all_read: true
      });

      expect(result.updated_count).toBeGreaterThanOrEqual(0);
      expect(result.message).toBe('All notifications marked as read');
    });

    it('should validate notification IDs format', async () => {
      const libraryService = await import('@/services/library/notifications');

      await expect(
        libraryService.markNotificationsRead({
          notification_ids: ['invalid-uuid']
        })
      ).rejects.toThrow('Invalid notification ID format');
    });

    it('should require either notification_ids or mark_all_read', async () => {
      const libraryService = await import('@/services/library/notifications');

      await expect(
        libraryService.markNotificationsRead({})
      ).rejects.toThrow('Either notification_ids or mark_all_read must be provided');
    });
  });

  describe('Error Response Format', () => {
    it('should return errors in specified format with fairy_message', async () => {
      const libraryService = await import('@/services/library/wishlist');

      try {
        await libraryService.addToWishlist({
          book_id: 'invalid-id'
        });
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.error).toBeDefined();
        expect(error.message).toBeDefined();
        expect(error.fairy_message).toBeDefined();
        expect(error.fairy_message).toMatch(/Well sugar|Oh honey|Bless your heart|Oh my stars/);
      }
    });
  });
});

/**
 * Integration Tests for Library Management Flow
 * These test the complete library workflow end-to-end
 */
describe('Library Integration Contract Tests', () => {
  it('should complete full wishlist to library flow', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          access_token: 'valid_token',
          user: { id: 'user_id', email: 'test@example.com' }
        }
      },
      error: null
    } as any);

    const wishlistService = await import('@/services/library/wishlist');
    const libraryService = await import('@/services/library/books');
    const notificationsService = await import('@/services/library/notifications');

    // Step 1: Add book to wishlist
    const addResult = await wishlistService.addToWishlist({
      book_id: '123e4567-e89b-12d3-a456-426614174000',
      priority: 5
    });

    expect(addResult.wishlist_item).toBeDefined();
    expect(addResult.queue_position).toBeGreaterThan(0);

    // Step 2: Check wishlist status
    const wishlistResult = await wishlistService.getUserWishlist({});
    expect(wishlistResult.wishlist_items).toBeInstanceOf(Array);
    expect(wishlistResult.queue_info.pending_items).toBeGreaterThan(0);

    // Step 3: Simulate book promotion to library
    const libraryResult = await libraryService.getUserLibrary({});
    expect(libraryResult.library_items).toBeInstanceOf(Array);

    // Step 4: Check for notifications
    const notificationsResult = await notificationsService.getUserNotifications({});
    expect(notificationsResult.notifications).toBeInstanceOf(Array);
  });

  it('should handle library item lifecycle management', async () => {
    const libraryService = await import('@/services/library/books');

    // Step 1: Get library with downloaded items
    const libraryResult = await libraryService.getUserLibrary({
      completion_status: 'downloaded'
    });

    expect(libraryResult.library_items).toBeInstanceOf(Array);

    // Step 2: Start reading a book
    if (libraryResult.library_items.length > 0) {
      const libraryItem = libraryResult.library_items[0];
      const updateResult = await libraryService.updateLibraryItem(libraryItem.id, {
        completion_status: 'started'
      });

      expect(updateResult.library_item.completion_status).toBe('started');

      // Step 3: Complete the book with rating
      const completeResult = await libraryService.updateLibraryItem(libraryItem.id, {
        completion_status: 'completed',
        user_rating: 5,
        user_notes: 'Excellent audiobook!'
      });

      expect(completeResult.library_item.completion_status).toBe('completed');
      expect(completeResult.library_item.user_rating).toBe(5);
    }
  });

  it('should handle notification workflow', async () => {
    const notificationsService = await import('@/services/library/notifications');

    // Step 1: Get unread notifications
    const unreadResult = await notificationsService.getUserNotifications({
      unread_only: true
    });

    expect(unreadResult.notifications).toBeInstanceOf(Array);
    const initialUnreadCount = unreadResult.unread_count;

    // Step 2: Mark specific notifications as read
    if (unreadResult.notifications.length > 0) {
      const notificationIds = unreadResult.notifications.slice(0, 2).map(n => n.id);
      const markResult = await notificationsService.markNotificationsRead({
        notification_ids: notificationIds
      });

      expect(markResult.updated_count).toBe(notificationIds.length);

      // Step 3: Verify unread count decreased
      const updatedResult = await notificationsService.getUserNotifications({});
      expect(updatedResult.unread_count).toBeLessThan(initialUnreadCount);
    }
  });

  it('should handle wishlist queue management', async () => {
    const wishlistService = await import('@/services/library/wishlist');

    // Step 1: Get current wishlist
    const initialResult = await wishlistService.getUserWishlist({});
    const initialCount = initialResult.queue_info.total_items;

    // Step 2: Add new book with high priority
    const addResult = await wishlistService.addToWishlist({
      book_id: '987fcdeb-51d2-43a1-b123-456789abcdef',
      priority: 10
    });

    expect(addResult.queue_position).toBeGreaterThan(0);

    // Step 3: Update priority of existing item
    const updateResult = await wishlistService.updateWishlistItem(addResult.wishlist_item.id, {
      priority: 1 // highest priority
    });

    expect(updateResult.wishlist_item.priority).toBe(1);

    // Step 4: Verify queue count increased
    const finalResult = await wishlistService.getUserWishlist({});
    expect(finalResult.queue_info.total_items).toBe(initialCount + 1);

    // Step 5: Remove item from wishlist
    const removeResult = await wishlistService.removeFromWishlist(addResult.wishlist_item.id);
    expect(removeResult.message).toBe('Item removed from wishlist');
  });
});