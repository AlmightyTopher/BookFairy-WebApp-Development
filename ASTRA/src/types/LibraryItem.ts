/**
 * LibraryItem Entity Interface
 *
 * Defines the library item structure for user's downloaded and tracked books
 * with completion status, ratings, and recommendation weight calculations
 */

import { Book } from './Book';

export interface LibraryItem {
  id: string;
  user_id: string;
  book: Book;
  added_date: string;
  download_completed_date?: string;
  completion_status: CompletionStatus;
  user_rating?: number;
  user_notes?: string;
  recommendation_weight: number;
  listening_progress?: ListeningProgress;
  download_size_mb?: number;
  last_accessed_date?: string;
  tags?: string[];
  is_favorite?: boolean;
}

export interface LibraryItemUpdate {
  completion_status?: CompletionStatus;
  user_rating?: number;
  user_notes?: string;
  listening_progress?: Partial<ListeningProgress>;
  tags?: string[];
  is_favorite?: boolean;
}

export interface ListeningProgress {
  current_position_minutes: number;
  last_position_updated: string;
  playback_speed: number;
  bookmarks: Bookmark[];
  total_listening_time_minutes: number;
  completion_percentage: number;
}

export interface Bookmark {
  id: string;
  position_minutes: number;
  title: string;
  note?: string;
  created_date: string;
}

export interface LibraryStats {
  total_books: number;
  completed_books: number;
  in_progress_books: number;
  downloaded_books: number;
  total_listening_hours: number;
  total_download_size_gb: number;
  favorite_genres: string[];
  favorite_authors: string[];
  reading_streak_days: number;
  average_rating: number;
  books_this_month: number;
  books_this_year: number;
}

export interface LibraryResponse {
  library_items: LibraryItem[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next: boolean;
    has_previous: boolean;
  };
  library_stats: LibraryStats;
}

export interface LibraryUpdateResponse {
  library_item: LibraryItem;
  fairy_response: string;
}

export type CompletionStatus = 'downloaded' | 'started' | 'completed' | 'archived';

export interface LibraryFilter {
  completion_status?: CompletionStatus[];
  genre?: string[];
  author?: string;
  rating_min?: number;
  rating_max?: number;
  duration_min?: number;
  duration_max?: number;
  added_after?: string;
  added_before?: string;
  is_favorite?: boolean;
  has_notes?: boolean;
  tags?: string[];
}

export interface LibraryQuery {
  filters?: LibraryFilter;
  sort_by?: LibrarySortField;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  search?: string;
}

export type LibrarySortField =
  | 'added_date'
  | 'title'
  | 'author'
  | 'user_rating'
  | 'completion_status'
  | 'last_accessed'
  | 'duration'
  | 'completion_percentage';

// Constants
export const LIBRARY_CONSTANTS = {
  MAX_USER_RATING: 5,
  MIN_USER_RATING: 1,
  MAX_NOTES_LENGTH: 1000,
  MAX_BOOKMARK_TITLE_LENGTH: 100,
  MAX_BOOKMARK_NOTE_LENGTH: 500,
  MAX_TAGS: 10,
  MAX_TAG_LENGTH: 50,
  DEFAULT_PLAYBACK_SPEED: 1.0,
  MIN_PLAYBACK_SPEED: 0.5,
  MAX_PLAYBACK_SPEED: 3.0,
  READING_STREAK_THRESHOLD_DAYS: 1
} as const;

// Validation functions
export function validateUserRating(rating: number): boolean {
  return Number.isInteger(rating) &&
         rating >= LIBRARY_CONSTANTS.MIN_USER_RATING &&
         rating <= LIBRARY_CONSTANTS.MAX_USER_RATING;
}

export function validateUserNotes(notes: string): boolean {
  return notes.length <= LIBRARY_CONSTANTS.MAX_NOTES_LENGTH;
}

export function validatePlaybackSpeed(speed: number): boolean {
  return speed >= LIBRARY_CONSTANTS.MIN_PLAYBACK_SPEED &&
         speed <= LIBRARY_CONSTANTS.MAX_PLAYBACK_SPEED;
}

export function validateTags(tags: string[]): boolean {
  return tags.length <= LIBRARY_CONSTANTS.MAX_TAGS &&
         tags.every(tag => tag.length <= LIBRARY_CONSTANTS.MAX_TAG_LENGTH && tag.trim().length > 0);
}

