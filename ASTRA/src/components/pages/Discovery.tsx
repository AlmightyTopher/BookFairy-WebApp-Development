/**
 * Discovery Page Component
 *
 * Book discovery interface with search, recommendations, trending books,
 * and genre exploration with fairy-themed design
 */

import React, { useState, useEffect } from 'react';
import { useBookDiscovery, useTrendingBooks, useRecommendations } from '@/hooks/useBookDiscovery';
import { useLibrary } from '@/hooks/useLibrary';
import { useWishlist } from '@/hooks/useWishlist';
import { useFairyContext } from '@/components/fairy';
import { Card, CardHeader, CardContent, CardTitle, BookCard } from '@/components/ui/Card';
import { Button, MagicalButton } from '@/components/ui/Button';
import { Input, SearchInput } from '@/components/ui/Input';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/Modal';
import { cn } from '@/utils/cn';
import type { Book, BookSearchQuery } from '@/types';

export interface DiscoveryProps {
  className?: string;
}

const Discovery: React.FC<DiscoveryProps> = ({ className }) => {
  const { celebrateAction } = useFairyContext();

  const {
    searchBooks,
    searchResults,
    isSearching,
    popularGenres,
    featuredAuthors,
    clearSearchResults,
    getBooksByGenre,
    getBooksByAuthor,
    getBookDetails
  } = useBookDiscovery() as any;

  const { books: trendingBooks, isLoading: trendingLoading } = useTrendingBooks();
  const { recommendations, isLoading: recommendationsLoading } = useRecommendations();

  const { addToLibrary } = useLibrary();
  const { addToWishlist } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('');
  const [genreBooks, setGenreBooks] = useState<Record<string, Book[]>>({});
  const [authorBooks, setAuthorBooks] = useState<Record<string, Book[]>>({});
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'trending' | 'recommendations' | 'genres' | 'authors'>('trending');
  const [loadingGenres, setLoadingGenres] = useState<string[]>([]);
  const [loadingAuthors, setLoadingAuthors] = useState<string[]>([]);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    const query: BookSearchQuery = {
      query: searchQuery,
      limit: 20
    };

    try {
      await searchBooks(query);
      setActiveTab('search');
      celebrateAction('book_search', { query: searchQuery });
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  // Handle enter key in search
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Load books by genre
  const handleGenreClick = async (genre: string) => {
    if (genreBooks[genre] || loadingGenres.includes(genre)) return;

    setLoadingGenres(prev => [...prev, genre]);
    try {
      const books = await getBooksByGenre(genre, 12);
      setGenreBooks(prev => ({ ...prev, [genre]: books }));
      setSelectedGenre(genre);
      setActiveTab('genres');
    } catch (error) {
      console.error('Failed to load genre books:', error);
    } finally {
      setLoadingGenres(prev => prev.filter(g => g !== genre));
    }
  };

  // Load books by author
  const handleAuthorClick = async (author: string) => {
    if (authorBooks[author] || loadingAuthors.includes(author)) return;

    setLoadingAuthors(prev => [...prev, author]);
    try {
      const books = await getBooksByAuthor(author, 12);
      setAuthorBooks(prev => ({ ...prev, [author]: books }));
      setSelectedAuthor(author);
      setActiveTab('authors');
    } catch (error) {
      console.error('Failed to load author books:', error);
    } finally {
      setLoadingAuthors(prev => prev.filter(a => a !== author));
    }
  };

  // Handle book actions
  const handleBookAction = async (action: string, book: Book) => {
    try {
      switch (action) {
        case 'view':
          setSelectedBook(book);
          setIsBookModalOpen(true);
          break;
        case 'add_to_library':
          await addToLibrary(book);
          celebrateAction('book_added', { title: book.title });
          break;
        case 'add_to_wishlist':
          await addToWishlist(book);
          celebrateAction('book_wishlisted', { title: book.title });
          break;
      }
    } catch (error) {
      console.error('Book action failed:', error);
    }
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50", className)}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Discover Your Next Adventure 🔍
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore trending books, get personalized recommendations, or search for something specific. Let's find your next favorite read!
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <SearchInput
                placeholder="Search for books, authors, or genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                onClear={() => {
                  setSearchQuery('');
                  clearSearchResults();
                }}
                className="flex-1"
              />
              <MagicalButton
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isSearching}
                loading={isSearching}
              >
                Search
              </MagicalButton>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {[
            { id: 'trending', label: 'Trending', icon: '🔥' },
            { id: 'recommendations', label: 'For You', icon: '✨' },
            { id: 'genres', label: 'Genres', icon: '🎭' },
            { id: 'authors', label: 'Authors', icon: '✍️' },
            ...(searchResults ? [{ id: 'search', label: 'Search Results', icon: '🔍' }] : [])
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id as any)}
              className="text-sm"
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Content based on active tab */}
        <div className="space-y-8">
          {/* Search Results */}
          {activeTab === 'search' && searchResults && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Search Results
                  <span className="text-lg font-normal text-gray-500 ml-2">
                    ({searchResults.total_results} books found)
                  </span>
                </h2>
                <Button variant="outline" onClick={() => {
                  clearSearchResults();
                  setActiveTab('trending');
                }}>
                  Clear Search
                </Button>
              </div>

              {searchResults.books.length === 0 ? (
                <Card className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No books found</h3>
                  <p className="text-gray-600 mb-6">
                    Try different keywords or browse our trending books below.
                  </p>
                  <Button onClick={() => setActiveTab('trending')}>
                    Browse Trending Books
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {searchResults.books.map((book: Book) => (
                    <BookCard
                      key={book.id}
                      title={book.title}
                      author={book.author}
                      coverUrl={book.cover_image_url}
                      onAction={(action) => handleBookAction(action, book)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Trending Books */}
          {activeTab === 'trending' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">🔥</span>
                Trending Books
              </h2>

              {trendingLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-80"></div>
                    </div>
                  ))}
                </div>
              ) : trendingBooks.length === 0 ? (
                <Card className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No trending books available</h3>
                  <p className="text-gray-600">Check back later for the latest popular reads!</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {trendingBooks.map((book: Book) => (
                    <BookCard
                      key={book.id}
                      title={book.title}
                      author={book.author}
                      coverUrl={book.cover_image_url}
                      onAction={(action) => handleBookAction(action, book)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recommendations */}
          {activeTab === 'recommendations' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">✨</span>
                Recommended for You
              </h2>

              {recommendationsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-80"></div>
                    </div>
                  ))}
                </div>
              ) : recommendations.length === 0 ? (
                <Card className="text-center py-12">
                  <div className="text-6xl mb-4">🔮</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Building your recommendations</h3>
                  <p className="text-gray-600 mb-6">
                    Add some books to your library or wishlist to get personalized recommendations!
                  </p>
                  <Button onClick={() => setActiveTab('trending')}>
                    Browse Trending Books
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {recommendations.map((book: Book) => (
                    <BookCard
                      key={book.id}
                      title={book.title}
                      author={book.author}
                      coverUrl={book.cover_image_url}
                      onAction={(action) => handleBookAction(action, book)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Genres */}
          {activeTab === 'genres' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">🎭</span>
                Explore by Genre
              </h2>

              {/* Genre Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {popularGenres.map((genre: string) => (
                  <Button
                    key={genre}
                    variant={selectedGenre === genre ? 'default' : 'outline'}
                    onClick={() => handleGenreClick(genre)}
                    disabled={loadingGenres.includes(genre)}
                    className="h-auto py-4 text-center"
                  >
                    {loadingGenres.includes(genre) ? (
                      <div className="animate-spin w-4 h-4">⟳</div>
                    ) : (
                      <div>
                        <div className="text-lg mb-1">📖</div>
                        <div className="text-sm">{genre}</div>
                      </div>
                    )}
                  </Button>
                ))}
              </div>

              {/* Selected Genre Books */}
              {selectedGenre && genreBooks[selectedGenre] && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {selectedGenre} Books
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {genreBooks[selectedGenre].map((book: Book) => (
                      <BookCard
                        key={book.id}
                        title={book.title}
                        author={book.author}
                        coverUrl={book.cover_image_url}
                        onAction={(action) => handleBookAction(action, book)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Authors */}
          {activeTab === 'authors' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">✍️</span>
                Featured Authors
              </h2>

              {/* Authors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {featuredAuthors.map((author: string) => (
                  <Button
                    key={author}
                    variant={selectedAuthor === author ? 'default' : 'outline'}
                    onClick={() => handleAuthorClick(author)}
                    disabled={loadingAuthors.includes(author)}
                    className="h-auto py-4 text-left justify-start"
                  >
                    {loadingAuthors.includes(author) ? (
                      <div className="animate-spin w-4 h-4 mr-3">⟳</div>
                    ) : (
                      <div className="mr-3 text-lg">✍️</div>
                    )}
                    <div className="truncate">{author}</div>
                  </Button>
                ))}
              </div>

              {/* Selected Author Books */}
              {selectedAuthor && authorBooks[selectedAuthor] && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Books by {selectedAuthor}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {authorBooks[selectedAuthor].map((book: Book) => (
                      <BookCard
                        key={book.id}
                        title={book.title}
                        author={book.author}
                        coverUrl={book.cover_image_url}
                        onAction={(action) => handleBookAction(action, book)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Book Details Modal */}
        <Modal
          isOpen={isBookModalOpen}
          onClose={() => setIsBookModalOpen(false)}
          size="lg"
          variant="magical"
        >
          <ModalHeader>
            <ModalTitle>Book Details</ModalTitle>
          </ModalHeader>
          <ModalContent>
            {selectedBook && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Book Cover */}
                  <div className="flex-shrink-0">
                    <div className="w-48 h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg overflow-hidden">
                      {selectedBook.cover_image_url ? (
                        <img
                          src={selectedBook.cover_image_url}
                          alt={selectedBook.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-purple-400">
                          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedBook.title}</h2>
                      <p className="text-lg text-gray-600">{selectedBook.author}</p>
                      {selectedBook.narrator && (
                        <p className="text-sm text-gray-500">Narrated by {selectedBook.narrator}</p>
                      )}
                    </div>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-2">
                      {selectedBook.genre.map(genre => (
                        <span
                          key={genre}
                          className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>

                    {/* Book Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {selectedBook.duration_minutes && (
                        <div>
                          <span className="font-medium">Duration:</span>
                          <span className="ml-2">{Math.floor(selectedBook.duration_minutes / 60)}h {selectedBook.duration_minutes % 60}m</span>
                        </div>
                      )}
                      {selectedBook.publication_year && (
                        <div>
                          <span className="font-medium">Published:</span>
                          <span className="ml-2">{selectedBook.publication_year}</span>
                        </div>
                      )}
                      {selectedBook.publisher && (
                        <div>
                          <span className="font-medium">Publisher:</span>
                          <span className="ml-2">{selectedBook.publisher}</span>
                        </div>
                      )}
                      {selectedBook.language && (
                        <div>
                          <span className="font-medium">Language:</span>
                          <span className="ml-2">{selectedBook.language}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button onClick={() => handleBookAction('add_to_library', selectedBook)}>
                        Add to Library
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleBookAction('add_to_wishlist', selectedBook)}
                      >
                        Add to Wishlist
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Synopsis */}
                {selectedBook.synopsis && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">Synopsis</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedBook.synopsis}
                    </p>
                  </div>
                )}

                {/* External Links */}
                {selectedBook.external_urls && Object.keys(selectedBook.external_urls).length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">External Links</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedBook.external_urls).map(([platform, url]) => (
                        <Button
                          key={platform}
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(url, '_blank')}
                        >
                          View on {platform}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default Discovery;