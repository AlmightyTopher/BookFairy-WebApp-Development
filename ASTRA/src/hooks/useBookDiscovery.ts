/**
 * Book Discovery Hook
 *
 * Provides book search, discovery, and recommendation functionality
 * integrated with Hardcover API and user preferences
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  Book,
  DiscoveredBook,
  RecommendedBook,
  BookSearchQuery,
  BookSearchResult,
  DiscoveryProfile,
  PaginatedResponse,
  UseAsyncState
} from '@/types';
import { useAuthContext } from './useAuth';
import { hardcoverService } from '@/services/hardcover/api';
import { supabase } from '@/services/supabase/client';
import { validateBookSearchQuery } from '@/types/Book';

export interface DiscoveryState {
  searchResults: BookSearchResult | null;
  trendingBooks: Book[];
  recommendations: RecommendedBook[];
  recentSearches: BookSearchQuery[];
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  lastSearchQuery: string | null;
}

export interface DiscoveryActions {
  searchBooks: (query: BookSearchQuery) => Promise<BookSearchResult>;
  getTrendingBooks: (limit?: number) => Promise<Book[]>;
  getRecommendations: (refreshFromProfile?: boolean) => Promise<RecommendedBook[]>;
  getBookDetails: (hardcoverId: string) => Promise<Book>;
  getBooksByGenre: (genre: string, limit?: number) => Promise<Book[]>;
  getBooksByAuthor: (author: string, limit?: number) => Promise<Book[]>;
  searchSimilarBooks: (bookId: string) => Promise<Book[]>;
  saveSearchQuery: (query: BookSearchQuery) => void;
  clearSearchResults: () => void;
  clearRecommendations: () => void;
  clearError: () => void;
}

export interface UseBookDiscoveryResult extends DiscoveryState, DiscoveryActions {}

export const useBookDiscovery = (): UseBookDiscoveryResult => {
  const { user, isAuthenticated } = useAuthContext();
  const [state, setState] = useState<DiscoveryState>({
    searchResults: null,
    trendingBooks: [],
    recommendations: [],
    recentSearches: [],
    isLoading: false,
    isSearching: false,
    error: null,
    lastSearchQuery: null
  });

  // Load trending books and recommendations on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated]);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('bookfairy_recent_searches');
    if (stored) {
      try {
        const recentSearches = JSON.parse(stored);
        setState(prev => ({ ...prev, recentSearches }));
      } catch (error) {
        console.warn('Failed to load recent searches from localStorage');
      }
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Load trending books and recommendations in parallel
      const [trendingBooks, recommendations] = await Promise.allSettled([
        getTrendingBooks(20),
        getRecommendations()
      ]);

      setState(prev => ({
        ...prev,
        trendingBooks: trendingBooks.status === 'fulfilled' ? trendingBooks.value : [],
        recommendations: recommendations.status === 'fulfilled' ? recommendations.value : [],
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load initial data'
      }));
    }
  }, []);

  const searchBooks = useCallback(async (query: BookSearchQuery): Promise<BookSearchResult> => {
    try {
      setState(prev => ({ ...prev, isSearching: true, error: null }));

      // Validate search query
      const validation = validateBookSearchQuery(query);
      if (!validation.valid) {
        throw new Error(validation.errors[0]);
      }

      const result = await hardcoverService.searchBooks(query);

      setState(prev => ({
        ...prev,
        searchResults: result,
        isSearching: false,
        lastSearchQuery: query.query || query.title || query.author || null
      }));

      // Save to recent searches
      saveSearchQuery(query);

      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSearching: false,
        error: error instanceof Error ? error.message : 'Search failed'
      }));
      throw error;
    }
  }, []);

  const getTrendingBooks = useCallback(async (limit = 20): Promise<Book[]> => {
    try {
      const books = await hardcoverService.getTrendingBooks(limit);

      setState(prev => ({
        ...prev,
        trendingBooks: books
      }));

      return books;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load trending books'
      }));
      throw error;
    }
  }, []);

  const getRecommendations = useCallback(async (refreshFromProfile = false): Promise<RecommendedBook[]> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      let recommendations: RecommendedBook[] = [];

      if (refreshFromProfile) {
        // Get user's discovery profile
        const { data: profile, error: profileError } = await supabase
          .from('discovery_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!profileError && profile) {
          // Generate recommendations based on profile
          recommendations = await hardcoverService.generateRecommendations({
            user_id: user.id,
            preferred_genres: profile.preferred_genres,
            favorite_authors: profile.favorite_authors,
            reading_pace: profile.reading_pace,
            exclude_owned: true,
            limit: 10
          });
        }
      } else {
        // Get cached recommendations
        const { data: cachedRecs, error: cacheError } = await supabase
          .from('user_recommendations')
          .select('recommendations')
          .eq('user_id', user.id)
          .single();

        if (!cacheError && cachedRecs?.recommendations) {
          recommendations = cachedRecs.recommendations;
        } else {
          // Fallback to profile-based recommendations
          return getRecommendations(true);
        }
      }

      setState(prev => ({
        ...prev,
        recommendations,
        isLoading: false
      }));

      return recommendations;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load recommendations'
      }));
      throw error;
    }
  }, [user]);

  const getBookDetails = useCallback(async (hardcoverId: string): Promise<Book> => {
    try {
      const book = await hardcoverService.getBookDetails(hardcoverId);
      return book;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load book details'
      }));
      throw error;
    }
  }, []);

  const getBooksByGenre = useCallback(async (genre: string, limit = 20): Promise<Book[]> => {
    try {
      const books = await hardcoverService.getBooksByGenre(genre, limit);
      return books;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load books by genre'
      }));
      throw error;
    }
  }, []);

  const getBooksByAuthor = useCallback(async (author: string, limit = 20): Promise<Book[]> => {
    try {
      const books = await hardcoverService.getBooksByAuthor(author, limit);
      return books;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load books by author'
      }));
      throw error;
    }
  }, []);

  const searchSimilarBooks = useCallback(async (bookId: string): Promise<Book[]> => {
    try {
      const books = await hardcoverService.searchSimilarBooks(bookId);
      return books;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to find similar books'
      }));
      throw error;
    }
  }, []);

  const saveSearchQuery = useCallback((query: BookSearchQuery): void => {
    setState(prev => {
      // Remove duplicate if exists
      const filtered = prev.recentSearches.filter(search =>
        JSON.stringify(search) !== JSON.stringify(query)
      );

      // Add to beginning and limit to 10
      const newSearches = [query, ...filtered].slice(0, 10);

      // Save to localStorage
      try {
        localStorage.setItem('bookfairy_recent_searches', JSON.stringify(newSearches));
      } catch (error) {
        console.warn('Failed to save recent searches to localStorage');
      }

      return {
        ...prev,
        recentSearches: newSearches
      };
    });
  }, []);

  const clearSearchResults = useCallback((): void => {
    setState(prev => ({
      ...prev,
      searchResults: null,
      lastSearchQuery: null
    }));
  }, []);

  const clearRecommendations = useCallback((): void => {
    setState(prev => ({
      ...prev,
      recommendations: []
    }));
  }, []);

  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Computed values
  const hasSearchResults = useMemo(() => {
    return state.searchResults && state.searchResults.books.length > 0;
  }, [state.searchResults]);

  const searchResultsCount = useMemo(() => {
    return state.searchResults?.total_results || 0;
  }, [state.searchResults]);

  const popularGenres = useMemo(() => {
    // Extract genres from trending books
    const genreCounts: Record<string, number> = {};

    state.trendingBooks.forEach(book => {
      book.genre.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });

    return Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([genre]) => genre);
  }, [state.trendingBooks]);

  const featuredAuthors = useMemo(() => {
    // Extract authors from trending books
    const authorCounts: Record<string, number> = {};

    state.trendingBooks.forEach(book => {
      authorCounts[book.author] = (authorCounts[book.author] || 0) + 1;
    });

    return Object.entries(authorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([author]) => author);
  }, [state.trendingBooks]);

  const isInitialLoading = useMemo(() => {
    return state.isLoading && state.trendingBooks.length === 0;
  }, [state.isLoading, state.trendingBooks.length]);

  return {
    ...state,
    searchBooks,
    getTrendingBooks,
    getRecommendations,
    getBookDetails,
    getBooksByGenre,
    getBooksByAuthor,
    searchSimilarBooks,
    saveSearchQuery,
    clearSearchResults,
    clearRecommendations,
    clearError,
    // Additional computed properties
    hasSearchResults,
    searchResultsCount,
    popularGenres,
    featuredAuthors,
    isInitialLoading
  } as UseBookDiscoveryResult & {
    hasSearchResults: boolean;
    searchResultsCount: number;
    popularGenres: string[];
    featuredAuthors: string[];
    isInitialLoading: boolean;
  };
};

// Utility hooks for specific discovery scenarios
export const useBookSearch = () => {
  const { searchBooks, searchResults, isSearching, clearSearchResults } = useBookDiscovery();

  return {
    searchBooks,
    results: searchResults,
    isSearching,
    clearResults: clearSearchResults
  };
};

export const useTrendingBooks = (autoLoad = true) => {
  const { trendingBooks, getTrendingBooks, isLoading } = useBookDiscovery();

  useEffect(() => {
    if (autoLoad && trendingBooks.length === 0 && !isLoading) {
      getTrendingBooks();
    }
  }, [autoLoad, trendingBooks.length, isLoading, getTrendingBooks]);

  return {
    books: trendingBooks,
    isLoading,
    refresh: getTrendingBooks
  };
};

export const useRecommendations = (autoLoad = true) => {
  const { recommendations, getRecommendations, isLoading, user } = useBookDiscovery() as any;

  useEffect(() => {
    if (autoLoad && user && recommendations.length === 0 && !isLoading) {
      getRecommendations();
    }
  }, [autoLoad, user, recommendations.length, isLoading, getRecommendations]);

  return {
    recommendations,
    isLoading,
    refresh: () => getRecommendations(true)
  };
};

export const useGenreExploration = () => {
  const { getBooksByGenre, popularGenres } = useBookDiscovery() as any;
  const [genreBooks, setGenreBooks] = useState<Record<string, Book[]>>({});
  const [loadingGenres, setLoadingGenres] = useState<string[]>([]);

  const exploreGenre = useCallback(async (genre: string) => {
    if (genreBooks[genre] || loadingGenres.includes(genre)) return;

    try {
      setLoadingGenres(prev => [...prev, genre]);
      const books = await getBooksByGenre(genre, 12);
      setGenreBooks(prev => ({ ...prev, [genre]: books }));
    } finally {
      setLoadingGenres(prev => prev.filter(g => g !== genre));
    }
  }, [getBooksByGenre, genreBooks, loadingGenres]);

  return {
    popularGenres,
    genreBooks,
    loadingGenres,
    exploreGenre
  };
};

export const useAuthorExploration = () => {
  const { getBooksByAuthor, featuredAuthors } = useBookDiscovery() as any;
  const [authorBooks, setAuthorBooks] = useState<Record<string, Book[]>>({});
  const [loadingAuthors, setLoadingAuthors] = useState<string[]>([]);

  const exploreAuthor = useCallback(async (author: string) => {
    if (authorBooks[author] || loadingAuthors.includes(author)) return;

    try {
      setLoadingAuthors(prev => [...prev, author]);
      const books = await getBooksByAuthor(author, 12);
      setAuthorBooks(prev => ({ ...prev, [author]: books }));
    } finally {
      setLoadingAuthors(prev => prev.filter(a => a !== author));
    }
  }, [getBooksByAuthor, authorBooks, loadingAuthors]);

  return {
    featuredAuthors,
    authorBooks,
    loadingAuthors,
    exploreAuthor
  };
};