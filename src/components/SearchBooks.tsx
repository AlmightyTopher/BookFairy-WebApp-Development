import React, { useState } from 'react';
import { BookFairy } from './BookFairy';
import { BookCard } from './BookCard';

interface SearchBooksProps {
  searchType: 'author' | 'title';
  onViewBook: (book: any) => void;
  onBack: () => void;
}

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

export function SearchBooks({ searchType, onViewBook, onBack }: SearchBooksProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock search results
    const mockResults: Book[] = [
      {
        id: '1',
        title: 'The Seven Husbands of Evelyn Hugo',
        author: 'Taylor Jenkins Reid',
        narrator: 'Alma Cuervo, Julia Whelan',
        cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop',
        synopsis: 'Reclusive Hollywood icon Evelyn Hugo finally decides to tell her life story—but only to unknown journalist Monique Grant.',
        duration: '12h 10m',
        genre: 'Historical Fiction'
      },
      {
        id: '2',
        title: 'Where the Crawdads Sing',
        author: 'Delia Owens',
        narrator: 'Cassandra Campbell',
        cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
        synopsis: 'For years, rumors of the "Marsh Girl" have haunted Barkley Cove, a quiet town on the North Carolina coast.',
        duration: '12h 12m',
        genre: 'Mystery'
      },
      {
        id: '3',
        title: 'Educated',
        author: 'Tara Westover',
        narrator: 'Julia Whelan',
        cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
        synopsis: 'A memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge.',
        duration: '12h 10m',
        genre: 'Memoir'
      }
    ];

    // Filter results based on search type
    const filteredResults = mockResults.filter(book => {
      const query = searchQuery.toLowerCase();
      if (searchType === 'author') {
        return book.author.toLowerCase().includes(query);
      } else {
        return book.title.toLowerCase().includes(query);
      }
    });

    setResults(filteredResults);
    setIsSearching(false);
  };

  const getFairyMessage = () => {
    if (isSearching) {
      return "Hold on sugar, I'm diggin' through all my magical books for ya...";
    }
    
    if (hasSearched && results.length === 0) {
      return `Well honey, I couldn't find any books matchin' that ${searchType}. Maybe try a different spelling or check if I heard ya right?`;
    }
    
    if (hasSearched && results.length > 0) {
      return `Well looky here! I found ${results.length} delightful ${results.length === 1 ? 'book' : 'books'} for ya, darlin'!`;
    }
    
    return `Alright sugar, what ${searchType} are we huntin' for today? Just type it in and I'll work my magic!`;
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
        <h1 className="text-2xl font-bold">
          Search by {searchType === 'author' ? 'Author' : 'Title'}
        </h1>
      </div>

      {/* Fairy Guide */}
      <div className="fairy-card p-6 mb-6">
        <BookFairy 
          message={getFairyMessage()}
          mood={isSearching ? "encouraging" : hasSearched && results.length === 0 ? "sassy" : "playful"}
        />
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={`Enter ${searchType} name...`}
            className="flex-1 p-3 rounded-lg border border-gray-300 bg-white/80"
            disabled={isSearching}
          />
          <button 
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="fairy-button px-6"
          >
            {isSearching ? '🔍' : 'Search ✨'}
          </button>
        </div>
      </div>

      {/* Search Results */}
      {isSearching && (
        <div className="text-center py-8">
          <div className="fairy-sparkle text-4xl mb-4">🔍</div>
          <p>Searching through the magical library...</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Found {results.length} {results.length === 1 ? 'book' : 'books'}
          </h2>
          
          <div className="grid gap-4">
            {results.map(book => (
              <BookCard 
                key={book.id}
                book={book}
                onViewDetails={() => onViewBook(book)}
              />
            ))}
          </div>
        </div>
      )}

      {hasSearched && results.length === 0 && !isSearching && (
        <div className="text-center py-8 opacity-50">
          <div className="text-4xl mb-4">📚</div>
          <p>No books found. Try a different search term!</p>
        </div>
      )}
    </div>
  );
}