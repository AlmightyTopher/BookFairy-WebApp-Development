/**
 * Book Entity Interface and Validation
 *
 * Defines the core book data structure and validation logic
 * for audiobooks in the BookFairy system
 */

export interface Book {
  id: string;
  hardcover_id: string;
  title: string;
  author: string;
  narrator?: string;
  cover_image_url: string;
  synopsis: string;
  genre: string[];
  publication_date?: string;
  duration_minutes: number;
  availability_status: AvailabilityStatus;
  isbn?: string;
  series?: string;
  series_number?: number;
  publisher?: string;
  language?: string;
  rating?: number;
  rating_count?: number;
}

export interface DiscoveredBook extends Book {
  discovery_score: number;
  discovery_reason: string;
  scan_coordinates: {
    x: number;
    y: number;
  };
  discovery_metadata?: {
    trending_weight?: number;
    similarity_score?: number;
    user_preference_match?: number;
  };
}

export interface RecommendedBook extends Book {
  recommendation_score: number;
  recommendation_reasons: string[];
  similarity_to_library: number;
  recommendation_metadata?: {
    author_similarity?: number;
    genre_match?: number;
    user_rating_prediction?: number;
  };
}

export interface BookSearchResult {
  books: Book[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next: boolean;
    has_previous: boolean;
  };
  search_metadata: {
    query_used: string;
    filters_applied: Record<string, any>;
    total_results: number;
    search_time_ms: number;
  };
}

export type AvailabilityStatus = 'available' | 'processing' | 'unavailable';

export interface BookFilter {
  genre?: string[];
  author?: string;
  narrator?: string;
  language?: string;
  duration_min?: number;
  duration_max?: number;
  publication_year_min?: number;
  publication_year_max?: number;
  rating_min?: number;
  availability_status?: AvailabilityStatus[];
}

export interface BookSearchQuery {
  query?: string;
  filters?: BookFilter;
  sort_by?: BookSortField;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export type BookSortField =
  | 'title'
  | 'author'
  | 'publication_date'
  | 'duration'
  | 'rating'
  | 'popularity'
  | 'discovery_score'
  | 'recommendation_score';

// Validation functions
export function validateBookId(id: string): boolean {
  // UUIDs or similar format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function validateHardcoverId(id: string): boolean {
  // Hardcover IDs are typically numeric
  return /^\d+$/.test(id);
}

export function validateISBN(isbn: string): boolean {
  // Basic ISBN-10 or ISBN-13 validation
  const cleanISBN = isbn.replace(/[^0-9X]/gi, '');
  return cleanISBN.length === 10 || cleanISBN.length === 13;
}

export function validateCoverImageUrl(url: string): boolean {
  try {
    new URL(url);
    return /\.(jpg|jpeg|png|webp)$/i.test(url);
  } catch {
    return false;
  }
}

export function validateDuration(minutes: number): boolean {
  return Number.isInteger(minutes) && minutes > 0 && minutes <= 50000; // Max ~34 days
}

export function validateRating(rating: number): boolean {
  return rating >= 0 && rating <= 5;
}

export function validateGenres(genres: string[]): boolean {
  const validGenres = [
    'Fiction',
    'Non-Fiction',
    'Mystery',
    'Romance',
    'Science Fiction',
    'Fantasy',
    'Thriller',
    'Biography',
    'History',
    'Self-Help',
    'Business',
    'True Crime',
    'Horror',
    'Comedy',
    'Drama',
    'Adventure',
    'Young Adult',
    'Children',
    'Poetry',
    'Philosophy',
    'Religion',
    'Politics',
    'Technology',
    'Science',
    'Health',
    'Travel',
    'Cooking',
    'Art',
    'Music',
    'Sports'
  ];

  return genres.length > 0 && genres.every(genre => validGenres.includes(genre));
}

export function validateBook(book: Partial<Book>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!book.id) {
    errors.push('Book ID is required');
  } else if (!validateBookId(book.id)) {
    errors.push('Invalid book ID format');
  }

  if (!book.hardcover_id) {
    errors.push('Hardcover ID is required');
  } else if (!validateHardcoverId(book.hardcover_id)) {
    errors.push('Invalid Hardcover ID format');
  }

