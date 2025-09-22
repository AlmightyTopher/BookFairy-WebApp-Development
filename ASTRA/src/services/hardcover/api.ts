/**
 * Hardcover API Service
 *
 * Handles book discovery, metadata retrieval, and search functionality
 * through the Hardcover book database API
 */

import { env } from '@/utils/env';
import type {
  Book,
  BookSearchQuery,
  BookSearchResult,
  RecommendedBook,
  DiscoveredBook
} from '@/types';

// API Types
export interface HardcoverBook {
  id: string;
  title: string;
  authors: { name: string }[];
  narrators?: { name: string }[];
  image?: string;
  description?: string;
  genres?: { name: string }[];
  published_on?: string;
  duration?: number; // in seconds
  isbn?: string;
  series?: { name: string; position: number };
  publisher?: string;
  language?: string;
  rating?: number;
  rating_count?: number;
}

export interface HardcoverSearchResponse {
  books: HardcoverBook[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface HardcoverGenre {
  id: string;
  name: string;
  book_count: number;
}

export interface HardcoverAuthor {
  id: string;
  name: string;
  book_count: number;
  popular_books: string[];
}

export interface HardcoverError {
  error: string;
  message: string;
  status: number;
}

// Service Implementation
export class HardcoverService {
  private readonly baseUrl: string;
  private readonly rateLimit: number = 60; // requests per minute
  private requestTimestamps: number[] = [];

  constructor() {
    this.baseUrl = env.VITE_HARDCOVER_API_URL;
  }

  /**
   * Search for books with query and filters
   */
  async searchBooks(query: BookSearchQuery): Promise<BookSearchResult> {
    try {
      await this.enforceRateLimit();

      const searchParams = this.buildSearchParams(query);
      const response = await this.makeRequest(`/books/search?${searchParams.toString()}`);

      const hardcoverResponse: HardcoverSearchResponse = await response.json();

      return {
        books: hardcoverResponse.books.map(book => this.mapHardcoverBookToBook(book)),
        pagination: {
          current_page: hardcoverResponse.page,
          total_pages: hardcoverResponse.total_pages,
          total_items: hardcoverResponse.total,
          items_per_page: hardcoverResponse.per_page,
          has_next: hardcoverResponse.page < hardcoverResponse.total_pages,
          has_previous: hardcoverResponse.page > 1
        },
        search_metadata: {
          query_used: query.query || '',
          filters_applied: this.extractAppliedFilters(query),
          total_results: hardcoverResponse.total,
          search_time_ms: 0 // Would be calculated in real implementation
        }
      };
    } catch (error) {
      throw this.createHardcoverError(
        'search_failed',
        error instanceof Error ? error.message : 'Book search failed',
        500
      );
    }
  }

  /**
   * Get book details by ID
   */
  async getBookById(bookId: string): Promise<Book> {
    try {
      await this.enforceRateLimit();

      const response = await this.makeRequest(`/books/${bookId}`);
      const hardcoverBook: HardcoverBook = await response.json();

      return this.mapHardcoverBookToBook(hardcoverBook);
    } catch (error) {
      throw this.createHardcoverError(
        'book_fetch_failed',
        error instanceof Error ? error.message : 'Failed to fetch book details',
        404
      );
    }
  }

  /**
   * Get trending books
   */
  async getTrendingBooks(limit: number = 20): Promise<Book[]> {
    try {
      await this.enforceRateLimit();

      const response = await this.makeRequest(`/books/trending?limit=${limit}`);
      const hardcoverResponse: HardcoverSearchResponse = await response.json();

      return hardcoverResponse.books.map(book => this.mapHardcoverBookToBook(book));
    } catch (error) {
      throw this.createHardcoverError(
        'trending_fetch_failed',
        error instanceof Error ? error.message : 'Failed to fetch trending books',
        500
      );
    }
  }

  /**
   * Get new releases
   */
  async getNewReleases(limit: number = 20): Promise<Book[]> {
    try {
      await this.enforceRateLimit();

      const response = await this.makeRequest(`/books/new-releases?limit=${limit}`);
      const hardcoverResponse: HardcoverSearchResponse = await response.json();

      return hardcoverResponse.books.map(book => this.mapHardcoverBookToBook(book));
    } catch (error) {
      throw this.createHardcoverError(
        'new_releases_fetch_failed',
        error instanceof Error ? error.message : 'Failed to fetch new releases',
        500
      );
    }
  }

  /**
   * Get books by genre
   */
  async getBooksByGenre(genre: string, page: number = 1, limit: number = 20): Promise<BookSearchResult> {
    try {
      await this.enforceRateLimit();

      const query: BookSearchQuery = {
        filters: { genre: [genre] },
        page,
        limit
      };

      return this.searchBooks(query);
    } catch (error) {
      throw this.createHardcoverError(
        'genre_books_fetch_failed',
        error instanceof Error ? error.message : 'Failed to fetch books by genre',
        500
      );
    }
  }

  /**
   * Get books by author
   */
  async getBooksByAuthor(author: string, page: number = 1, limit: number = 20): Promise<BookSearchResult> {
    try {
      await this.enforceRateLimit();

      const query: BookSearchQuery = {
        filters: { author },
        page,
        limit
      };

      return this.searchBooks(query);
    } catch (error) {
      throw this.createHardcoverError(
        'author_books_fetch_failed',
        error instanceof Error ? error.message : 'Failed to fetch books by author',
        500
      );
    }
  }

  /**
   * Get similar books based on a book ID
   */
  async getSimilarBooks(bookId: string, limit: number = 10): Promise<RecommendedBook[]> {
    try {
      await this.enforceRateLimit();

      const response = await this.makeRequest(`/books/${bookId}/similar?limit=${limit}`);
      const similarBooks: HardcoverBook[] = await response.json();

      return similarBooks.map((book, index) => ({
        ...this.mapHardcoverBookToBook(book),
        recommendation_score: Math.max(90 - (index * 5), 50), // Mock scoring
        recommendation_reasons: this.generateRecommendationReasons(book),
        similarity_to_library: Math.random() * 100 // Mock similarity
      }));
    } catch (error) {
      throw this.createHardcoverError(
        'similar_books_fetch_failed',
        error instanceof Error ? error.message : 'Failed to fetch similar books',
        500
      );
    }
  }

  /**
   * Get available genres
   */
  async getGenres(): Promise<{ genres: any[]; popular_genres: string[] }> {
    try {
      await this.enforceRateLimit();

      const response = await this.makeRequest('/genres');
      const genres: HardcoverGenre[] = await response.json();

      const mappedGenres = genres.map(genre => ({
        name: genre.name,
        book_count: genre.book_count,
        trending: genre.book_count > 1000 // Mock trending logic
      }));

      const popularGenres = genres
        .sort((a, b) => b.book_count - a.book_count)
        .slice(0, 10)
        .map(genre => genre.name);

      return {
        genres: mappedGenres,
        popular_genres: popularGenres
      };
    } catch (error) {
      throw this.createHardcoverError(
        'genres_fetch_failed',
        error instanceof Error ? error.message : 'Failed to fetch genres',
        500
      );
    }
  }

  /**
   * Search authors
   */
  async searchAuthors(query: string = '', limit: number = 20): Promise<{ authors: any[] }> {
    try {
      await this.enforceRateLimit();

      const searchParams = new URLSearchParams();
      if (query) searchParams.append('q', query);
      searchParams.append('limit', limit.toString());

      const response = await this.makeRequest(`/authors/search?${searchParams.toString()}`);
      const authors: HardcoverAuthor[] = await response.json();

      const mappedAuthors = authors.map(author => ({
        name: author.name,
        book_count: author.book_count,
        popular_books: author.popular_books || []
      }));

      return { authors: mappedAuthors };
    } catch (error) {
      throw this.createHardcoverError(
        'authors_search_failed',
        error instanceof Error ? error.message : 'Failed to search authors',
        500
      );
    }
  }

  /**
   * Get book recommendations based on user preferences
   */
  async getRecommendations(
    preferredGenres: string[],
    favoriteAuthors: string[],
    limit: number = 10
  ): Promise<RecommendedBook[]> {
    try {
      await this.enforceRateLimit();

      // Build recommendation query based on preferences
      const genreQuery = preferredGenres.length > 0 ? preferredGenres.join(',') : '';
      const authorQuery = favoriteAuthors.length > 0 ? favoriteAuthors.join(',') : '';

      const searchParams = new URLSearchParams();
      if (genreQuery) searchParams.append('genres', genreQuery);
      if (authorQuery) searchParams.append('authors', authorQuery);
      searchParams.append('limit', limit.toString());

      const response = await this.makeRequest(`/recommendations?${searchParams.toString()}`);
      const books: HardcoverBook[] = await response.json();

      return books.map((book, index) => ({
        ...this.mapHardcoverBookToBook(book),
        recommendation_score: Math.max(95 - (index * 3), 60),
        recommendation_reasons: this.generateRecommendationReasons(book, preferredGenres, favoriteAuthors),
        similarity_to_library: Math.random() * 100
      }));
    } catch (error) {
      throw this.createHardcoverError(
        'recommendations_fetch_failed',
        error instanceof Error ? error.message : 'Failed to fetch recommendations',
        500
      );
    }
  }

  // Private helper methods
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BookFairy/1.0',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response;
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;

    // Remove timestamps older than 1 minute
    this.requestTimestamps = this.requestTimestamps.filter(timestamp => timestamp > oneMinuteAgo);

    // Check if we're at the rate limit
    if (this.requestTimestamps.length >= this.rateLimit) {
      const oldestRequest = this.requestTimestamps[0];
      const waitTime = 60 * 1000 - (now - oldestRequest);

      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // Add current request timestamp
    this.requestTimestamps.push(now);
  }

  private buildSearchParams(query: BookSearchQuery): URLSearchParams {
    const params = new URLSearchParams();

    if (query.query) {
      params.append('q', query.query);
    }

    if (query.filters?.genre && query.filters.genre.length > 0) {
      params.append('genres', query.filters.genre.join(','));
    }

    if (query.filters?.author) {
      params.append('author', query.filters.author);
    }

    if (query.filters?.narrator) {
      params.append('narrator', query.filters.narrator);
    }

    if (query.filters?.language) {
      params.append('language', query.filters.language);
    }

    if (query.filters?.duration_min) {
      params.append('min_duration', (query.filters.duration_min * 60).toString()); // Convert to seconds
    }

    if (query.filters?.duration_max) {
      params.append('max_duration', (query.filters.duration_max * 60).toString());
    }

    if (query.sort_by) {
      params.append('sort', query.sort_by);
    }

    if (query.sort_order) {
      params.append('order', query.sort_order);
    }

    if (query.page) {
      params.append('page', query.page.toString());
    }

    if (query.limit) {
      params.append('per_page', query.limit.toString());
    }

    return params;
  }

  private extractAppliedFilters(query: BookSearchQuery): Record<string, any> {
    const filters: Record<string, any> = {};

    if (query.filters?.genre) filters.genre = query.filters.genre;
    if (query.filters?.author) filters.author = query.filters.author;
    if (query.filters?.narrator) filters.narrator = query.filters.narrator;
    if (query.filters?.language) filters.language = query.filters.language;
    if (query.filters?.duration_min) filters.duration_min = query.filters.duration_min;
    if (query.filters?.duration_max) filters.duration_max = query.filters.duration_max;

    return filters;
  }

  private mapHardcoverBookToBook(hardcoverBook: HardcoverBook): Book {
    return {
      id: `hardcover-${hardcoverBook.id}`,
      hardcover_id: hardcoverBook.id,
      title: hardcoverBook.title,
      author: hardcoverBook.authors?.[0]?.name || 'Unknown Author',
      narrator: hardcoverBook.narrators?.[0]?.name,
      cover_image_url: hardcoverBook.image || '/placeholder-book-cover.jpg',
      synopsis: hardcoverBook.description || 'No description available.',
      genre: hardcoverBook.genres?.map(g => g.name) || [],
      publication_date: hardcoverBook.published_on,
      duration_minutes: hardcoverBook.duration ? Math.round(hardcoverBook.duration / 60) : 0,
      availability_status: 'available',
      isbn: hardcoverBook.isbn,
      series: hardcoverBook.series?.name,
      series_number: hardcoverBook.series?.position,
      publisher: hardcoverBook.publisher,
      language: hardcoverBook.language || 'English',
      rating: hardcoverBook.rating,
      rating_count: hardcoverBook.rating_count
    };
  }

  private generateRecommendationReasons(
    book: HardcoverBook,
    preferredGenres?: string[],
    favoriteAuthors?: string[]
  ): string[] {
    const reasons: string[] = [];

    // Genre matches
    if (preferredGenres && book.genres) {
      const matchingGenres = book.genres.filter(g => preferredGenres.includes(g.name));
      if (matchingGenres.length > 0) {
        reasons.push(`Matches your preferred ${matchingGenres.map(g => g.name).join(', ')} genre${matchingGenres.length > 1 ? 's' : ''}`);
      }
    }

    // Author matches
    if (favoriteAuthors && book.authors) {
      const matchingAuthors = book.authors.filter(a => favoriteAuthors.includes(a.name));
      if (matchingAuthors.length > 0) {
        reasons.push(`By your favorite author ${matchingAuthors[0].name}`);
      }
    }

    // Rating-based reasons
    if (book.rating && book.rating >= 4.5) {
      reasons.push('Highly rated by readers');
    }

    // Popularity reasons
    if (book.rating_count && book.rating_count > 1000) {
      reasons.push('Popular with many readers');
    }

    // Default reason if no specific matches
    if (reasons.length === 0) {
      reasons.push('Recommended based on your reading history');
    }

    return reasons;
  }

  private createHardcoverError(errorCode: string, message: string, status: number): HardcoverError {
    const error = new Error(message) as any;
    error.error = errorCode;
    error.message = message;
    error.status = status;
    return error;
  }
}

// Export singleton instance
export const hardcoverService = new HardcoverService();

// Export convenience functions for easier testing and usage
export async function searchBooks(query: BookSearchQuery): Promise<BookSearchResult> {
  return hardcoverService.searchBooks(query);
}

export async function getBookById(bookId: string): Promise<Book> {
  return hardcoverService.getBookById(bookId);
}

export async function getTrendingBooks(limit?: number): Promise<Book[]> {
  return hardcoverService.getTrendingBooks(limit);
}

export async function getNewReleases(limit?: number): Promise<Book[]> {
  return hardcoverService.getNewReleases(limit);
}

export async function getBooksByGenre(genre: string, page?: number, limit?: number): Promise<BookSearchResult> {
  return hardcoverService.getBooksByGenre(genre, page, limit);
}

export async function getBooksByAuthor(author: string, page?: number, limit?: number): Promise<BookSearchResult> {
  return hardcoverService.getBooksByAuthor(author, page, limit);
}

export async function getSimilarBooks(bookId: string, limit?: number): Promise<RecommendedBook[]> {
  return hardcoverService.getSimilarBooks(bookId, limit);
}

export async function getGenres(): Promise<{ genres: any[]; popular_genres: string[] }> {
  return hardcoverService.getGenres();
}

export async function searchAuthors(query?: string, limit?: number): Promise<{ authors: any[] }> {
  return hardcoverService.searchAuthors(query, limit);
}

export async function getRecommendations(
  preferredGenres: string[],
  favoriteAuthors: string[],
  limit?: number
): Promise<RecommendedBook[]> {
  return hardcoverService.getRecommendations(preferredGenres, favoriteAuthors, limit);
}