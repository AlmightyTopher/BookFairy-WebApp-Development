import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/services/supabase/client';

/**
 * Contract Tests for Discovery API
 *
 * These tests validate the discovery service contracts
 * against the OpenAPI specification defined in contracts/discovery.yaml
 *
 * Tests MUST FAIL until the discovery service is implemented
 */

describe('Discovery Contract Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /discovery/readar - Get readar-scanned book recommendations', () => {
    it('should return readar scan results with default parameters', async () => {
      // This test MUST FAIL until ReadarEngine component is implemented
      const discoveryService = await import('@/services/discovery/readar');

      const result = await discoveryService.performReadarScan({});

      expect(result).toBeDefined();
      expect(result.scan_results).toBeInstanceOf(Array);
      expect(result.scan_results.length).toBeLessThanOrEqual(20); // default limit
      expect(result.scan_metadata).toBeDefined();
      expect(result.scan_metadata.scan_timestamp).toBeDefined();
      expect(result.scan_metadata.total_books_scanned).toBeGreaterThan(0);
      expect(result.fairy_commentary).toBeDefined();
      expect(result.fairy_commentary).toMatch(/Well honey|Sugar|Bless your heart|Oh my stars/);
    });

    it('should respect scan intensity parameter', async () => {
      const discoveryService = await import('@/services/discovery/readar');

      const result = await discoveryService.performReadarScan({
        scan_intensity: 8,
        limit: 10
      });

      expect(result.scan_results).toBeInstanceOf(Array);
      expect(result.scan_results.length).toBeLessThanOrEqual(10);
      expect(result.scan_metadata.filters_applied.scan_intensity).toBe(8);
    });

    it('should include trending books when requested', async () => {
      const discoveryService = await import('@/services/discovery/readar');

      const result = await discoveryService.performReadarScan({
        include_trending: true,
        limit: 5
      });

      expect(result.scan_results).toBeInstanceOf(Array);
      expect(result.scan_metadata.trending_weight).toBeGreaterThan(0);
    });

    it('should validate scan intensity bounds', async () => {
      const discoveryService = await import('@/services/discovery/readar');

      await expect(
        discoveryService.performReadarScan({
          scan_intensity: 11 // exceeds maximum
        })
      ).rejects.toThrow('Scan intensity must be between 1 and 10');
    });

    it('should return books with discovery metadata', async () => {
      const discoveryService = await import('@/services/discovery/readar');

      const result = await discoveryService.performReadarScan({ limit: 3 });

      expect(result.scan_results).toBeInstanceOf(Array);
      result.scan_results.forEach(book => {
        expect(book.id).toBeDefined();
        expect(book.title).toBeDefined();
        expect(book.author).toBeDefined();
        expect(book.discovery_score).toBeGreaterThanOrEqual(0);
        expect(book.discovery_score).toBeLessThanOrEqual(100);
        expect(book.discovery_reason).toBeDefined();
        expect(book.scan_coordinates).toBeDefined();
        expect(book.scan_coordinates.x).toBeTypeOf('number');
        expect(book.scan_coordinates.y).toBeTypeOf('number');
      });
    });

    it('should require authentication', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null
      } as any);

      const discoveryService = await import('@/services/discovery/readar');

      await expect(discoveryService.performReadarScan({})).rejects.toThrow('Authentication required');
    });
  });

  describe('GET /discovery/search - Search books by criteria', () => {
    it('should search books by title/author query', async () => {
      const discoveryService = await import('@/services/discovery/search');

      const result = await discoveryService.searchBooks({
        query: 'Stephen King'
      });

      expect(result).toBeDefined();
      expect(result.books).toBeInstanceOf(Array);
      expect(result.pagination).toBeDefined();
      expect(result.search_metadata).toBeDefined();
      expect(result.search_metadata.query_used).toBe('Stephen King');
      expect(result.search_metadata.total_results).toBeGreaterThanOrEqual(0);
    });

    it('should filter by author', async () => {
      const discoveryService = await import('@/services/discovery/search');

      const result = await discoveryService.searchBooks({
        author: 'Agatha Christie'
      });

      expect(result.books).toBeInstanceOf(Array);
      expect(result.search_metadata.filters_applied.author).toBe('Agatha Christie');
    });

    it('should filter by genre', async () => {
      const discoveryService = await import('@/services/discovery/search');

      const result = await discoveryService.searchBooks({
        genre: 'Science Fiction'
      });

      expect(result.books).toBeInstanceOf(Array);
      expect(result.search_metadata.filters_applied.genre).toBe('Science Fiction');
    });

    it('should handle pagination correctly', async () => {
      const discoveryService = await import('@/services/discovery/search');

      const result = await discoveryService.searchBooks({
        query: 'fantasy',
        page: 2,
        limit: 10
      });

      expect(result.pagination.current_page).toBe(2);
      expect(result.pagination.items_per_page).toBe(10);
      expect(result.pagination.has_previous).toBe(true);
    });

    it('should validate limit parameter bounds', async () => {
      const discoveryService = await import('@/services/discovery/search');

      await expect(
        discoveryService.searchBooks({
          query: 'test',
          limit: 101 // exceeds maximum
        })
      ).rejects.toThrow('Limit must be between 1 and 100');
    });

    it('should require either query or filters', async () => {
      const discoveryService = await import('@/services/discovery/search');

      await expect(
        discoveryService.searchBooks({})
      ).rejects.toThrow('Query or filter parameters required');
    });
  });

  describe('GET /discovery/recommendations - Get personalized recommendations', () => {
    it('should return personalized recommendations', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: {
          session: {
            access_token: 'valid_token',
            user: { id: 'user_id', email: 'test@example.com' }
          }
        },
        error: null
      } as any);

      const discoveryService = await import('@/services/discovery/recommendations');

      const result = await discoveryService.getPersonalizedRecommendations({});

      expect(result).toBeDefined();
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeLessThanOrEqual(10); // default limit
      expect(result.recommendation_reasoning).toBeInstanceOf(Array);
      expect(result.fairy_suggestions).toBeDefined();
      expect(result.fairy_suggestions).toMatch(/Well sugar|Oh honey|Bless your heart/);
    });

    it('should handle different recommendation types', async () => {
      const discoveryService = await import('@/services/discovery/recommendations');

      const result = await discoveryService.getPersonalizedRecommendations({
        recommendation_type: 'similar_authors',
        limit: 5
      });

      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeLessThanOrEqual(5);
      result.recommendations.forEach(book => {
        expect(book.recommendation_score).toBeGreaterThanOrEqual(0);
        expect(book.recommendation_score).toBeLessThanOrEqual(100);
        expect(book.recommendation_reasons).toBeInstanceOf(Array);
        expect(book.similarity_to_library).toBeGreaterThanOrEqual(0);
        expect(book.similarity_to_library).toBeLessThanOrEqual(100);
      });
    });

    it('should validate recommendation type enum', async () => {
      const discoveryService = await import('@/services/discovery/recommendations');

      await expect(
        discoveryService.getPersonalizedRecommendations({
          recommendation_type: 'invalid_type' as any
        })
      ).rejects.toThrow('Invalid recommendation type');
    });
  });

  describe('GET /discovery/genres - Get available book genres', () => {
    it('should return available genres with counts', async () => {
      const discoveryService = await import('@/services/discovery/genres');

      const result = await discoveryService.getAvailableGenres();

      expect(result).toBeDefined();
      expect(result.genres).toBeInstanceOf(Array);
      expect(result.popular_genres).toBeInstanceOf(Array);

      result.genres.forEach(genre => {
        expect(genre.name).toBeDefined();
        expect(genre.book_count).toBeGreaterThanOrEqual(0);
        expect(genre.trending).toBeTypeOf('boolean');
      });
    });

    it('should include popular genres separately', async () => {
      const discoveryService = await import('@/services/discovery/genres');

      const result = await discoveryService.getAvailableGenres();

      expect(result.popular_genres).toBeInstanceOf(Array);
      expect(result.popular_genres.length).toBeGreaterThan(0);
      result.popular_genres.forEach(genre => {
        expect(typeof genre).toBe('string');
      });
    });
  });

  describe('GET /discovery/authors - Search authors with book counts', () => {
    it('should search authors by name', async () => {
      const discoveryService = await import('@/services/discovery/authors');

      const result = await discoveryService.searchAuthors({
        query: 'King'
      });

      expect(result).toBeDefined();
      expect(result.authors).toBeInstanceOf(Array);

      result.authors.forEach(author => {
        expect(author.name).toBeDefined();
        expect(author.name.toLowerCase()).toContain('king');
        expect(author.book_count).toBeGreaterThanOrEqual(0);
        expect(author.popular_books).toBeInstanceOf(Array);
      });
    });

    it('should return all authors when no query provided', async () => {
      const discoveryService = await import('@/services/discovery/authors');

      const result = await discoveryService.searchAuthors({});

      expect(result.authors).toBeInstanceOf(Array);
      expect(result.authors.length).toBeLessThanOrEqual(20); // default limit
    });

    it('should respect limit parameter', async () => {
      const discoveryService = await import('@/services/discovery/authors');

      const result = await discoveryService.searchAuthors({
        limit: 5
      });

      expect(result.authors.length).toBeLessThanOrEqual(5);
    });

    it('should validate limit bounds', async () => {
      const discoveryService = await import('@/services/discovery/authors');

      await expect(
        discoveryService.searchAuthors({
          limit: 101 // exceeds maximum
        })
      ).rejects.toThrow('Limit must be between 1 and 100');
    });
  });

  describe('Error Response Format', () => {
    it('should return errors in specified format with fairy_message', async () => {
      const discoveryService = await import('@/services/discovery/readar');

      try {
        await discoveryService.performReadarScan({
          scan_intensity: 0 // invalid value
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
 * Integration Tests for Discovery Flow
 * These test the complete discovery workflow end-to-end
 */
describe('Discovery Integration Contract Tests', () => {
  it('should complete full readar discovery flow', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          access_token: 'valid_token',
          user: { id: 'user_id', email: 'test@example.com' }
        }
      },
      error: null
    } as any);

    const readarService = await import('@/services/discovery/readar');
    const recommendationsService = await import('@/services/discovery/recommendations');

    // Step 1: Perform readar scan
    const scanResult = await readarService.performReadarScan({
      scan_intensity: 7,
      include_trending: true,
      limit: 10
    });

    expect(scanResult.scan_results).toBeInstanceOf(Array);
    expect(scanResult.scan_results.length).toBeGreaterThan(0);

    // Step 2: Get personalized recommendations based on scan
    const recommendationsResult = await recommendationsService.getPersonalizedRecommendations({
      recommendation_type: 'personal_mix',
      limit: 5
    });

    expect(recommendationsResult.recommendations).toBeInstanceOf(Array);
    expect(recommendationsResult.fairy_suggestions).toBeDefined();
  });

  it('should handle discovery preferences and filtering', async () => {
    const genresService = await import('@/services/discovery/genres');
    const searchService = await import('@/services/discovery/search');

    // Step 1: Get available genres
    const genresResult = await genresService.getAvailableGenres();
    expect(genresResult.genres).toBeInstanceOf(Array);

    // Step 2: Search within a specific genre
    const selectedGenre = genresResult.popular_genres[0];
    const searchResult = await searchService.searchBooks({
      genre: selectedGenre,
      limit: 5
    });

    expect(searchResult.books).toBeInstanceOf(Array);
    expect(searchResult.search_metadata.filters_applied.genre).toBe(selectedGenre);
  });

  it('should handle cross-service discovery coordination', async () => {
    const authorsService = await import('@/services/discovery/authors');
    const searchService = await import('@/services/discovery/search');

    // Step 1: Search for authors
    const authorsResult = await authorsService.searchAuthors({
      query: 'fantasy',
      limit: 3
    });

    expect(authorsResult.authors).toBeInstanceOf(Array);

    // Step 2: Search books by selected author
    if (authorsResult.authors.length > 0) {
      const selectedAuthor = authorsResult.authors[0];
      const booksResult = await searchService.searchBooks({
        author: selectedAuthor.name
      });

      expect(booksResult.books).toBeInstanceOf(Array);
      expect(booksResult.search_metadata.filters_applied.author).toBe(selectedAuthor.name);
    }
  });
});