  if (!book.title || book.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (book.title.length > 500) {
    errors.push('Title too long (max 500 characters)');
  }

  if (!book.author || book.author.trim().length === 0) {
    errors.push('Author is required');
  } else if (book.author.length > 200) {
    errors.push('Author name too long (max 200 characters)');
  }

  if (!book.cover_image_url) {
    errors.push('Cover image URL is required');
  } else if (!validateCoverImageUrl(book.cover_image_url)) {
    errors.push('Invalid cover image URL');
  }

  if (!book.synopsis) {
    errors.push('Synopsis is required');
  } else if (book.synopsis.length > 2000) {
    errors.push('Synopsis too long (max 2000 characters)');
  }

  if (!book.genre || book.genre.length === 0) {
    errors.push('At least one genre is required');
  } else if (!validateGenres(book.genre)) {
    errors.push('Invalid genre(s)');
  }

  if (book.duration_minutes === undefined) {
    errors.push('Duration is required');
  } else if (!validateDuration(book.duration_minutes)) {
    errors.push('Invalid duration');
  }

  if (!book.availability_status) {
    errors.push('Availability status is required');
  } else if (!['available', 'processing', 'unavailable'].includes(book.availability_status)) {
    errors.push('Invalid availability status');
  }

  if (book.isbn && !validateISBN(book.isbn)) {
    errors.push('Invalid ISBN format');
  }

  if (book.rating !== undefined && !validateRating(book.rating)) {
    errors.push('Rating must be between 0 and 5');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateDiscoveredBook(book: Partial<DiscoveredBook>): { valid: boolean; errors: string[] } {
  const baseValidation = validateBook(book);
  const errors = [...baseValidation.errors];

  if (book.discovery_score === undefined) {
    errors.push('Discovery score is required');
  } else if (book.discovery_score < 0 || book.discovery_score > 100) {
    errors.push('Discovery score must be between 0 and 100');
  }

  if (!book.discovery_reason) {
    errors.push('Discovery reason is required');
  }

  if (!book.scan_coordinates) {
    errors.push('Scan coordinates are required');
  } else {
    const { x, y } = book.scan_coordinates;
    if (typeof x !== 'number' || typeof y !== 'number' ||
        x < 0 || x > 1 || y < 0 || y > 1) {
      errors.push('Scan coordinates must be numbers between 0 and 1');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Utility functions
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

export function getBookYear(book: Book): number | null {
  if (!book.publication_date) return null;

  const year = new Date(book.publication_date).getFullYear();
  return isNaN(year) ? null : year;
}

export function getBookDisplayGenres(book: Book, maxGenres: number = 3): string {
  if (book.genre.length <= maxGenres) {
    return book.genre.join(', ');
  }

  return `${book.genre.slice(0, maxGenres).join(', ')} +${book.genre.length - maxGenres}`;
}

export function getBookDescription(book: Book, maxLength: number = 150): string {
  if (book.synopsis.length <= maxLength) {
    return book.synopsis;
  }

  return book.synopsis.slice(0, maxLength).trim() + '...';
}

export function isBookAvailable(book: Book): boolean {
  return book.availability_status === 'available';
}

export function getBookRatingDisplay(book: Book): string {
  if (!book.rating) return 'Not rated';

  const stars = '★'.repeat(Math.floor(book.rating)) + '☆'.repeat(5 - Math.floor(book.rating));
  const ratingText = book.rating.toFixed(1);
  const countText = book.rating_count ? ` (${book.rating_count})` : '';

  return `${stars} ${ratingText}${countText}`;
}

export function generateBookSearchUrl(query: BookSearchQuery): string {
  const params = new URLSearchParams();

  if (query.query) params.append('q', query.query);
  if (query.filters?.genre) params.append('genre', query.filters.genre.join(','));
  if (query.filters?.author) params.append('author', query.filters.author);
  if (query.sort_by) params.append('sort', query.sort_by);
  if (query.sort_order) params.append('order', query.sort_order);
  if (query.page) params.append('page', query.page.toString());
  if (query.limit) params.append('limit', query.limit.toString());

  return `/discovery/search?${params.toString()}`;
}

// Type guards
export function isBook(obj: any): obj is Book {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.author === 'string' &&
    typeof obj.cover_image_url === 'string' &&
    typeof obj.synopsis === 'string' &&
    Array.isArray(obj.genre) &&
    typeof obj.duration_minutes === 'number' &&
    ['available', 'processing', 'unavailable'].includes(obj.availability_status)
  );
}

export function isDiscoveredBook(obj: any): obj is DiscoveredBook {
  return (
    isBook(obj) &&
    typeof obj.discovery_score === 'number' &&
    typeof obj.discovery_reason === 'string' &&
    obj.scan_coordinates &&
    typeof obj.scan_coordinates.x === 'number' &&
    typeof obj.scan_coordinates.y === 'number'
  );
}

export function isRecommendedBook(obj: any): obj is RecommendedBook {
  return (
    isBook(obj) &&
    typeof obj.recommendation_score === 'number' &&
    Array.isArray(obj.recommendation_reasons) &&
    typeof obj.similarity_to_library === 'number'
  );
}