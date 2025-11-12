import { useEffect, useMemo } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as CssVarsProvider } from '@mui/material/styles';

import { useSettingsContext } from 'src/components/settings';

import { createTheme } from './create-theme';
import { RTL } from './with-settings/right-to-left';
import { schemeConfig } from './color-scheme-script';
import PRIMARY_COLOR from './with-settings/primary-color.json';
import COLORS from './core/colors.json';

// ----------------------------------------------------------------------

export function ThemeProvider({ children }) {
  const settings = useSettingsContext();

  // Force light mode with custom color scheme
  const lightModeSettings = useMemo(() => ({
    ...settings,
    colorScheme: 'light', // Always use light mode
    // Ensure defaults are set
    contrast: settings.contrast || 'default',
    primaryColor: settings.primaryColor || 'default',
    navLayout: settings.navLayout || 'horizontal',
    navColor: settings.navColor || 'integrate',
    direction: settings.direction || 'ltr',
    compactLayout: settings.compactLayout ?? true,
    fontFamily: settings.fontFamily || 'Public Sans',
  }), [settings]);

  // Create theme with current settings (contrast, primaryColor, etc.)
  // Theme will be recreated when settings change
  const theme = useMemo(() => createTheme(lightModeSettings), [lightModeSettings]);

  // Get primary color based on settings
  const primaryColorValue = useMemo(() => {
    const PRIMARY_COLORS = {
      default: COLORS.primary.main,
      cyan: PRIMARY_COLOR.cyan.main,
      purple: PRIMARY_COLOR.purple.main,
      blue: PRIMARY_COLOR.blue.main,
      orange: PRIMARY_COLOR.orange.main,
      red: PRIMARY_COLOR.red.main,
    };
    return PRIMARY_COLORS[lightModeSettings.primaryColor] || COLORS.primary.main;
  }, [lightModeSettings.primaryColor]);

  // Get background color based on contrast setting
  const backgroundColor = useMemo(() => {
    return lightModeSettings.contrast === 'hight' ? '#E4E4E7' : '#FFFFFF';
  }, [lightModeSettings.contrast]);

  // Force light mode - set custom CSS variables and ensure light mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Set light mode in localStorage
      localStorage.setItem(schemeConfig.modeStorageKey, 'light');
      
      // Set light mode on document with custom CSS variables
      if (document.documentElement) {
        document.documentElement.setAttribute('data-mui-color-scheme', 'light');
        document.documentElement.style.colorScheme = 'light';
        
        // Set custom CSS variables for the color scheme based on settings
        document.documentElement.style.setProperty('--color-primary', primaryColorValue);
        document.documentElement.style.setProperty('--color-secondary', '#10b981');
        document.documentElement.style.setProperty('--color-accent', '#f59e42');
        document.documentElement.style.setProperty('--color-background', backgroundColor);
        document.documentElement.style.setProperty('--color-text', '#134e4a');
        document.documentElement.style.setProperty('--color-success', '#10b981');
        document.documentElement.style.setProperty('--color-warning', '#facc15');
        document.documentElement.style.setProperty('--color-error', '#ef4444');
        document.documentElement.style.setProperty('--button-color', primaryColorValue);
        document.documentElement.style.setProperty('--button-hover-color', primaryColorValue);
        document.documentElement.style.setProperty('--global-background', backgroundColor);
        document.documentElement.style.setProperty('--global-text', '#134e4a');
      }
      
      // Set light background on body and root based on contrast
      if (document.body) {
        document.body.style.backgroundColor = backgroundColor;
      }
      const root = document.getElementById('root');
      if (root) {
        root.style.backgroundColor = backgroundColor;
      }
      
      // Monitor and prevent dark mode changes
      const observer = new MutationObserver(() => {
        if (document.documentElement && document.documentElement.getAttribute('data-mui-color-scheme') !== 'light') {
          document.documentElement.setAttribute('data-mui-color-scheme', 'light');
          localStorage.setItem(schemeConfig.modeStorageKey, 'light');
        }
        // Ensure body and root always have correct background based on contrast
        if (document.body) {
          document.body.style.backgroundColor = backgroundColor;
        }
        const rootEl = document.getElementById('root');
        if (rootEl) {
          rootEl.style.backgroundColor = backgroundColor;
        }
      });
      
      if (document.documentElement) {
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['data-mui-color-scheme']
        });
      }
      
      return () => observer.disconnect();
    }
  }, [primaryColorValue, backgroundColor]);

  return (
    <CssVarsProvider
      theme={theme}
      defaultMode="light" // Force light mode as default
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
