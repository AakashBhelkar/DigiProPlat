import { useMemo, useState, useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';
import { createTheme } from './create-theme';

// ----------------------------------------------------------------------

// Simple settings for theme
const defaultSettings = {
  colorScheme: 'light',
  direction: 'ltr',
  fontFamily: 'Public Sans',
};

export function ThemeProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('theme-settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const theme = useMemo(() => createTheme(settings), [settings]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('theme-settings', JSON.stringify(settings));
  }, [settings]);

  // Expose settings API
  const toggleMode = () => {
    setSettings(prev => ({
      ...prev,
      colorScheme: prev.colorScheme === 'light' ? 'dark' : 'light',
    }));
  };

  // Make settings available globally
  useEffect(() => {
    window.toggleThemeMode = toggleMode;
  }, []);

  return (
    <CssVarsProvider
      theme={theme}
      defaultMode={settings.colorScheme}
      modeStorageKey="digiproplat-color-scheme"
    >
      <CssBaseline />
      {children}
    </CssVarsProvider>
  );
}
