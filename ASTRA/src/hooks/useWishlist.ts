/**
 * Wishlist Management Hook
 *
 * Provides wishlist queue management, auto-promotion, expiration handling,
 * and fairy-themed interactions for the BookFairy application
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  WishlistItem,
  Book,
  WishlistStatus,
  QueueInfo,
  PaginatedResponse,
  UseAsyncState
} from '@/types';
import { useAuthContext } from './useAuth';
import { supabase } from '@/services/supabase/client';
import {
  validateWishlistItem,
  calculateQueuePosition,
  isExpirationDue,
  getPromotionEligibility,
  createFairyWishlistMessage
} from '@/types/WishlistItem';

export interface WishlistState {
  items: WishlistItem[];
  queueInfo: QueueInfo;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  promotionsAvailable: number;
}

export interface WishlistActions {
  addToWishlist: (book: Book, priority?: number) => Promise<WishlistItem>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  updatePriority: (itemId: string, priority: number) => Promise<WishlistItem>;
  promoteFromQueue: (itemId: string) => Promise<WishlistItem>;
  handleExpiredItems: () => Promise<{ handled: number; errors: string[] }>;
  reorderWishlist: (itemIds: string[]) => Promise<void>;
  clearExpired: () => Promise<{ removed: number }>;
  refreshWishlist: () => Promise<void>;
  markAsAvailable: (itemId: string) => Promise<WishlistItem>;
  markAsUnavailable: (itemId: string) => Promise<WishlistItem>;
  searchWishlist: (query: string) => Promise<WishlistItem[]>;
  clearError: () => void;
}

export interface UseWishlistResult extends WishlistState, WishlistActions {}

export const useWishlist = (): UseWishlistResult => {
  const { user, isAuthenticated } = useAuthContext();
  const [state, setState] = useState<WishlistState>({
    items: [],
    queueInfo: {
      total_items: 0,
      queue_items: 0,
      active_items: 0,
      next_promotion_date: null,
      auto_promotion_enabled: true
    },
    isLoading: false,
    error: null,
    lastUpdated: null,
    promotionsAvailable: 0
  });

  // Load wishlist when user authenticates
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshWishlist();
    } else {
      setState(prev => ({
        ...prev,
        items: [],
        queueInfo: {
          total_items: 0,
          queue_items: 0,
          active_items: 0,
          next_promotion_date: null,
          auto_promotion_enabled: true
        }
      }));
    }
  }, [isAuthenticated, user?.id]);

  // Set up real-time subscription for wishlist changes
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel(`wishlist-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wishlist_items',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        handleRealtimeUpdate(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.id]);

  // Auto-handle expired items every hour
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      handleExpiredItems();
    }, 60 * 60 * 1000); // Every hour

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleRealtimeUpdate = useCallback((payload: any) => {
    setState(prev => {
      const newItems = [...prev.items];

      switch (payload.eventType) {
        case 'INSERT':
          if (!newItems.find(item => item.id === payload.new.id)) {
            newItems.push(mapDbRecordToWishlistItem(payload.new));
          }
          break;

        case 'UPDATE':
          const updateIndex = newItems.findIndex(item => item.id === payload.new.id);
          if (updateIndex !== -1) {
            newItems[updateIndex] = mapDbRecordToWishlistItem(payload.new);
          }
          break;

        case 'DELETE':
          const deleteIndex = newItems.findIndex(item => item.id === payload.old.id);
          if (deleteIndex !== -1) {
            newItems.splice(deleteIndex, 1);
          }
          break;
      }

      return {
        ...prev,
        items: newItems,
        queueInfo: calculateQueueInfo(newItems),
        lastUpdated: new Date().toISOString()
      };
    });
  }, []);

  const addToWishlist = useCallback(async (book: Book, priority = 5): Promise<WishlistItem> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Check if book is already in wishlist
      const existing = state.items.find(item => item.book.id === book.id);
      if (existing) {
        throw new Error('Book is already in your wishlist');
      }

      // Calculate queue position and status
      const queuePosition = calculateQueuePosition(state.items, priority);
      const status: WishlistStatus = state.items.length < 10 ? 'active' : 'queued';

      const newItem = {
        user_id: user.id,
        book_id: book.id,
        requested_date: new Date().toISOString(),
        priority,
        status,
        expiration_date: calculateExpirationDate(status),
        queue_position: queuePosition,
        days_remaining: calculateDaysRemaining(calculateExpirationDate(status)),
        fairy_message: createFairyWishlistMessage('added', { book_title: book.title }),
        auto_promotion: true,
        notes: ''
      };

      const { data, error } = await supabase
        .from('wishlist_items')
        .insert(newItem)
        .select(`
          *,
          book:books(*)
        `)
        .single();

      if (error) throw error;

      const wishlistItem = mapDbRecordToWishlistItem(data);

      setState(prev => {
        const newItems = [...prev.items, wishlistItem];
        return {
          ...prev,
          items: newItems,
          queueInfo: calculateQueueInfo(newItems),
          isLoading: false,
          lastUpdated: new Date().toISOString()
        };
      });

      return wishlistItem;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to add book to wishlist'
      }));
      throw error;
    }
  }, [user, state.items]);

  const removeFromWishlist = useCallback(async (itemId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;

      setState(prev => {
        const newItems = prev.items.filter(item => item.id !== itemId);
        return {
          ...prev,
          items: newItems,
          queueInfo: calculateQueueInfo(newItems),
          isLoading: false,
          lastUpdated: new Date().toISOString()
        };
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to remove book from wishlist'
      }));
      throw error;
    }
  }, [user]);

  const updatePriority = useCallback(async (itemId: string, priority: number): Promise<WishlistItem> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      if (priority < 1 || priority > 10) {
        throw new Error('Priority must be between 1 and 10');
      }

      const { data, error } = await supabase
        .from('wishlist_items')
        .update({
          priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .eq('user_id', user.id)
        .select(`
          *,
          book:books(*)
        `)
        .single();

      if (error) throw error;

      const updatedItem = mapDbRecordToWishlistItem(data);

      setState(prev => {
        const newItems = prev.items.map(item =>
          item.id === itemId ? updatedItem : item
        );

        return {
          ...prev,
          items: newItems,
          queueInfo: calculateQueueInfo(newItems),
          isLoading: false,
          lastUpdated: new Date().toISOString()
        };
      });

      return updatedItem;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update priority'
      }));
      throw error;
    }
  }, [user]);

  const promoteFromQueue = useCallback(async (itemId: string): Promise<WishlistItem> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const item = state.items.find(i => i.id === itemId);
      if (!item) throw new Error('Wishlist item not found');

      if (item.status !== 'queued') {
        throw new Error('Item is not in queue');
      }

      // Check promotion eligibility
      const eligibility = getPromotionEligibility(item);
      if (!eligibility.eligible) {
        throw new Error(eligibility.reason);
      }

      const { data, error } = await supabase
        .from('wishlist_items')
        .update({
          status: 'active',
          queue_position: null,
          fairy_message: createFairyWishlistMessage('promoted', { book_title: item.book.title }),
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .eq('user_id', user.id)
        .select(`
          *,
          book:books(*)
        `)
        .single();

      if (error) throw error;

      const promotedItem = mapDbRecordToWishlistItem(data);

      setState(prev => {
        const newItems = prev.items.map(item =>
          item.id === itemId ? promotedItem : item
        );

        return {
          ...prev,
          items: newItems,
          queueInfo: calculateQueueInfo(newItems),
          isLoading: false,
          lastUpdated: new Date().toISOString()
        };
      });

      return promotedItem;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to promote item'
      }));
      throw error;
    }
  }, [user, state.items]);

  const handleExpiredItems = useCallback(async (): Promise<{ handled: number; errors: string[] }> => {
    if (!user) return { handled: 0, errors: [] };

    try {
      const expiredItems = state.items.filter(item => isExpirationDue(item.expiration_date));
      const errors: string[] = [];
      let handled = 0;

      for (const item of expiredItems) {
        try {
          if (item.status === 'active') {
            // Move active items to queue
            await supabase
              .from('wishlist_items')
              .update({
                status: 'queued',
                queue_position: calculateQueuePosition(state.items, item.priority),
                expiration_date: calculateExpirationDate('queued'),
                fairy_message: createFairyWishlistMessage('expired_to_queue', { book_title: item.book.title }),
                updated_at: new Date().toISOString()
              })
              .eq('id', item.id);
          } else {
            // Remove queued items that have expired
            await supabase
              .from('wishlist_items')
              .delete()
              .eq('id', item.id);
          }

          handled++;
        } catch (itemError) {
          errors.push(`Failed to handle expired item ${item.book.title}: ${itemError instanceof Error ? itemError.message : 'Unknown error'}`);
        }
      }

      return { handled, errors };
    } catch (error) {
      return {
        handled: 0,
        errors: [error instanceof Error ? error.message : 'Failed to handle expired items']
      };
    }
  }, [user, state.items]);

  const reorderWishlist = useCallback(async (itemIds: string[]): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Update priorities based on new order
      const updates = itemIds.map((id, index) => ({
        id,
        priority: index + 1
      }));

      for (const update of updates) {
        await supabase
          .from('wishlist_items')
          .update({ priority: update.priority })
          .eq('id', update.id)
          .eq('user_id', user.id);
      }

      setState(prev => ({ ...prev, isLoading: false }));
      await refreshWishlist();
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to reorder wishlist'
      }));
      throw error;
    }
  }, [user]);

  const clearExpired = useCallback(async (): Promise<{ removed: number }> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id)
        .lt('expiration_date', now)
        .select('id');

      if (error) throw error;

      const removed = data?.length || 0;

      setState(prev => {
        const newItems = prev.items.filter(item => !isExpirationDue(item.expiration_date));
        return {
          ...prev,
          items: newItems,
          queueInfo: calculateQueueInfo(newItems),
          lastUpdated: new Date().toISOString()
        };
      });

      return { removed };
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to clear expired items'
      }));
      throw error;
    }
  }, [user]);

  const refreshWishlist = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          *,
          book:books(*)
        `)
        .eq('user_id', user.id)
        .order('priority', { ascending: true });

      if (error) throw error;

      const wishlistItems = data.map(mapDbRecordToWishlistItem);

      setState(prev => ({
        ...prev,
        items: wishlistItems,
        queueInfo: calculateQueueInfo(wishlistItems),
        isLoading: false,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load wishlist'
      }));
    }
  }, [user]);

  const markAsAvailable = useCallback(async (itemId: string): Promise<WishlistItem> => {
    return updateItemStatus(itemId, 'available');
  }, []);

  const markAsUnavailable = useCallback(async (itemId: string): Promise<WishlistItem> => {
    return updateItemStatus(itemId, 'unavailable');
  }, []);

  const updateItemStatus = useCallback(async (itemId: string, status: WishlistStatus): Promise<WishlistItem> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const item = state.items.find(i => i.id === itemId);
      if (!item) throw new Error('Wishlist item not found');

      const { data, error } = await supabase
        .from('wishlist_items')
        .update({
          status,
          fairy_message: createFairyWishlistMessage(status, { book_title: item.book.title }),
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .eq('user_id', user.id)
        .select(`
          *,
          book:books(*)
        `)
        .single();

      if (error) throw error;

      const updatedItem = mapDbRecordToWishlistItem(data);

      setState(prev => {
        const newItems = prev.items.map(item =>
          item.id === itemId ? updatedItem : item
        );

        return {
          ...prev,
          items: newItems,
          queueInfo: calculateQueueInfo(newItems),
          lastUpdated: new Date().toISOString()
        };
      });

      return updatedItem;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update item status'
      }));
      throw error;
    }
  }, [user, state.items]);

  const searchWishlist = useCallback(async (query: string): Promise<WishlistItem[]> => {
    const filtered = state.items.filter(item =>
      item.book.title.toLowerCase().includes(query.toLowerCase()) ||
      item.book.author.toLowerCase().includes(query.toLowerCase()) ||
      item.book.genre.some(g => g.toLowerCase().includes(query.toLowerCase()))
    );

    return filtered;
  }, [state.items]);

  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Computed values
  const activeItems = useMemo(() => {
    return state.items.filter(item => item.status === 'active');
  }, [state.items]);

  const queuedItems = useMemo(() => {
    return state.items.filter(item => item.status === 'queued');
  }, [state.items]);

  const availableItems = useMemo(() => {
    return state.items.filter(item => item.status === 'available');
  }, [state.items]);

  const expiredItems = useMemo(() => {
    return state.items.filter(item => isExpirationDue(item.expiration_date));
  }, [state.items]);

  return {
    ...state,
    addToWishlist,
    removeFromWishlist,
    updatePriority,
    promoteFromQueue,
    handleExpiredItems,
    reorderWishlist,
    clearExpired,
    refreshWishlist,
    markAsAvailable,
    markAsUnavailable,
    searchWishlist,
    clearError,
    // Additional computed properties
    activeItems,
    queuedItems,
    availableItems,
    expiredItems
  } as UseWishlistResult & {
    activeItems: WishlistItem[];
    queuedItems: WishlistItem[];
    availableItems: WishlistItem[];
    expiredItems: WishlistItem[];
  };
};

// Helper functions
function mapDbRecordToWishlistItem(record: any): WishlistItem {
  return {
    id: record.id,
    user_id: record.user_id,
    book: record.book,
    requested_date: record.requested_date,
    priority: record.priority,
    status: record.status,
    expiration_date: record.expiration_date,
    queue_position: record.queue_position,
    days_remaining: calculateDaysRemaining(record.expiration_date),
    fairy_message: record.fairy_message || '',
    auto_promotion: record.auto_promotion !== false,
    notes: record.notes || ''
  };
}

function calculateQueueInfo(items: WishlistItem[]): QueueInfo {
  const totalItems = items.length;
  const queueItems = items.filter(item => item.status === 'queued').length;
  const activeItems = items.filter(item => item.status === 'active').length;

  // Calculate next promotion date (next Monday)
  const nextMonday = new Date();
  nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
  nextMonday.setHours(9, 0, 0, 0); // 9 AM

  return {
    total_items: totalItems,
    queue_items: queueItems,
    active_items: activeItems,
    next_promotion_date: nextMonday.toISOString(),
    auto_promotion_enabled: true
  };
}

function calculateExpirationDate(status: WishlistStatus): string {
  const now = new Date();

  switch (status) {
    case 'active':
      // Active items expire after 14 days
      now.setDate(now.getDate() + 14);
      break;
    case 'queued':
      // Queued items expire after 30 days
      now.setDate(now.getDate() + 30);
      break;
    default:
      // Other statuses expire after 7 days
      now.setDate(now.getDate() + 7);
      break;
  }

  return now.toISOString();
}

function calculateDaysRemaining(expirationDate: string): number {
  const expiry = new Date(expirationDate);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}