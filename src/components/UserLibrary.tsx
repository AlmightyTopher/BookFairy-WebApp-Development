import React, { useState, useEffect } from 'react';
import { BookFairy } from './BookFairy';
import { BookCard } from './BookCard';

interface UserLibraryProps {
  onViewBook: (book: any) => void;
  onBack: () => void;
}

export function UserLibrary({ onViewBook, onBack }: UserLibraryProps) {
  const [libraryBooks, setLibraryBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading user's library
    const loadLibrary = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user library - empty for new users
      setLibraryBooks([]);
      setIsLoading(false);
    };

    loadLibrary();
  }, []);

  const getFairyMessage = () => {
    if (isLoading) {
      return "Let me peek into your magical library, sugar...";
    }
    
    if (libraryBooks.length === 0) {
      return "Well honey, your library's lookin' a bit empty right now! Start searchin' for some delightful stories to fill it up!";
    }
    
    return `Look at this beautiful collection, darlin'! You've got ${libraryBooks.length} magical ${libraryBooks.length === 1 ? 'book' : 'books'} ready for listenin'!`;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button 
            onClick={onBack}
            className="mr-4 p-2 rounded-lg bg-white/20 hover:bg-white/30"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold">My Library</h1>
        </div>

        <div className="fairy-card p-6">
          <BookFairy 
            message={getFairyMessage()}
            mood="encouraging"
          />
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold">My Library</h1>
      </div>

      {/* Fairy Guide */}
      <div className="fairy-card p-6 mb-6">
        <BookFairy 
          message={getFairyMessage()}
          mood={libraryBooks.length === 0 ? "encouraging" : "playful"}
        />
      </div>

      {/* Library Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="fairy-card p-4 text-center">
          <div className="text-2xl font-bold">{libraryBooks.length}</div>
          <div className="text-sm opacity-70">Total Books</div>
        </div>
        <div className="fairy-card p-4 text-center">
          <div className="text-2xl font-bold">0h</div>
          <div className="text-sm opacity-70">Total Duration</div>
        </div>
      </div>

      {/* Library Books */}
      {libraryBooks.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Books</h2>
          
          <div className="grid gap-4">
            {libraryBooks.map(book => (
              <BookCard 
                key={book.id}
                book={book}
                onViewDetails={() => onViewBook(book)}
                showActions={false}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-30">📚</div>
          <p className="text-lg opacity-70 mb-4">Your library is waiting for its first book!</p>
          
          <div className="space-y-2">
            <button 
              onClick={() => {/* Navigate to search */}}
              className="fairy-button mx-2"
            >
              Browse Books ✨
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 text-center">
        <p className="text-sm opacity-70 mb-3">
          Books you download will appear here for easy access
        </p>
        
        <div className="flex gap-2 justify-center">
          <button className="text-sm px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30">
            Sort by Date
          </button>
          <button className="text-sm px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30">
            Sort by Author
          </button>
        </div>
      </div>
    </div>
  );
}