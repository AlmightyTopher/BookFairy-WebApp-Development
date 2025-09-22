/**
 * Library Management Hook
 *
 * Provides library item management, reading progress tracking,
 * and synchronization with external services for BookFairy
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  LibraryItem,
  Book,
  ListeningProgress,
  CompletionStatus,
  LibraryStats,
  UseAsyncState,
  PaginatedResponse,
  SearchFilters
} from '@/types';
import { useAuthContext } from './useAuth';
import { supabase } from '@/services/supabase/client';
import { validateListeningProgress, calculateRecommendationWeight } from '@/types/LibraryItem';

export interface LibraryState {
  items: LibraryItem[];
  stats: LibraryStats;
  isLoading: boolean;
  error: string | null;
  lastSyncTime: string | null;
}

export interface LibraryFilters extends SearchFilters {
  completion_status?: CompletionStatus[];
  genres?: string[];
  rating_range?: { min: number; max: number };
  date_range?: { start: string; end: string };
  has_progress?: boolean;
}

export interface LibraryActions {
  addToLibrary: (book: Book) => Promise<LibraryItem>;
  removeFromLibrary: (itemId: string) => Promise<void>;
  updateProgress: (itemId: string, progress: Partial<ListeningProgress>) => Promise<LibraryItem>;
  updateRating: (itemId: string, rating: number) => Promise<LibraryItem>;
  updateNotes: (itemId: string, notes: string) => Promise<LibraryItem>;
  markCompleted: (itemId: string) => Promise<LibraryItem>;
  markInProgress: (itemId: string, currentTime?: number) => Promise<LibraryItem>;
  syncWithAudiobookshelf: () => Promise<{ success: boolean; synced_items: number }>;
  refreshLibrary: () => Promise<void>;
  searchLibrary: (filters: LibraryFilters) => Promise<PaginatedResponse<LibraryItem>>;
  getRecommendations: () => Promise<Book[]>;
  clearError: () => void;
}

export interface UseLibraryResult extends LibraryState, LibraryActions {}

export const useLibrary = (): UseLibraryResult => {
  const { user, isAuthenticated } = useAuthContext();
  const [state, setState] = useState<LibraryState>({
    items: [],
    stats: {
      total_books: 0,
      completed_books: 0,
      in_progress_books: 0,
      total_listening_time: 0,
      average_rating: 0,
      favorite_genres: [],
      reading_streak_days: 0,
      books_this_month: 0,
      completion_rate: 0
    },
    isLoading: false,
    error: null,
    lastSyncTime: null
  });

  // Load library when user authenticates
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshLibrary();
    } else {
      setState(prev => ({
        ...prev,
        items: [],
        stats: {
          total_books: 0,
          completed_books: 0,
          in_progress_books: 0,
          total_listening_time: 0,
          average_rating: 0,
          favorite_genres: [],
          reading_streak_days: 0,
          books_this_month: 0,
          completion_rate: 0
        }
      }));
    }
  }, [isAuthenticated, user?.id]);

  // Set up real-time subscription for library changes
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel(`library-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'library_items',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        handleRealtimeUpdate(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.id]);

  const handleRealtimeUpdate = useCallback((payload: any) => {
    setState(prev => {
      const newItems = [...prev.items];

      switch (payload.eventType) {
        case 'INSERT':
          // Add new item if not already present
          if (!newItems.find(item => item.id === payload.new.id)) {
            newItems.push(mapDbRecordToLibraryItem(payload.new));
          }
          break;

        case 'UPDATE':
          // Update existing item
          const updateIndex = newItems.findIndex(item => item.id === payload.new.id);
          if (updateIndex !== -1) {
            newItems[updateIndex] = mapDbRecordToLibraryItem(payload.new);
          }
          break;

        case 'DELETE':
          // Remove deleted item
          const deleteIndex = newItems.findIndex(item => item.id === payload.old.id);
          if (deleteIndex !== -1) {
            newItems.splice(deleteIndex, 1);
          }
          break;
      }

      return {
        ...prev,
        items: newItems,
        stats: calculateLibraryStats(newItems)
      };
    });
  }, []);

  const addToLibrary = useCallback(async (book: Book): Promise<LibraryItem> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const newItem = {
        user_id: user.id,
        book_id: book.id,
        added_date: new Date().toISOString(),
        completion_status: 'not_started' as CompletionStatus,
        user_rating: null,
        user_notes: '',
        recommendation_weight: calculateRecommendationWeight({
          user_rating: null,
          completion_status: 'not_started',
          genres: book.genre,
          listening_time: 0
        }),
        listening_progress: null
      };

      const { data, error } = await supabase
        .from('library_items')
        .insert(newItem)
        .select(`
          *,
          book:books(*)
        `)
        .single();

      if (error) throw error;

      const libraryItem = mapDbRecordToLibraryItem(data);

      setState(prev => ({
        ...prev,
        items: [...prev.items, libraryItem],
        stats: calculateLibraryStats([...prev.items, libraryItem]),
        isLoading: false
      }));

      return libraryItem;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to add book to library'
      }));
      throw error;
    }
  }, [user]);

  const removeFromLibrary = useCallback(async (itemId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { error } = await supabase
        .from('library_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;

      setState(prev => {
        const newItems = prev.items.filter(item => item.id !== itemId);
        return {
          ...prev,
          items: newItems,
          stats: calculateLibraryStats(newItems),
          isLoading: false
        };
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to remove book from library'
      }));
      throw error;
    }
  }, [user]);

  const updateProgress = useCallback(async (
    itemId: string,
    progressUpdate: Partial<ListeningProgress>
  ): Promise<LibraryItem> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const existingItem = state.items.find(item => item.id === itemId);
      if (!existingItem) throw new Error('Library item not found');

      const currentProgress = existingItem.listening_progress || {
        current_time_seconds: 0,
        total_duration_seconds: existingItem.book.duration_minutes * 60,
        percentage_complete: 0,
        last_listened_date: new Date().toISOString(),
        is_completed: false,
        listening_speed: 1.0,
        chapter_progress: [],
        bookmarks: [],
        notes: []
      };

      const updatedProgress = { ...currentProgress, ...progressUpdate };

      // Validate progress
      const validation = validateListeningProgress(updatedProgress);
      if (!validation.valid) {
        throw new Error(validation.errors[0]);
      }

      // Update completion status based on progress
      let completionStatus: CompletionStatus = existingItem.completion_status;
      if (updatedProgress.is_completed || updatedProgress.percentage_complete >= 100) {
        completionStatus = 'completed';
      } else if (updatedProgress.percentage_complete > 0) {
        completionStatus = 'in_progress';
      }

      const { data, error } = await supabase
        .from('library_items')
        .update({
          listening_progress: updatedProgress,
          completion_status: completionStatus,
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

      const updatedItem = mapDbRecordToLibraryItem(data);

      setState(prev => {
        const newItems = prev.items.map(item =>
          item.id === itemId ? updatedItem : item
        );

        return {
          ...prev,
          items: newItems,
          stats: calculateLibraryStats(newItems),
          isLoading: false
        };
      });

      return updatedItem;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update progress'
      }));
      throw error;
    }
  }, [user, state.items]);

  const updateRating = useCallback(async (itemId: string, rating: number): Promise<LibraryItem> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const { data, error } = await supabase
        .from('library_items')
        .update({
          user_rating: rating,
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

      const updatedItem = mapDbRecordToLibraryItem(data);

      setState(prev => {
        const newItems = prev.items.map(item =>
          item.id === itemId ? updatedItem : item
        );

        return {
          ...prev,
          items: newItems,
          stats: calculateLibraryStats(newItems),
          isLoading: false
        };
      });

      return updatedItem;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update rating'
      }));
      throw error;
    }
  }, [user]);

  const updateNotes = useCallback(async (itemId: string, notes: string): Promise<LibraryItem> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabase
        .from('library_items')
        .update({
          user_notes: notes,
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

      const updatedItem = mapDbRecordToLibraryItem(data);

      setState(prev => {
        const newItems = prev.items.map(item =>
          item.id === itemId ? updatedItem : item
        );

        return {
          ...prev,
          items: newItems,
          isLoading: false
        };
      });

      return updatedItem;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update notes'
      }));
      throw error;
    }
  }, [user]);

  const markCompleted = useCallback(async (itemId: string): Promise<LibraryItem> => {
    return updateProgress(itemId, {
      percentage_complete: 100,
      is_completed: true,
      last_listened_date: new Date().toISOString()
    });
  }, [updateProgress]);

  const markInProgress = useCallback(async (itemId: string, currentTime = 0): Promise<LibraryItem> => {
    return updateProgress(itemId, {
      current_time_seconds: currentTime,
      last_listened_date: new Date().toISOString()
    });
  }, [updateProgress]);

  const syncWithAudiobookshelf = useCallback(async (): Promise<{ success: boolean; synced_items: number }> => {
    if (!user?.audiobookshelf_account_id) {
      throw new Error('Audiobookshelf account not configured');
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // This would integrate with the Audiobookshelf service
      // For now, we'll simulate the sync
      await new Promise(resolve => setTimeout(resolve, 2000));

      setState(prev => ({
        ...prev,
        isLoading: false,
        lastSyncTime: new Date().toISOString()
      }));

      return { success: true, synced_items: 0 };
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sync failed'
      }));
      throw error;
    }
  }, [user?.audiobookshelf_account_id]);

  const refreshLibrary = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabase
        .from('library_items')
        .select(`
          *,
          book:books(*)
        `)
        .eq('user_id', user.id)
        .order('added_date', { ascending: false });

      if (error) throw error;

      const libraryItems = data.map(mapDbRecordToLibraryItem);

      setState(prev => ({
        ...prev,
        items: libraryItems,
        stats: calculateLibraryStats(libraryItems),
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load library'
      }));
    }
  }, [user]);

  const searchLibrary = useCallback(async (filters: LibraryFilters): Promise<PaginatedResponse<LibraryItem>> => {
    if (!user) throw new Error('User not authenticated');

    try {
      let query = supabase
        .from('library_items')
        .select(`
          *,
          book:books(*)
        `, { count: 'exact' })
        .eq('user_id', user.id);

      // Apply filters
      if (filters.completion_status?.length) {
        query = query.in('completion_status', filters.completion_status);
      }

      if (filters.rating_range) {
        query = query
          .gte('user_rating', filters.rating_range.min)
          .lte('user_rating', filters.rating_range.max);
      }

      if (filters.date_range) {
        query = query
          .gte('added_date', filters.date_range.start)
          .lte('added_date', filters.date_range.end);
      }

      if (filters.query) {
        // Search in book title, author, or user notes
        query = query.or(`book.title.ilike.%${filters.query}%,book.author.ilike.%${filters.query}%,user_notes.ilike.%${filters.query}%`);
      }

      // Pagination
      const page = 1; // Would come from filters
      const limit = 20; // Would come from filters
      const offset = (page - 1) * limit;

      query = query.range(offset, offset + limit - 1);

      // Sorting
      const sortBy = filters.sortBy || 'added_date';
      const sortOrder = filters.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error, count } = await query;

      if (error) throw error;

      const items = data.map(mapDbRecordToLibraryItem);

      return {
        data: items,
        pagination: {
          current_page: page,
          total_pages: Math.ceil((count || 0) / limit),
          total_items: count || 0,
          items_per_page: limit,
          has_next: offset + limit < (count || 0),
          has_previous: page > 1
        }
      };
    } catch (error) {
      throw error;
    }
  }, [user]);

  const getRecommendations = useCallback(async (): Promise<Book[]> => {
    if (!user) throw new Error('User not authenticated');

    try {
      // This would use a recommendation algorithm based on library data
      // For now, return empty array
      return [];
    } catch (error) {
      throw error;
    }
  }, [user]);

  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Computed values
  const currentlyReading = useMemo(() => {
    return state.items.filter(item => item.completion_status === 'in_progress');
  }, [state.items]);

  const recentlyCompleted = useMemo(() => {
    return state.items
      .filter(item => item.completion_status === 'completed')
      .sort((a, b) => {
        const aProgress = a.listening_progress?.last_listened_date || a.added_date;
        const bProgress = b.listening_progress?.last_listened_date || b.added_date;
        return new Date(bProgress).getTime() - new Date(aProgress).getTime();
      })
      .slice(0, 5);
  }, [state.items]);

  return {
    ...state,
    addToLibrary,
    removeFromLibrary,
    updateProgress,
    updateRating,
    updateNotes,
    markCompleted,
    markInProgress,
    syncWithAudiobookshelf,
    refreshLibrary,
    searchLibrary,
    getRecommendations,
    clearError,
    // Additional computed properties
    currentlyReading,
    recentlyCompleted
  } as UseLibraryResult & {
    currentlyReading: LibraryItem[];
    recentlyCompleted: LibraryItem[];
  };
};

// Helper functions
function mapDbRecordToLibraryItem(record: any): LibraryItem {
  return {
    id: record.id,
    user_id: record.user_id,
    book: record.book,
    added_date: record.added_date,
    completion_status: record.completion_status,
    user_rating: record.user_rating,
    user_notes: record.user_notes || '',
    recommendation_weight: record.recommendation_weight || 0,
    listening_progress: record.listening_progress
  };
}

function calculateLibraryStats(items: LibraryItem[]): LibraryStats {
  const totalBooks = items.length;
  const completedBooks = items.filter(item => item.completion_status === 'completed').length;
  const inProgressBooks = items.filter(item => item.completion_status === 'in_progress').length;

  const totalListeningTime = items.reduce((total, item) => {
    return total + (item.listening_progress?.current_time_seconds || 0);
  }, 0);

  const ratingsSum = items
    .filter(item => item.user_rating)
    .reduce((sum, item) => sum + (item.user_rating || 0), 0);
  const ratedBooks = items.filter(item => item.user_rating).length;
  const averageRating = ratedBooks > 0 ? ratingsSum / ratedBooks : 0;

  // Calculate genre frequencies
  const genreCounts: Record<string, number> = {};
  items.forEach(item => {
    item.book.genre.forEach(genre => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  });

  const favoriteGenres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([genre]) => genre);

  // Calculate books this month
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const booksThisMonth = items.filter(item => {
    return new Date(item.added_date) >= thisMonth;
  }).length;

  const completionRate = totalBooks > 0 ? (completedBooks / totalBooks) * 100 : 0;

  return {
    total_books: totalBooks,
    completed_books: completedBooks,
    in_progress_books: inProgressBooks,
    total_listening_time: Math.floor(totalListeningTime / 60), // Convert to minutes
    average_rating: Math.round(averageRating * 10) / 10,
    favorite_genres: favoriteGenres,
    reading_streak_days: 0, // Would need to calculate based on listening history
    books_this_month: booksThisMonth,
    completion_rate: Math.round(completionRate)
  };
}