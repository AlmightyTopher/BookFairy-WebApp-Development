/**
 * Audiobookshelf API Service
 *
 * Manages integration with user's Audiobookshelf instances for
 * library synchronization and audiobook management
 */

import type { Book, LibraryItem, ListeningProgress } from '@/types';

export interface AudiobookshelfConfig {
  server_url: string;
  api_token: string;
  user_id: string;
}

export interface AudiobookshelfBook {
  id: string;
  libraryItemId: string;
  title: string;
  author: string;
  narrator?: string;
  description: string;
  coverPath?: string;
  duration: number;
  tracks: AudioTrack[];
  genres: string[];
  publishedYear?: number;
  addedAt: number;
  updatedAt: number;
}

export interface AudioTrack {
  index: number;
  startOffset: number;
  duration: number;
  title: string;
  contentUrl: string;
  mimeType: string;
}

export interface AudiobookshelfLibraryItem {
  id: string;
  libraryId: string;
  folderId: string;
  path: string;
  relPath: string;
  isFile: boolean;
  mtimeMs: number;
  ctimeMs: number;
  birthtimeMs: number;
  addedAt: number;
  updatedAt: number;
  media: AudiobookshelfBook;
  libraryFiles: LibraryFile[];
}

export interface LibraryFile {
  ino: string;
  metadata: {
    filename: string;
    ext: string;
    path: string;
    relPath: string;
    size: number;
    mtimeMs: number;
    ctimeMs: number;
    birthtimeMs: number;
  };
  addedAt: number;
  updatedAt: number;
  fileType: string;
}

export interface AudiobookshelfProgress {
  id: string;
  userId: string;
  libraryItemId: string;
  episodeId?: string;
  duration: number;
  progress: number;
  currentTime: number;
  isFinished: boolean;
  hideFromContinueListening: boolean;
  lastUpdate: number;
  startedAt: number;
  finishedAt?: number;
}

export interface AudiobookshelfUser {
  id: string;
  username: string;
  email?: string;
  type: 'root' | 'admin' | 'user' | 'guest';
  token: string;
  mediaProgress: AudiobookshelfProgress[];
  seriesHideFromContinueListening: string[];
  bookmarks: Bookmark[];
  isActive: boolean;
  isLocked: boolean;
  lastSeen: number;
  createdAt: number;
  permissions: UserPermissions;
  librariesAccessible: string[];
  itemTagsSelected: string[];
}

export interface Bookmark {
  libraryItemId: string;
  title: string;
  time: number;
  createdAt: number;
}

export interface UserPermissions {
  download: boolean;
  update: boolean;
  delete: boolean;
  upload: boolean;
  accessAllLibraries: boolean;
  accessAllTags: boolean;
  accessExplicitContent: boolean;
}

export interface AudiobookshelfLibrary {
  id: string;
  name: string;
  folders: LibraryFolder[];
  displayOrder: number;
  icon: string;
  mediaType: 'book' | 'podcast';
  provider: string;
  settings: LibrarySettings;
  createdAt: number;
  lastUpdate: number;
}

export interface LibraryFolder {
  id: string;
  fullPath: string;
  libraryId: string;
  addedAt: number;
}

export interface LibrarySettings {
  coverAspectRatio: number;
  disableWatcher: boolean;
  skipMatchingMediaWithAsin: boolean;
  skipMatchingMediaWithIsbn: boolean;
  autoScanCronExpression?: string;
}

export interface SyncResult {
  synchronized_books: number;
  new_books: number;
  updated_progress: number;
  errors: string[];
  last_sync: string;
}

export interface AudiobookshelfError {
  error: string;
  message: string;
  fairy_message: string;
  status_code?: number;
}

export class AudiobookshelfService {
  private baseUrl: string = '';
  private apiToken: string = '';
  private userId: string = '';
  private rateLimitDelay: number = 1000; // 1 second between requests

  /**
   * Initialize connection to Audiobookshelf server
   */
  async initializeConnection(config: AudiobookshelfConfig): Promise<{ success: boolean; user: AudiobookshelfUser }> {
    try {
      this.validateConfig(config);
      this.baseUrl = config.server_url.replace(/\/$/, '');
      this.apiToken = config.api_token;
      this.userId = config.user_id;

      // Test connection by fetching user info
      const user = await this.getCurrentUser();

      return {
        success: true,
        user
      };
    } catch (error) {
      throw this.createAudiobookshelfError(
        'connection_failed',
        error instanceof Error ? error.message : 'Failed to connect to Audiobookshelf',
        'Oh honey, I can\'t seem to connect to your Audiobookshelf server. Let\'s double-check those connection details!',
        error instanceof Error && 'status' in error ? (error as any).status : undefined
      );
    }
  }

