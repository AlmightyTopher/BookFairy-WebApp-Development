import React, { useState, useEffect } from 'react';
import { BookFairy } from './BookFairy';
import { BookCard } from './BookCard';

interface WishlistProps {
  onViewBook: (book: any) => void;
  onBack: () => void;
}

interface WishlistItem {
  id: string;
  book: any;
  addedDate: Date;
  status: 'waiting' | 'promoted' | 'expired';
  expiryDate: Date;
}

export function Wishlist({ onViewBook, onBack }: WishlistProps) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading user's wishlist
    const loadWishlist = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock wishlist - empty for new users
      setWishlistItems([]);
      setIsLoading(false);
    };

    loadWishlist();
  }, []);

  const retryExpiredRequest = (itemId: string) => {
    setWishlistItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              status: 'waiting', 
              expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
            }
          : item
      )
    );
  };

  const removeFromWishlist = (itemId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
  };

  const getFairyMessage = () => {
    if (isLoading) {
      return "Let me check what's on your wishlist, sugar...";
    }
    
    if (wishlistItems.length === 0) {
      return "Well honey, your wishlist is emptier than a Sunday church after dinner! Start searchin' for books and add 'em here - I'll keep track of everything for ya!";
    }
    
    const waitingCount = wishlistItems.filter(item => item.status === 'waiting').length;
    const expiredCount = wishlistItems.filter(item => item.status === 'expired').length;
    
    if (expiredCount > 0) {
      return `Sugar, you've got ${expiredCount} expired ${expiredCount === 1 ? 'request' : 'requests'} that need attention, and ${waitingCount} still waitin' in line!`;
    }
    
    return `You've got ${waitingCount} delightful ${waitingCount === 1 ? 'book' : 'books'} waitin' for their turn, darlin'! I'll let ya know when slots open up!`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-700 rounded-full text-xs">⏳ Waiting</span>;
      case 'promoted':
        return <span className="px-2 py-1 bg-green-500/20 text-green-700 rounded-full text-xs">✅ Promoted</span>;
      case 'expired':
        return <span className="px-2 py-1 bg-red-500/20 text-red-700 rounded-full text-xs">⚠️ Expired</span>;
      default:
        return null;
    }
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
          <h1 className="text-2xl font-bold">My Wishlist</h1>
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
        <h1 className="text-2xl font-bold">My Wishlist</h1>
      </div>

      {/* Fairy Guide */}
      <div className="fairy-card p-6 mb-6">
        <BookFairy 
          message={getFairyMessage()}
          mood={wishlistItems.some(item => item.status === 'expired') ? "sassy" : "playful"}
        />
      </div>

      {/* Wishlist Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="fairy-card p-4 text-center">
          <div className="text-xl font-bold">
            {wishlistItems.filter(item => item.status === 'waiting').length}
          </div>
          <div className="text-xs opacity-70">Waiting</div>
        </div>
        <div className="fairy-card p-4 text-center">
          <div className="text-xl font-bold">
            {wishlistItems.filter(item => item.status === 'promoted').length}
          </div>
          <div className="text-xs opacity-70">Promoted</div>
        </div>
        <div className="fairy-card p-4 text-center">
          <div className="text-xl font-bold">
            {wishlistItems.filter(item => item.status === 'expired').length}
          </div>
          <div className="text-xs opacity-70">Expired</div>
        </div>
      </div>

      {/* Wishlist Items */}
      {wishlistItems.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Wishlist Queue</h2>
          
          <div className="space-y-4">
            {wishlistItems.map(item => (
              <div key={item.id} className="book-card p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2">
                    {getStatusBadge(item.status)}
                  </div>
                  <div className="text-xs opacity-70">
                    Added {item.addedDate.toLocaleDateString()}
                  </div>
                </div>
                
                <BookCard 
                  book={item.book}
                  onViewDetails={() => onViewBook(item.book)}
                  showActions={false}
                />
                
                <div className="flex gap-2 mt-3">
                  {item.status === 'expired' && (
                    <button 
                      onClick={() => retryExpiredRequest(item.id)}
                      className="fairy-button text-sm flex-1"
                    >
                      Retry Request ✨
                    </button>
                  )}
                  
                  <button 
                    onClick={() => removeFromWishlist(item.id)}
                    className="text-sm px-4 py-2 bg-red-500/20 text-red-700 rounded-lg hover:bg-red-500/30"
                  >
                    Remove
                  </button>
                </div>

                {item.status === 'waiting' && (
                  <div className="mt-2 text-xs opacity-60">
                    Expires: {item.expiryDate.toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-30">📜</div>
          <p className="text-lg opacity-70 mb-4">Your wishlist is ready for magical stories!</p>
          
          <div className="space-y-2">
            <button 
              onClick={() => {/* Navigate to search */}}
              className="fairy-button mx-2"
            >
              Find Books to Add ✨
            </button>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 fairy-card p-4">
        <h3 className="font-semibold mb-2">How the Wishlist Works</h3>
        <ul className="text-sm space-y-1 opacity-80">
          <li>• Books you add wait in a queue for available slots</li>
          <li>• Requests auto-promote when download slots become free</li>
          <li>• Requests expire after 30 days if not fulfilled</li>
          <li>• You can retry expired requests anytime</li>
        </ul>
      </div>
    </div>
  );
}