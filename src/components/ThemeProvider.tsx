import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  theme: 'day' | 'night';
  setTheme: (theme: 'day' | 'night') => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'day' | 'night'>('day');

  useEffect(() => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('bookfairy_theme') as 'day' | 'night';
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Auto-detect system theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'night' : 'day');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'day' ? 'night' : 'day';
    setTheme(newTheme);
    localStorage.setItem('bookfairy_theme', newTheme);
  };

  // Apply theme class to document element for global CSS theming
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('day-theme', 'night-theme');
    root.classList.add(`${theme}-theme`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}