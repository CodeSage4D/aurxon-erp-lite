'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { updateThemePreferenceApi } from '@/services/api';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  syncUserTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark'); // AURXON default on load

  const applyTheme = (targetTheme: Theme) => {
    const root = document.documentElement;
    let isDark = false;

    if (targetTheme === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = targetTheme === 'dark';
    }

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  useEffect(() => {
    // Resolve theme priority: Database -> User Local Storage -> System -> Default 'dark'
    const cachedUser = localStorage.getItem('aurxon_user');
    let dbTheme: Theme | null = null;
    if (cachedUser) {
      try {
        const userObj = JSON.parse(cachedUser);
        if (userObj.themePreference) {
          dbTheme = userObj.themePreference as Theme;
        }
      } catch (e) {
        // Safe fallback
      }
    }

    const localTheme = localStorage.getItem('aurxon_theme') as Theme | null;
    const resolvedTheme = dbTheme || localTheme || 'system';

    setThemeState(resolvedTheme);
    applyTheme(resolvedTheme);

    // Listen for system changes if set to system
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (resolvedTheme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('aurxon_theme', newTheme);

    // Sync database if user is logged in
    const cachedUser = localStorage.getItem('aurxon_user');
    if (cachedUser) {
      try {
        const userObj = JSON.parse(cachedUser);
        userObj.themePreference = newTheme;
        localStorage.setItem('aurxon_user', JSON.stringify(userObj));
        // Async API call to save theme preference in DB
        await updateThemePreferenceApi(newTheme);
      } catch (e) {
        console.warn('Failed to sync theme preference with backend database:', e);
      }
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const syncUserTheme = (dbTheme: Theme) => {
    if (dbTheme && ['light', 'dark', 'system'].includes(dbTheme)) {
      setThemeState(dbTheme);
      applyTheme(dbTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, syncUserTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
