/**
 * Library Page Component
 *
 * Main library view for managing user's book collection,
 * tracking reading progress, and organizing books
 */

import React, { useState, useEffect } from 'react';
import { useLibrary } from '@/hooks/useLibrary';
import { useFairyContext } from '@/components/fairy';
import { Card, CardHeader, CardContent, CardTitle, BookCard } from '@/components/ui/Card';
import { Button, MagicalButton } from '@/components/ui/Button';
import { Input, SearchInput } from '@/components/ui/Input';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/Modal';
import { cn } from '@/utils/cn';
import type { LibraryItem, CompletionStatus, LibraryFilters } from '@/types';

export interface LibraryProps {
  className?: string;
}

const Library: React.FC<LibraryProps> = ({ className }) => {
  const { celebrateAction } = useFairyContext();

  const {
    items: libraryItems,
    stats: libraryStats,
    isLoading,
    error,
    currentlyReading,
    recentlyCompleted,
    updateRating,
    updateNotes,
    markCompleted,
    markInProgress,
    removeFromLibrary,
    searchLibrary,
    refreshLibrary
  } = useLibrary() as any;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<CompletionStatus | 'all'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('added_date');
  const [filteredItems, setFilteredItems] = useState<LibraryItem[]>([]);
  const [selectedBook, setSelectedBook] = useState<LibraryItem | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Get unique genres from library
  const availableGenres = React.useMemo(() => {
    const genres = new Set<string>();
    libraryItems.forEach((item: LibraryItem) => {
      item.book.genre.forEach(genre => genres.add(genre));
    });
    return Array.from(genres).sort();
  }, [libraryItems]);

  // Filter and sort items
  useEffect(() => {
    let filtered = [...libraryItems];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.book.genre.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.completion_status === selectedStatus);
    }

    // Genre filter
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(item => item.book.genre.includes(selectedGenre));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.book.title.localeCompare(b.book.title);
        case 'author':
          return a.book.author.localeCompare(b.book.author);
        case 'rating':
          return (b.user_rating || 0) - (a.user_rating || 0);
        case 'progress':
          return (b.listening_progress?.percentage_complete || 0) - (a.listening_progress?.percentage_complete || 0);
        case 'added_date':
        default:
          return new Date(b.added_date).getTime() - new Date(a.added_date).getTime();
      }
    });

    setFilteredItems(filtered);
  }, [libraryItems, searchQuery, selectedStatus, selectedGenre, sortBy]);

  const handleBookAction = async (action: string, item: LibraryItem) => {
    try {
      switch (action) {
        case 'view':
          setSelectedBook(item);
          setIsDetailsModalOpen(true);
          break;
        case 'continue':
          await markInProgress(item.id);
          celebrateAction('reading_continued', { title: item.book.title });
          break;
        case 'complete':
          await markCompleted(item.id);
          celebrateAction('book_completed', { title: item.book.title });
          break;
        case 'remove':
          if (confirm(`Remove "${item.book.title}" from your library?`)) {
            await removeFromLibrary(item.id);
          }
          break;
      }
    } catch (error) {
      console.error('Book action failed:', error);
    }
  };

  const handleRatingChange = async (rating: number) => {
    if (!selectedBook) return;
    try {
      await updateRating(selectedBook.id, rating);
      setSelectedBook(prev => prev ? { ...prev, user_rating: rating } : null);
    } catch (error) {
      console.error('Rating update failed:', error);
    }
  };

  const handleNotesChange = async (notes: string) => {
    if (!selectedBook) return;
    try {
      await updateNotes(selectedBook.id, notes);
      setSelectedBook(prev => prev ? { ...prev, user_notes: notes } : null);
    } catch (error) {
      console.error('Notes update failed:', error);
    }
  };

  const statusCounts = React.useMemo(() => {
    return {
      all: libraryItems.length,
      not_started: libraryItems.filter((item: LibraryItem) => item.completion_status === 'not_started').length,
      in_progress: libraryItems.filter((item: LibraryItem) => item.completion_status === 'in_progress').length,
      completed: libraryItems.filter((item: LibraryItem) => item.completion_status === 'completed').length
    };
  }, [libraryItems]);

  if (error) {
    return (
      <div className={cn("min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center", className)}>
        <Card variant="outline" className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">😟</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refreshLibrary}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50", className)}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
            My Magical Library 📚
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your personal collection of literary treasures! Track your reading journey and discover insights about your reading habits.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="magical" className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600">{libraryStats.total_books}</div>
              <div className="text-sm text-gray-600 mt-1">Total Books</div>
            </CardContent>
          </Card>

          <Card variant="magical" className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600">{libraryStats.in_progress_books}</div>
              <div className="text-sm text-gray-600 mt-1">Currently Reading</div>
            </CardContent>
          </Card>

          <Card variant="magical" className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600">{libraryStats.completed_books}</div>
              <div className="text-sm text-gray-600 mt-1">Completed</div>
            </CardContent>
          </Card>

          <Card variant="magical" className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-yellow-600">{libraryStats.average_rating.toFixed(1)}</div>
              <div className="text-sm text-gray-600 mt-1">Avg Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SearchInput
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
              />

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as CompletionStatus | 'all')}
                className="px-3 py-2 border border-purple-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Books ({statusCounts.all})</option>
                <option value="not_started">Not Started ({statusCounts.not_started})</option>
                <option value="in_progress">In Progress ({statusCounts.in_progress})</option>
                <option value="completed">Completed ({statusCounts.completed})</option>
              </select>

              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-3 py-2 border border-purple-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Genres</option>
                {availableGenres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-purple-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="added_date">Recently Added</option>
                <option value="title">Title A-Z</option>
                <option value="author">Author A-Z</option>
                <option value="rating">Highest Rated</option>
                <option value="progress">Most Progress</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Books Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-80"></div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">
              {searchQuery || selectedStatus !== 'all' || selectedGenre !== 'all' ? '🔍' : '📚'}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || selectedStatus !== 'all' || selectedGenre !== 'all'
                ? 'No books match your search'
                : 'Your library is empty'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedStatus !== 'all' || selectedGenre !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Ready to start building your magical collection?'
              }
            </p>
            <MagicalButton onClick={() => window.location.href = '/discovery'}>
              {searchQuery || selectedStatus !== 'all' || selectedGenre !== 'all'
                ? 'Clear Filters'
                : 'Discover Books'
              }
            </MagicalButton>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item: LibraryItem) => (
              <BookCard
                key={item.id}
                title={item.book.title}
                author={item.book.author}
                coverUrl={item.book.cover_image_url}
                rating={item.user_rating}
                status={item.completion_status}
                progress={item.listening_progress?.percentage_complete}
                onAction={(action) => handleBookAction(action, item)}
              />
            ))}
          </div>
        )}

        {/* Book Details Modal */}
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          size="lg"
          variant="fairy"
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
                      {selectedBook.book.cover_image_url ? (
                        <img
                          src={selectedBook.book.cover_image_url}
                          alt={selectedBook.book.title}
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
                      <h2 className="text-2xl font-bold text-gray-900">{selectedBook.book.title}</h2>
                      <p className="text-lg text-gray-600">{selectedBook.book.author}</p>
                      {selectedBook.book.narrator && (
                        <p className="text-sm text-gray-500">Narrated by {selectedBook.book.narrator}</p>
                      )}
                    </div>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-2">
                      {selectedBook.book.genre.map(genre => (
                        <span
                          key={genre}
                          className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>

                    {/* Rating */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Your Rating</label>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => handleRatingChange(rating)}
                            className={cn(
                              "w-8 h-8 rounded-full transition-colors",
                              rating <= (selectedBook.user_rating || 0)
                                ? "text-yellow-400 hover:text-yellow-500"
                                : "text-gray-300 hover:text-yellow-300"
                            )}
                          >
                            ⭐
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Progress */}
                    {selectedBook.listening_progress && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Reading Progress</label>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Progress</span>
                            <span>{selectedBook.listening_progress.percentage_complete}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                              style={{ width: `${selectedBook.listening_progress.percentage_complete}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {selectedBook.completion_status === 'not_started' && (
                        <Button onClick={() => handleBookAction('continue', selectedBook)}>
                          Start Reading
                        </Button>
                      )}
                      {selectedBook.completion_status === 'in_progress' && (
                        <>
                          <Button onClick={() => handleBookAction('continue', selectedBook)}>
                            Continue Reading
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => handleBookAction('complete', selectedBook)}
                          >
                            Mark Complete
                          </Button>
                        </>
                      )}
                      <Button
                        variant="destructive"
                        onClick={() => handleBookAction('remove', selectedBook)}
                      >
                        Remove from Library
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Synopsis */}
                {selectedBook.book.synopsis && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Synopsis</label>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {selectedBook.book.synopsis}
                    </p>
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Your Notes</label>
                  <textarea
                    value={selectedBook.user_notes || ''}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Add your thoughts about this book..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none h-24 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default Library;