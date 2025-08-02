import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const themes = {
  default: {
    name: 'Default',
    description: 'Clean and professional',
    colors: {
      primary: 'bg-blue-600',
      primaryHover: 'hover:bg-blue-700',
      secondary: 'bg-gray-100',
      accent: 'bg-teal-500',
      background: 'bg-white',
      surface: 'bg-gray-50',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      border: 'border-gray-200'
    },
    gradient: 'from-teal-600 to-blue-600'
  },
  dark: {
    name: 'Dark Mode',
    description: 'Easy on the eyes',
    colors: {
      primary: 'bg-blue-500',
      primaryHover: 'hover:bg-blue-600',
      secondary: 'bg-gray-800',
      accent: 'bg-purple-500',
      background: 'bg-gray-900',
      surface: 'bg-gray-800',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      border: 'border-gray-700'
    },
    gradient: 'from-purple-600 to-blue-600'
  },
  gaming: {
    name: 'Gaming',
    description: 'For the tech-savvy learner',
    colors: {
      primary: 'bg-green-500',
      primaryHover: 'hover:bg-green-600',
      secondary: 'bg-gray-800',
      accent: 'bg-cyan-400',
      background: 'bg-gray-900',
      surface: 'bg-gray-800',
      text: 'text-green-400',
      textSecondary: 'text-gray-300',
      border: 'border-green-500'
    },
    gradient: 'from-green-500 to-cyan-400'
  },
  sports: {
    name: 'Sports',
    description: 'Athletic and energetic',
    colors: {
      primary: 'bg-orange-500',
      primaryHover: 'hover:bg-orange-600',
      secondary: 'bg-orange-100',
      accent: 'bg-red-500',
      background: 'bg-white',
      surface: 'bg-orange-50',
      text: 'text-gray-900',
      textSecondary: 'text-gray-700',
      border: 'border-orange-200'
    },
    gradient: 'from-orange-500 to-red-500'
  },
  nature: {
    name: 'Nature',
    description: 'Calm and natural',
    colors: {
      primary: 'bg-green-600',
      primaryHover: 'hover:bg-green-700',
      secondary: 'bg-green-100',
      accent: 'bg-yellow-500',
      background: 'bg-white',
      surface: 'bg-green-50',
      text: 'text-gray-900',
      textSecondary: 'text-gray-700',
      border: 'border-green-200'
    },
    gradient: 'from-green-600 to-yellow-500'
  },
  ocean: {
    name: 'Ocean',
    description: 'Deep and calming',
    colors: {
      primary: 'bg-blue-700',
      primaryHover: 'hover:bg-blue-800',
      secondary: 'bg-blue-100',
      accent: 'bg-cyan-500',
      background: 'bg-white',
      surface: 'bg-blue-50',
      text: 'text-gray-900',
      textSecondary: 'text-gray-700',
      border: 'border-blue-200'
    },
    gradient: 'from-blue-700 to-cyan-500'
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('default');

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('studyverse-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    const theme = themes[currentTheme];
    const root = document.documentElement;
    
    // Remove all theme classes
    Object.values(themes).forEach(t => {
      Object.values(t.colors).forEach(colorClass => {
        const className = colorClass.replace(/^(bg-|text-|border-|hover:bg-)/, '');
        root.classList.remove(`theme-${className}`);
      });
    });
    
    // Add current theme classes
    Object.entries(theme.colors).forEach(([key, colorClass]) => {
      const className = colorClass.replace(/^(bg-|text-|border-|hover:bg-)/, '');
      root.classList.add(`theme-${className}`);
    });
    
    // Save to localStorage
    localStorage.setItem('studyverse-theme', currentTheme);
  }, [currentTheme]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const getThemeClasses = () => {
    return themes[currentTheme];
  };

  const value = {
    currentTheme,
    changeTheme,
    getThemeClasses,
    availableThemes: themes
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