  /**
   * Test API connection and validate credentials
   */
  async testConnection(): Promise<{ valid: boolean; user?: AudiobookshelfUser }> {
    try {
      const user = await this.getCurrentUser();
      return { valid: true, user };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<AudiobookshelfUser> {
    try {
      const response = await this.makeRequest('/api/me');
      return response.user || response;
    } catch (error) {
      throw this.createAudiobookshelfError(
        'user_fetch_failed',
        error instanceof Error ? error.message : 'Failed to fetch user information',
        'Well sugar, I can\'t find your Audiobookshelf profile right now!'
      );
    }
  }

  /**
   * Get all libraries accessible to the user
   */
  async getLibraries(): Promise<AudiobookshelfLibrary[]> {
    try {
      const response = await this.makeRequest('/api/libraries');
      return response.libraries || response;
    } catch (error) {
      throw this.createAudiobookshelfError(
        'libraries_fetch_failed',
        error instanceof Error ? error.message : 'Failed to fetch libraries',
        'Oh honey, I\'m having trouble getting your library list from Audiobookshelf!'
      );
    }
  }

  /**
   * Get library items with optional filtering
   */
  async getLibraryItems(libraryId: string, options: {
    limit?: number;
    page?: number;
    sort?: string;
    filter?: string;
    include?: string;
  } = {}): Promise<{ items: AudiobookshelfLibraryItem[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.page) params.append('page', options.page.toString());
      if (options.sort) params.append('sort', options.sort);
      if (options.filter) params.append('filter', options.filter);
      if (options.include) params.append('include', options.include);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await this.makeRequest(`/api/libraries/${libraryId}/items${queryString}`);

      return {
        items: response.results || response.items || [],
        total: response.total || 0
      };
    } catch (error) {
      throw this.createAudiobookshelfError(
        'library_items_fetch_failed',
        error instanceof Error ? error.message : 'Failed to fetch library items',
        'Well bless your heart, I\'m having trouble getting your books from that library!'
      );
    }
  }

  /**
   * Get user's listening progress for all books
   */
  async getUserProgress(): Promise<AudiobookshelfProgress[]> {
    try {
      const user = await this.getCurrentUser();
      return user.mediaProgress || [];
    } catch (error) {
      throw this.createAudiobookshelfError(
        'progress_fetch_failed',
        error instanceof Error ? error.message : 'Failed to fetch listening progress',
        'Oh honey, I can\'t seem to get your reading progress right now!'
      );
    }
  }

  /**
   * Get progress for a specific book
   */
  async getBookProgress(libraryItemId: string): Promise<AudiobookshelfProgress | null> {
    try {
      const allProgress = await this.getUserProgress();
      return allProgress.find(p => p.libraryItemId === libraryItemId) || null;
    } catch (error) {
      throw this.createAudiobookshelfError(
        'book_progress_fetch_failed',
        error instanceof Error ? error.message : 'Failed to fetch book progress',
        'Well sugar, I can\'t find the progress for that particular book!'
      );
    }
  }

  /**
   * Sync Audiobookshelf library with BookFairy
   */
  async syncLibrary(audiobookshelfAccountId: string): Promise<SyncResult> {
    try {
      const result: SyncResult = {
        synchronized_books: 0,
        new_books: 0,
        updated_progress: 0,
        errors: [],
        last_sync: new Date().toISOString()
      };

      // Get all libraries
      const libraries = await this.getLibraries();

      for (const library of libraries) {
        if (library.mediaType === 'book') {
          await this.syncLibraryBooks(library.id, result);
        }
      }

      // Sync user progress
      await this.syncUserProgress(result);

      return result;
    } catch (error) {
      throw this.createAudiobookshelfError(
        'sync_failed',
        error instanceof Error ? error.message : 'Library sync failed',
        'Oh honey, I had trouble syncing your Audiobookshelf library. Let\'s try again!'
      );
    }
  }

  /**
   * Convert Audiobookshelf book to BookFairy book format
   */
  convertToBookFairyBook(absItem: AudiobookshelfLibraryItem): Book {
    const book = absItem.media;

    return {
      id: `abs_${absItem.id}`,
      hardcover_id: '', // Will need to be matched separately
      title: book.title,
      author: book.author,
      narrator: book.narrator,
      cover_image_url: book.coverPath ? `${this.baseUrl}${book.coverPath}` : '',
      synopsis: book.description || '',
      genre: book.genres || [],
      duration_minutes: Math.floor(book.duration / 60),
      publication_year: book.publishedYear?.toString() || '',
      isbn: '', // Not typically available in Audiobookshelf
      language: 'en', // Default, would need detection
      publisher: '', // Not available in Audiobookshelf
      source: 'audiobookshelf',
      external_urls: {
        audiobookshelf: `${this.baseUrl}/item/${absItem.id}`
      },
      tags: [],
      created_at: new Date(book.addedAt).toISOString(),
      updated_at: new Date(book.updatedAt).toISOString()
    };
  }

  /**
   * Convert Audiobookshelf progress to BookFairy format
   */
  convertToListeningProgress(absProgress: AudiobookshelfProgress): ListeningProgress {
    return {
      current_time_seconds: absProgress.currentTime,
      total_duration_seconds: absProgress.duration,
      percentage_complete: Math.round(absProgress.progress * 100),
      last_listened_date: new Date(absProgress.lastUpdate).toISOString(),
      is_completed: absProgress.isFinished,
      listening_speed: 1.0, // Default, not tracked in Audiobookshelf
      chapter_progress: [], // Would need additional API calls
      bookmarks: [], // Would need additional API calls
      notes: [] // Not available in Audiobookshelf
    };
  }

  // Private helper methods
  private validateConfig(config: AudiobookshelfConfig): void {
    if (!config.server_url || !config.api_token || !config.user_id) {
      throw new Error('Server URL, API token, and user ID are required');
    }

    try {
      new URL(config.server_url);
    } catch {
      throw new Error('Invalid server URL format');
    }

    if (config.api_token.length < 10) {
      throw new Error('API token appears to be invalid');
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    await this.rateLimit();

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        timeout: 30000 // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  private async rateLimit(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
  }

  private async syncLibraryBooks(libraryId: string, result: SyncResult): Promise<void> {
    try {
      let page = 0;
      let hasMore = true;

      while (hasMore) {
        const response = await this.getLibraryItems(libraryId, {
          limit: 50,
          page,
          include: 'progress'
        });

        for (const item of response.items) {
          try {
            // Convert to BookFairy format
            const bookFairyBook = this.convertToBookFairyBook(item);

            // Here you would save to your database
            // await bookService.saveBook(bookFairyBook);

            result.synchronized_books++;
            result.new_books++; // Increment if it's actually new
          } catch (itemError) {
            result.errors.push(`Failed to sync book ${item.media.title}: ${itemError instanceof Error ? itemError.message : 'Unknown error'}`);
          }
        }

        hasMore = response.items.length === 50;
        page++;
      }
    } catch (error) {
      result.errors.push(`Failed to sync library ${libraryId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async syncUserProgress(result: SyncResult): Promise<void> {
    try {
      const progressData = await this.getUserProgress();

      for (const progress of progressData) {
        try {
          const listeningProgress = this.convertToListeningProgress(progress);

          // Here you would update progress in your database
          // await libraryService.updateListeningProgress(progress.libraryItemId, listeningProgress);

          result.updated_progress++;
        } catch (progressError) {
          result.errors.push(`Failed to sync progress for item ${progress.libraryItemId}: ${progressError instanceof Error ? progressError.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      result.errors.push(`Failed to sync user progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private createAudiobookshelfError(errorCode: string, message: string, fairyMessage: string, statusCode?: number): AudiobookshelfError {
    const error = new Error(message) as any;
    error.error = errorCode;
    error.message = message;
    error.fairy_message = fairyMessage;
    if (statusCode) error.status_code = statusCode;
    return error;
  }
}

// Export singleton instance
export const audiobookshelfService = new AudiobookshelfService();

// Export convenience functions
export async function initializeAudiobookshelfConnection(config: AudiobookshelfConfig) {
  return audiobookshelfService.initializeConnection(config);
}

export async function testAudiobookshelfConnection() {
  return audiobookshelfService.testConnection();
}

export async function syncAudiobookshelfLibrary(accountId: string) {
  return audiobookshelfService.syncLibrary(accountId);
}

export async function getAudiobookshelfProgress() {
  return audiobookshelfService.getUserProgress();
}