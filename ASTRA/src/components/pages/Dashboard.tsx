/**
 * Dashboard Page Component
 *
 * Main dashboard view showing user's reading overview, quick actions,
 * recommendations, and recent activity with fairy-themed design
 */

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/hooks/useAuth';
import { useLibrary } from '@/hooks/useLibrary';
import { useWishlist } from '@/hooks/useWishlist';
import { useBookDiscovery } from '@/hooks/useBookDiscovery';
import { useNotifications } from '@/hooks/useNotifications';
import { useFairyContext } from '@/components/fairy';
import { Card, CardHeader, CardContent, CardTitle, BookCard } from '@/components/ui/Card';
import { Button, MagicalButton } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { Book, LibraryItem, WishlistItem } from '@/types';

export interface DashboardProps {
  className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ className }) => {
  const { user } = useAuthContext();
  const { celebrateAction } = useFairyContext();

  const {
    items: libraryItems,
    stats: libraryStats,
    isLoading: libraryLoading,
    currentlyReading,
    recentlyCompleted
  } = useLibrary() as any;

  const {
    items: wishlistItems,
    queueInfo,
    activeItems: activeWishlistItems
  } = useWishlist() as any;

  const {
    trendingBooks,
    recommendations,
    isLoading: discoveryLoading
  } = useBookDiscovery() as any;

  const {
    unreadCount,
    recentNotifications
  } = useNotifications() as any;

  const [timeOfDay, setTimeOfDay] = useState<string>('');

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 18) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
  }, []);

  const getGreeting = () => {
    const greetings = {
      morning: `Good morning, ${user?.name || 'reader'}! ☀️`,
      afternoon: `Good afternoon, ${user?.name || 'reader'}! 🌤️`,
      evening: `Good evening, ${user?.name || 'reader'}! 🌙`
    };
    return greetings[timeOfDay as keyof typeof greetings] || `Hello, ${user?.name || 'reader'}! 👋`;
  };

  const handleBookAction = (action: string, book: Book) => {
    switch (action) {
      case 'view':
        // Navigate to book details
        window.location.href = `/book/${book.id}`;
        break;
      case 'add':
        celebrateAction('book_added', { title: book.title });
        break;
      case 'continue':
        celebrateAction('reading_continued', { title: book.title });
        break;
    }
  };

  const quickActions = [
    {
      title: 'Discover Books',
      description: 'Find your next great read',
      icon: '🔍',
      href: '/discovery',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'My Library',
      description: `${libraryStats.total_books} books in your collection`,
      icon: '📚',
      href: '/library',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      title: 'Wishlist',
      description: `${queueInfo.total_items} books waiting`,
      icon: '⭐',
      href: '/wishlist',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      title: 'Reading Stats',
      description: 'Track your progress',
      icon: '📊',
      href: '/stats',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50", className)}>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            {getGreeting()}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Welcome to your magical reading dashboard! ✨ Ready for another amazing day of literary adventures?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="magical" className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600">{libraryStats.total_books}</div>
              <div className="text-sm text-gray-600 mt-1">Books in Library</div>
            </CardContent>
          </Card>

          <Card variant="magical" className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600">{libraryStats.completed_books}</div>
              <div className="text-sm text-gray-600 mt-1">Books Completed</div>
            </CardContent>
          </Card>

          <Card variant="magical" className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-pink-600">{libraryStats.reading_streak_days}</div>
              <div className="text-sm text-gray-600 mt-1">Day Reading Streak</div>
            </CardContent>
          </Card>

          <Card variant="magical" className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600">{Math.floor(libraryStats.total_listening_time / 60)}h</div>
              <div className="text-sm text-gray-600 mt-1">Total Reading Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Card
              key={action.title}
              variant="elevated"
              interactive
              className="group cursor-pointer"
              onClick={() => window.location.href = action.href}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "w-12 h-12 rounded-lg bg-gradient-to-r flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-200",
                    action.gradient
                  )}>
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Currently Reading */}
          <div className="lg:col-span-2 space-y-6">
            <Card variant="fairy">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span>📖</span>
                    <span>Currently Reading</span>
                  </span>
                  {currentlyReading?.length > 0 && (
                    <Button variant="outline" size="sm" onClick={() => window.location.href = '/library'}>
                      View All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {libraryLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-32"></div>
                      </div>
                    ))}
                  </div>
                ) : currentlyReading?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentlyReading.slice(0, 4).map((item: LibraryItem) => (
                      <BookCard
                        key={item.id}
                        title={item.book.title}
                        author={item.book.author}
                        coverUrl={item.book.cover_image_url}
                        status="reading"
                        progress={item.listening_progress?.percentage_complete}
                        onAction={(action) => handleBookAction(action, item.book)}
                        compact
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No books in progress</h3>
                    <p className="text-gray-600 mb-4">Ready to start your next reading adventure?</p>
                    <MagicalButton onClick={() => window.location.href = '/discovery'}>
                      Discover Books
                    </MagicalButton>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Completions */}
            {recentlyCompleted?.length > 0 && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>🎉</span>
                    <span>Recently Completed</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentlyCompleted.slice(0, 3).map((item: LibraryItem) => (
                      <div key={item.id} className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                        <div className="w-12 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-md flex items-center justify-center">
                          {item.book.cover_image_url ? (
                            <img
                              src={item.book.cover_image_url}
                              alt={item.book.title}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <span className="text-green-600">📚</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.book.title}</h4>
                          <p className="text-sm text-gray-600">{item.book.author}</p>
                          {item.user_rating && (
                            <div className="flex items-center mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={cn(
                                    "text-sm",
                                    star <= item.user_rating! ? "text-yellow-400" : "text-gray-300"
                                  )}
                                >
                                  ⭐
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBookAction('view', item.book)}
                        >
                          Details
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Wishlist */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span>⭐</span>
                    <span>Next to Read</span>
                  </span>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = '/wishlist'}>
                    Manage
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeWishlistItems?.length > 0 ? (
                  <div className="space-y-3">
                    {activeWishlistItems.slice(0, 3).map((item: WishlistItem) => (
                      <div key={item.id} className="flex items-center space-x-3 p-2 hover:bg-purple-50 rounded-lg transition-colors">
                        <div className="w-8 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded flex items-center justify-center text-xs">
                          {item.priority}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">{item.book.title}</h4>
                          <p className="text-xs text-gray-600 truncate">{item.book.author}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-3xl mb-2">💭</div>
                    <p className="text-sm text-gray-600">Your wishlist is empty</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.href = '/discovery'}>
                      Find Books
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card variant="magical">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>✨</span>
                  <span>Fairy Picks</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {discoveryLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex space-x-3">
                        <div className="w-8 h-10 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-1">
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recommendations?.length > 0 ? (
                  <div className="space-y-3">
                    {recommendations.slice(0, 3).map((book: Book) => (
                      <div
                        key={book.id}
                        className="flex items-center space-x-3 p-2 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                        onClick={() => handleBookAction('view', book)}
                      >
                        <div className="w-8 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded flex items-center justify-center">
                          {book.cover_image_url ? (
                            <img
                              src={book.cover_image_url}
                              alt={book.title}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <span className="text-purple-600 text-xs">📖</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">{book.title}</h4>
                          <p className="text-xs text-gray-600 truncate">{book.author}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-3xl mb-2">🔮</div>
                    <p className="text-sm text-gray-600 mb-2">Building recommendations...</p>
                    <p className="text-xs text-gray-500">Read a few books to get personalized picks!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notifications */}
            {unreadCount > 0 && (
              <Card variant="outline">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <span>🔔</span>
                      <span>Notifications</span>
                    </span>
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentNotifications?.slice(0, 3).map((notification: any) => (
                      <div key={notification.id} className="p-2 bg-blue-50 rounded text-sm">
                        <p className="font-medium text-blue-900">{notification.title}</p>
                        <p className="text-blue-700 text-xs">{notification.fairy_message}</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => window.location.href = '/notifications'}>
                    View All
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;