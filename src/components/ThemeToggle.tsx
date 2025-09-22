import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'day' ? 'night' : 'day');
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        fixed top-6 right-6 z-50
        w-12 h-12 rounded-full
        flex items-center justify-center
        transition-all duration-300 transform hover:scale-110
        shadow-lg hover:shadow-xl
        ${theme === 'night' 
          ? 'bg-white/20 backdrop-blur-sm text-white border border-white/30' 
          : 'bg-black/20 backdrop-blur-sm text-white border border-white/30'
        }
      `}
      aria-label={`Switch to ${theme === 'day' ? 'night' : 'day'} mode`}
    >
      {theme === 'day' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
}