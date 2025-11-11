import { useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as CssVarsProvider } from '@mui/material/styles';

import { useSettingsContext } from 'src/components/settings';

import { createTheme } from './create-theme';
import { RTL } from './with-settings/right-to-left';
import { schemeConfig } from './color-scheme-script';

// ----------------------------------------------------------------------

export function ThemeProvider({ children }) {
  const settings = useSettingsContext();

  // Force light mode - override any settings
  const lightModeSettings = {
    ...settings,
    colorScheme: 'light', // Always use light mode
  };

  const theme = createTheme(lightModeSettings);

  // Force light mode - clear any dark mode from localStorage and DOM
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Force light mode in localStorage
      localStorage.setItem(schemeConfig.modeStorageKey, 'light');
      
      // Force light mode on document
      document.documentElement.setAttribute('data-mui-color-scheme', 'light');
      document.documentElement.style.colorScheme = 'light';
      
      // Force white background on body and root
      document.body.style.backgroundColor = '#FFFFFF';
      const root = document.getElementById('root');
      if (root) {
        root.style.backgroundColor = '#FFFFFF';
      }
      
      // Monitor and prevent dark mode changes
      const observer = new MutationObserver(() => {
        if (document.documentElement.getAttribute('data-mui-color-scheme') !== 'light') {
          document.documentElement.setAttribute('data-mui-color-scheme', 'light');
          localStorage.setItem(schemeConfig.modeStorageKey, 'light');
        }
        // Ensure body and root always have white background
        document.body.style.backgroundColor = '#FFFFFF';
        const rootEl = document.getElementById('root');
        if (rootEl) {
          rootEl.style.backgroundColor = '#FFFFFF';
        }
      });
      
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-mui-color-scheme']
      });
      
      return () => observer.disconnect();
    }
  }, []);

  return (
    <CssVarsProvider
      theme={theme}
      defaultMode="light" // Force light mode as default for everyone
      modeStorageKey={schemeConfig.modeStorageKey}
      disableTransitionOnChange={false}
      attribute="data-mui-color-scheme"
      // Disable system preference detection - we control mode via data attribute
      enableColorScheme={false}
    >
      <CssBaseline />
      <RTL direction={lightModeSettings.direction}>{children}</RTL>
    </CssVarsProvider>
  );
}
