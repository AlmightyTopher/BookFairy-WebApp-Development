/**
 * Sidebar Navigation Component
 *
 * Collapsible sidebar with navigation and fairy integration
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFairy } from '../../hooks/useFairy';
import { useLibrary } from '../../hooks/useLibrary';
import { useWishlist } from '../../hooks/useWishlist';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

// Navigation sections configuration
const navigationSections = [
  {
    title: 'Main',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: '🏠', description: 'Your reading overview' },
      { path: '/library', label: 'Library', icon: '📚', description: 'Your book collection' },
      { path: '/wishlist', label: 'Wishlist', icon: '⭐', description: 'Books you want to read' },
      { path: '/discovery', label: 'Discovery', icon: '🔍', description: 'Find new books' }
    ]
  }
];

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = true,
  onToggle,
  className
}) => {
  const { user } = useAuth();
  const { celebrateAction } = useFairy();
  const { stats: libraryStats, loading: libraryLoading } = useLibrary();
  const { items: wishlistItems, loading: wishlistLoading } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(!isOpen);

  // Persist sidebar state
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    onToggle?.();
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigate = (path: string, label: string) => {
    navigate(path);
    celebrateAction('navigation', `Opening ${label}! ✨`);
  };

  const getItemBadge = (path: string) => {
    switch (path) {
      case '/library':
        if (!libraryLoading && libraryStats?.inProgress) {
          return libraryStats.inProgress > 0 ? libraryStats.inProgress : null;
        }
        break;
      case '/wishlist':
        if (!wishlistLoading && wishlistItems) {
          return wishlistItems.length > 0 ? wishlistItems.length : null;
        }
        break;
      default:
        return null;
    }
    return null;
  };

  return (
    <aside className={cn(
      "flex-shrink-0 border-r border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-950 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      "hidden lg:flex lg:flex-col",
      className
    )}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-200 dark:border-purple-800">
        {!isCollapsed && (
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            onClick={() => celebrateAction('home', 'Welcome home! 🏠✨')}
          >
            <span className="text-xl">🧚‍♀️</span>
            <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              BookFairy
            </span>
          </Link>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="p-2"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="text-lg">{isCollapsed ? '→' : '←'}</span>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6">
        {navigationSections.map((section) => (
          <div key={section.title}>
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
            )}

            <ul className="space-y-2">
              {section.items.map((item) => {
                const isActive = isActivePath(item.path);
                const badge = getItemBadge(item.path);

                return (
                  <li key={item.path}>
                    <Button
                      variant={isActive ? 'fairy' : 'ghost'}
                      size="sm"
                      onClick={() => handleNavigate(item.path, item.label)}
                      className={cn(
                        "w-full justify-start transition-all duration-200",
                        isCollapsed ? "px-3" : "px-3",
                        isActive && "shadow-lg shadow-purple-200/50 dark:shadow-purple-800/50"
                      )}
                      title={isCollapsed ? `${item.label} - ${item.description}` : undefined}
                    >
                      <span className="text-lg">{item.icon}</span>

                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {badge && (
                            <span className="ml-2 px-2 py-1 text-xs bg-purple-500 text-white rounded-full min-w-[20px] text-center">
                              {badge}
                            </span>
                          )}
                        </>
                      )}

                      {isCollapsed && badge && (
                        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-purple-500 text-white rounded-full min-w-[16px] text-center">
                          {badge}
                        </span>
                      )}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-t border-purple-200 dark:border-purple-800">
          <div className="flex items-center space-x-3">
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-purple-300"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || '?'}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fairy Corner */}
      {!isCollapsed && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
          <div className="text-center">
            <div className="text-2xl mb-2">🧚‍♀️</div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Your magical reading companion
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;