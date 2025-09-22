import React from 'react';

interface Book {
  id: string;
  title: string;
  author: string;
  narrator?: string;
  cover?: string;
  synopsis?: string;
  duration?: string;
  genre?: string;
}

interface BookCardProps {
  book: Book;
  onViewDetails: () => void;
  showActions?: boolean;
}

export function BookCard({ book, onViewDetails, showActions = true }: BookCardProps) {
  const truncateSynopsis = (text: string, maxLength: number = 500) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="book-card p-4">
      <div className="flex gap-4">
        {/* Book Cover */}
        <div className="flex-shrink-0">
          <img 
            src={book.cover || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=120&h=160&fit=crop'}
            alt={book.title}
            className="w-20 h-28 rounded-lg object-cover"
          />
        </div>

        {/* Book Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg leading-tight mb-1">
            {book.title}
          </h3>
          
          <p className="text-sm opacity-70 mb-2">
            by {book.author}
          </p>

          {book.narrator && (
            <p className="text-xs opacity-60 mb-2">
              Narrated by {book.narrator}
            </p>
          )}

          {book.synopsis && (
            <p className="text-sm opacity-80 leading-relaxed mb-3">
              {truncateSynopsis(book.synopsis)}
            </p>
          )}

          <div className="flex flex-wrap gap-2 text-xs">
            {book.genre && (
              <span className="px-2 py-1 bg-white/30 rounded-full">
                {book.genre}
              </span>
            )}
            {book.duration && (
              <span className="px-2 py-1 bg-white/30 rounded-full">
                {book.duration}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 mt-4">
          <button 
            onClick={onViewDetails}
            className="fairy-button flex-1 text-sm"
          >
            View Details
          </button>
          <button className="fairy-button flex-1 text-sm">
            Add to Wishlist
          </button>
        </div>
      )}
    </div>
  );
}