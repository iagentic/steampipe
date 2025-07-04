'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('steampipe-theme') as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    // Update theme when it changes
    const linkElement = document.getElementById('theme-link') as HTMLLinkElement;
    
    if (linkElement) {
      // Remove existing theme link
      linkElement.remove();
    }

    // Create new theme link
    const newLink = document.createElement('link');
    newLink.id = 'theme-link';
    newLink.rel = 'stylesheet';
    newLink.href = theme === 'dark' 
      ? 'https://cdn.jsdelivr.net/npm/primereact@10.5.3/resources/themes/lara-dark-blue/theme.css'
      : 'https://cdn.jsdelivr.net/npm/primereact@10.5.3/resources/themes/lara-light-blue/theme.css';
    
    document.head.appendChild(newLink);

    // Save theme to localStorage
    localStorage.setItem('steampipe-theme', theme);

    // Update body class for custom styling
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
} 