export function validateLibraryItemUpdate(update: LibraryItemUpdate): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (update.completion_status &&
      !['downloaded', 'started', 'completed', 'archived'].includes(update.completion_status)) {
    errors.push('Invalid completion status');
  }

  if (update.user_rating !== undefined && !validateUserRating(update.user_rating)) {
    errors.push(`User rating must be between ${LIBRARY_CONSTANTS.MIN_USER_RATING} and ${LIBRARY_CONSTANTS.MAX_USER_RATING}`);
  }

  if (update.user_notes && !validateUserNotes(update.user_notes)) {
    errors.push(`User notes must not exceed ${LIBRARY_CONSTANTS.MAX_NOTES_LENGTH} characters`);
  }

  if (update.listening_progress?.playback_speed &&
      !validatePlaybackSpeed(update.listening_progress.playback_speed)) {
    errors.push(`Playback speed must be between ${LIBRARY_CONSTANTS.MIN_PLAYBACK_SPEED} and ${LIBRARY_CONSTANTS.MAX_PLAYBACK_SPEED}`);
  }

  if (update.tags && !validateTags(update.tags)) {
    errors.push(`Tags validation failed: max ${LIBRARY_CONSTANTS.MAX_TAGS} tags, each max ${LIBRARY_CONSTANTS.MAX_TAG_LENGTH} characters`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Utility functions
export function calculateCompletionPercentage(
  currentPosition: number,
  totalDuration: number
): number {
  if (totalDuration <= 0) return 0;
  const percentage = (currentPosition / totalDuration) * 100;
  return Math.min(Math.max(percentage, 0), 100);
}

export function calculateRecommendationWeight(item: LibraryItem): number {
  let weight = 0;

  // Base weight from completion status
  const statusWeights = {
    downloaded: 0.2,
    started: 0.5,
    completed: 1.0,
    archived: 0.8
  };
  weight += statusWeights[item.completion_status];

  // User rating influence
  if (item.user_rating) {
    weight += (item.user_rating / LIBRARY_CONSTANTS.MAX_USER_RATING) * 0.5;
  }

  // Completion percentage for started books
  if (item.listening_progress?.completion_percentage) {
    weight += (item.listening_progress.completion_percentage / 100) * 0.3;
  }

  // Favorite bonus
  if (item.is_favorite) {
    weight += 0.3;
  }

  // Recent activity bonus
  if (item.last_accessed_date) {
    const daysSinceAccess = Math.floor(
      (Date.now() - new Date(item.last_accessed_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceAccess <= 7) {
      weight += 0.2;
    }
  }

  return Math.min(weight, 2.0); // Cap at 2.0
}

export function getCompletionStatusLabel(status: CompletionStatus): string {
  const labels = {
    downloaded: 'Downloaded',
    started: 'In Progress',
    completed: 'Completed',
    archived: 'Archived'
  };
  return labels[status];
}

export function getCompletionStatusColor(status: CompletionStatus): string {
  const colors = {
    downloaded: '#666666',  // Gray
    started: '#FFA500',     // Orange
    completed: '#00C851',   // Green
    archived: '#9E9E9E'     // Light Gray
  };
  return colors[status];
}

export function getCompletionStatusIcon(status: CompletionStatus): string {
  const icons = {
    downloaded: '⬇️',
    started: '▶️',
    completed: '✅',
    archived: '📦'
  };
  return icons[status];
}

export function formatListeningTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60);

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

export function formatProgress(item: LibraryItem): string {
  if (!item.listening_progress) {
    return getCompletionStatusLabel(item.completion_status);
  }

  const { completion_percentage, current_position_minutes } = item.listening_progress;
  const totalDuration = item.book.duration_minutes;

  if (completion_percentage >= 100) {
    return 'Completed';
  }

  const currentFormatted = formatListeningTime(current_position_minutes);
  const totalFormatted = formatListeningTime(totalDuration);

  return `${currentFormatted} / ${totalFormatted} (${completion_percentage.toFixed(0)}%)`;
}

export function calculateReadingStreak(items: LibraryItem[]): number {
  const sortedItems = items
    .filter(item => item.completion_status === 'completed')
    .sort((a, b) => new Date(b.download_completed_date || b.added_date).getTime() -
                    new Date(a.download_completed_date || a.added_date).getTime());

  let streak = 0;
  let currentDate = new Date();

  for (const item of sortedItems) {
    const completionDate = new Date(item.download_completed_date || item.added_date);
    const daysDiff = Math.floor((currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= LIBRARY_CONSTANTS.READING_STREAK_THRESHOLD_DAYS + streak) {
      streak++;
      currentDate = completionDate;
    } else {
      break;
    }
  }

  return streak;
}

export function generateLibraryStats(items: LibraryItem[]): LibraryStats {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisYear = new Date(now.getFullYear(), 0, 1);

  const stats: LibraryStats = {
    total_books: items.length,
    completed_books: items.filter(item => item.completion_status === 'completed').length,
    in_progress_books: items.filter(item => item.completion_status === 'started').length,
    downloaded_books: items.filter(item => item.completion_status === 'downloaded').length,
    total_listening_hours: 0,
    total_download_size_gb: 0,
    favorite_genres: [],
    favorite_authors: [],
    reading_streak_days: calculateReadingStreak(items),
    average_rating: 0,
    books_this_month: 0,
    books_this_year: 0
  };

  // Calculate totals and collect data
  const genreCounts: Record<string, number> = {};
  const authorCounts: Record<string, number> = {};
  let totalRating = 0;
  let ratedBooks = 0;

  items.forEach(item => {
    // Listening time
    if (item.listening_progress) {
      stats.total_listening_hours += item.listening_progress.total_listening_time_minutes;
    }

    // Download size
    if (item.download_size_mb) {
      stats.total_download_size_gb += item.download_size_mb;
    }

    // Genres
    item.book.genre.forEach(genre => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });

    // Authors
    authorCounts[item.book.author] = (authorCounts[item.book.author] || 0) + 1;

    // Ratings
    if (item.user_rating) {
      totalRating += item.user_rating;
      ratedBooks++;
    }

    // Date-based counts
    const addedDate = new Date(item.added_date);
    if (addedDate >= thisMonth) {
      stats.books_this_month++;
    }
    if (addedDate >= thisYear) {
      stats.books_this_year++;
    }
  });

  // Finalize calculations
  stats.total_listening_hours = Math.round(stats.total_listening_hours / 60 * 100) / 100;
  stats.total_download_size_gb = Math.round(stats.total_download_size_gb / 1024 * 100) / 100;
  stats.average_rating = ratedBooks > 0 ? Math.round(totalRating / ratedBooks * 100) / 100 : 0;

  // Get top genres and authors
  stats.favorite_genres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([genre]) => genre);

  stats.favorite_authors = Object.entries(authorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([author]) => author);

  return stats;
}

export function sortLibraryItems(
  items: LibraryItem[],
  sortBy: LibrarySortField = 'added_date',
  sortOrder: 'asc' | 'desc' = 'desc'
): LibraryItem[] {
  return [...items].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'title':
        comparison = a.book.title.localeCompare(b.book.title);
        break;

      case 'author':
        comparison = a.book.author.localeCompare(b.book.author);
        break;

      case 'user_rating':
        comparison = (a.user_rating || 0) - (b.user_rating || 0);
        break;

      case 'completion_status':
        const statusOrder = ['downloaded', 'started', 'completed', 'archived'];
        comparison = statusOrder.indexOf(a.completion_status) - statusOrder.indexOf(b.completion_status);
        break;

      case 'last_accessed':
        const aDate = a.last_accessed_date ? new Date(a.last_accessed_date).getTime() : 0;
        const bDate = b.last_accessed_date ? new Date(b.last_accessed_date).getTime() : 0;
        comparison = aDate - bDate;
        break;

      case 'duration':
        comparison = a.book.duration_minutes - b.book.duration_minutes;
        break;

      case 'completion_percentage':
        const aProgress = a.listening_progress?.completion_percentage || 0;
        const bProgress = b.listening_progress?.completion_percentage || 0;
        comparison = aProgress - bProgress;
        break;

      case 'added_date':
      default:
        comparison = new Date(a.added_date).getTime() - new Date(b.added_date).getTime();
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });
}

