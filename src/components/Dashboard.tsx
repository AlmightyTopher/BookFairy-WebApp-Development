import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';
import { BookFairy } from './BookFairy';
import { SearchBooks } from './SearchBooks';
import { UserLibrary } from './UserLibrary';
import { Wishlist } from './Wishlist';
import { Settings } from './Settings';
import { BookDetails } from './BookDetails';

type DashboardView = 
  | 'home' 
  | 'search-author' 
  | 'search-title' 
  | 'browse-genre' 
  | 'recent' 
  | 'recommended' 
  | 'collections' 
  | 'wishlist' 
  | 'library' 
  | 'settings' 
  | 'notifications'
  | 'book-details';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [currentView, setCurrentView] = useState<DashboardView>('home');
  const [selectedBook, setSelectedBook] = useState<any>(null);

  const menuItems = [
    { id: 'search-author', icon: '🔍', label: 'Search by Author' },
    { id: 'search-title', icon: '📖', label: 'Search by Title' },
    { id: 'browse-genre', icon: '🏷️', label: 'Browse by Genre' },
    { id: 'recent', icon: '🎧', label: 'Recent / Popular' },
    { id: 'recommended', icon: '⭐', label: 'Recommended' },
    { id: 'collections', icon: '📂', label: 'Collections' },
    { id: 'wishlist', icon: '📜', label: 'My Wishlist' },
    { id: 'library', icon: '📚', label: 'My Library' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
    { id: 'notifications', icon: '🔔', label: 'Notifications' }
  ];

  const handleViewBook = (book: any) => {
    setSelectedBook(book);
    setCurrentView('book-details');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedBook(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'search-author':
      case 'search-title':
        return (
          <SearchBooks 
            searchType={currentView === 'search-author' ? 'author' : 'title'}
            onViewBook={handleViewBook}
            onBack={handleBackToHome}
          />
        );
      
      case 'wishlist':
        return (
          <Wishlist 
            onViewBook={handleViewBook}
            onBack={handleBackToHome}
          />
        );
      
      case 'library':
        return (
          <UserLibrary 
            onViewBook={handleViewBook}
            onBack={handleBackToHome}
          />
        );
      
      case 'settings':
        return (
          <Settings 
            onBack={handleBackToHome}
          />
        );
      
      case 'book-details':
        return (
          <BookDetails 
            book={selectedBook}
            onBack={() => setCurrentView('home')}
          />
        );
      
      case 'browse-genre':
      case 'recent':
      case 'recommended':
      case 'collections':
      case 'notifications':
        return (
          <div className="p-6">
            <div className="flex items-center mb-6">
              <button 
                onClick={handleBackToHome}
                className="mr-4 p-2 rounded-lg bg-white/20 hover:bg-white/30"
              >
                ←
              </button>
              <h1 className="text-2xl font-bold">
                {menuItems.find(item => item.id === currentView)?.label}
              </h1>
            </div>
            
            <div className="fairy-card p-6 text-center">
              <div className="fairy-sparkle mb-4">✨</div>
              <p className="text-lg mb-2">Coming Soon!</p>
              <p className="opacity-70">This section is still gettin' all prettied up! Check back soon for more magical features!</p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">Welcome back!</h1>
                <p className="text-sm opacity-70">{user?.email}</p>
              </div>
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30"
              >
                {theme === 'day' ? '🌙' : '☀️'}
              </button>
            </div>

            {/* Welcome Message */}
            <div className="fairy-card p-6 mb-6 text-center">
              <div className="fairy-sparkle mb-2">✨</div>
              <p className="text-lg">What magical story are we huntin' for today?</p>
            </div>

            {/* Menu Grid */}
            <div className="menu-grid">
              {menuItems.map(item => (
                <div
                  key={item.id}
                  className="menu-item"
                  onClick={() => setCurrentView(item.id as DashboardView)}
                >
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="text-sm font-medium">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="fairy-card p-4 text-center">
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm opacity-70">Books in Library</div>
              </div>
              <div className="fairy-card p-4 text-center">
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm opacity-70">Wishlist Items</div>
              </div>
            </div>

            {/* Sign Out */}
            <div className="text-center mt-8">
              <button 
                onClick={signOut}
                className="text-sm opacity-50 hover:opacity-70"
              >
                Sign out
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'night' ? 'night-theme' : 'day-theme'}`}>

      
      {renderCurrentView()}
    </div>
  );
}