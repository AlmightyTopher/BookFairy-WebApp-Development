/**
 * Header Navigation Component
 *
 * Main header with navigation, user menu, and fairy integration
 */

import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFairy } from '../../hooks/useFairy';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

// Navigation items configuration
const navigationItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/library', label: 'Library', icon: '📚' },
  { path: '/wishlist', label: 'Wishlist', icon: '⭐' },
  { path: '/discovery', label: 'Discovery', icon: '🔍' }
];

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
  const { user, logout } = useAuth();
  const { celebrateAction } = useFairy();
  const location = useLocation();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
      celebrateAction('logout', 'Safe travels! Come back soon! ✨');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigate = (path: string, label: string) => {
    navigate(path);
    celebrateAction('navigation', `Welcome to ${label}! 🧚‍♀️`);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-purple-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60",
      "dark:border-purple-800 dark:bg-slate-950/95 dark:supports-[backdrop-filter]:bg-slate-950/60",
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2">
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              onClick={() => celebrateAction('home', 'Welcome home! 🏠✨')}
            >
              <span className="text-2xl">🧚‍♀️</span>
              <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                BookFairy
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                variant={isActivePath(item.path) ? 'fairy' : 'ghost'}
                size="sm"
                onClick={() => handleNavigate(item.path, item.label)}
                className="flex items-center space-x-2"
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Button>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <span className="text-xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
            </Button>

            {/* User Profile */}
            <div className="relative" ref={userMenuRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2"
                aria-label="User menu"
              >
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-purple-300"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                    {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || '?'}
                  </div>
                )}
                <span className="hidden sm:inline text-sm">
                  {user?.user_metadata?.full_name || 'User'}
                </span>
              </Button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-purple-200 dark:border-purple-700 py-1 z-50">
                  <div className="px-4 py-2 border-b border-purple-100 dark:border-purple-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      handleNavigate('/onboarding', 'Onboarding');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/50 transition-colors"
                  >
                    🧚‍♀️ Onboarding
                  </button>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/50 transition-colors"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-purple-200 dark:border-purple-800 py-4">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActivePath(item.path) ? 'fairy' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavigate(item.path, item.label)}
                  className="flex items-center justify-start space-x-3 w-full"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;