export function filterLibraryItems(items: LibraryItem[], filters: LibraryFilter): LibraryItem[] {
  return items.filter(item => {
    // Completion status filter
    if (filters.completion_status && !filters.completion_status.includes(item.completion_status)) {
      return false;
    }

    // Genre filter
    if (filters.genre && !filters.genre.some(genre => item.book.genre.includes(genre))) {
      return false;
    }

    // Author filter
    if (filters.author && !item.book.author.toLowerCase().includes(filters.author.toLowerCase())) {
      return false;
    }

    // Rating range filter
    if (filters.rating_min !== undefined && (!item.user_rating || item.user_rating < filters.rating_min)) {
      return false;
    }

    if (filters.rating_max !== undefined && (!item.user_rating || item.user_rating > filters.rating_max)) {
      return false;
    }

    // Duration range filter
    if (filters.duration_min !== undefined && item.book.duration_minutes < filters.duration_min) {
      return false;
    }

    if (filters.duration_max !== undefined && item.book.duration_minutes > filters.duration_max) {
      return false;
    }

    // Date range filter
    if (filters.added_after && new Date(item.added_date) < new Date(filters.added_after)) {
      return false;
    }

    if (filters.added_before && new Date(item.added_date) > new Date(filters.added_before)) {
      return false;
    }

    // Favorite filter
    if (filters.is_favorite !== undefined && item.is_favorite !== filters.is_favorite) {
      return false;
    }

    // Notes filter
    if (filters.has_notes !== undefined) {
      const hasNotes = !!(item.user_notes && item.user_notes.trim().length > 0);
      if (hasNotes !== filters.has_notes) {
        return false;
      }
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      if (!item.tags || !filters.tags.some(tag => item.tags!.includes(tag))) {
        return false;
      }
    }

    return true;
  });
}

// Type guards
export function isLibraryItem(obj: any): obj is LibraryItem {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    obj.book &&
    typeof obj.added_date === 'string' &&
    ['downloaded', 'started', 'completed', 'archived'].includes(obj.completion_status) &&
    typeof obj.recommendation_weight === 'number'
  );
}

export function isLibraryResponse(obj: any): obj is LibraryResponse {
  return (
    obj &&
    Array.isArray(obj.library_items) &&
    obj.pagination &&
    obj.library_stats
  );
}