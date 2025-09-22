import React, { useState } from 'react';
import { BookFairy } from './BookFairy';

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

interface BookDetailsProps {
  book: Book;
  onBack: () => void;
}

export function BookDetails({ book, onBack }: BookDetailsProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    // Simulate download process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsDownloading(false);
    alert("Mmhmm, your audiobook's waitin' safe in the library, darlin'!");
  };

  const handleAddToWishlist = () => {
    setIsInWishlist(!isInWishlist);
  };

  const getFairyMessage = () => {
    if (isDownloading) {
      return "Hold your horses, sugar! I'm fetchin' that audiobook for ya right now...";
    }
    
    return `Well ain't this a fine choice! "${book.title}" is just waitin' to whisk you away on a magical journey. What would you like to do, darlin'?`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="mr-4 p-2 rounded-lg bg-white/20 hover:bg-white/30"
        >
          ←
        </button>
        <h1 className="text-xl font-bold">Book Details</h1>
      </div>

      {/* Book Cover & Info */}
      <div className="fairy-card p-6 mb-6">
        <div className="flex gap-6 mb-6">
          <img 
            src={book.cover || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&h=280&fit=crop'}
            alt={book.title}
            className="w-32 h-44 rounded-lg object-cover flex-shrink-0"
          />
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{book.title}</h2>
            <p className="text-lg opacity-80 mb-2">by {book.author}</p>
            
            {book.narrator && (
              <p className="text-sm opacity-70 mb-4">
                Narrated by {book.narrator}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              {book.genre && (
                <span className="px-3 py-1 bg-white/30 rounded-full text-sm">
                  {book.genre}
                </span>
              )}
              {book.duration && (
                <span className="px-3 py-1 bg-white/30 rounded-full text-sm">
                  {book.duration}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Synopsis */}
        {book.synopsis && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Synopsis</h3>
            <p className="text-sm leading-relaxed opacity-90">
              {book.synopsis}
            </p>
          </div>
        )}
      </div>

      {/* Fairy Guide */}
      <div className="fairy-card p-6 mb-6">
        <BookFairy 
          message={getFairyMessage()}
          mood={isDownloading ? "encouraging" : "playful"}
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button 
          onClick={handleDownload}
          disabled={isDownloading}
          className="fairy-button w-full text-lg py-4"
        >
          {isDownloading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="fairy-sparkle">📚</span>
              Downloading...
            </span>
          ) : (
            'Download Now ✨'
          )}
        </button>

        <button 
          onClick={handleAddToWishlist}
          className={`w-full py-3 rounded-lg border-2 transition-colors ${
            isInWishlist 
              ? 'bg-green-500 text-white border-green-500' 
              : 'bg-transparent border-white/30 hover:border-white/50'
          }`}
        >
          {isInWishlist ? '✓ In Wishlist' : 'Add to Wishlist'}
        </button>

        <button 
          onClick={onBack}
          className="w-full py-3 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
        >
          Back to Search
        </button>
      </div>

      {/* Additional Info */}
      <div className="mt-8 text-center text-xs opacity-50">
        <p>Book ID: {book.id}</p>
      </div>
    </div>
  );
}