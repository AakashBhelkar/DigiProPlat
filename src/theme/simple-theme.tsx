import { useMemo, useState, useEffect, ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider as MuiThemeProvider, ThemeOptions } from '@mui/material/styles';

// ----------------------------------------------------------------------

// Custom color palette
const palette = {
  primary: {
    lighter: '#E0E7FF',
    light: '#A5B4FC',
    main: '#4F46E5',
    dark: '#3730A3',
    darker: '#1E1B4B',
    contrastText: '#FFFFFF',
  },
  secondary: {
    lighter: '#CFFAFE',
    light: '#67E8F9',
    main: '#06B6D4',
    dark: '#0E7490',
    darker: '#164E63',
    contrastText: '#FFFFFF',
  },
  info: {
    lighter: '#E0F2FE',
    light: '#7DD3FC',
    main: '#0EA5E9',
    dark: '#0369A1',
    darker: '#0C4A6E',
    contrastText: '#FFFFFF',
  },
  success: {
    lighter: '#D1FAE5',
    light: '#6EE7B7',
    main: '#10B981',
    dark: '#047857',
    darker: '#064E3B',
    contrastText: '#FFFFFF',
  },
  warning: {
    lighter: '#FEF3C7',
    light: '#FCD34D',
    main: '#F59E0B',
    dark: '#D97706',
    darker: '#92400E',
    contrastText: '#1C252E',
  },
  error: {
    lighter: '#FEE2E2',
    light: '#FCA5A5',
    main: '#EF4444',
    dark: '#DC2626',
    darker: '#991B1B',
    contrastText: '#FFFFFF',
  },
  grey: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
  },
};

// ----------------------------------------------------------------------

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme-mode');
    return (saved as 'light' | 'dark') || 'light';
  });

  const theme = useMemo(() => {
    const themeOptions: ThemeOptions = {
      palette: {
        mode,
        primary: palette.primary,
        secondary: palette.secondary,
        info: palette.info,
        success: palette.success,
        warning: palette.warning,
        error: palette.error,
        grey: palette.grey,
        ...(mode === 'light'
          ? {
              background: {
                default: '#FFFFFF',
                paper: '#FFFFFF',
              },
              text: {
                primary: palette.grey[900],
                secondary: palette.grey[600],
                disabled: palette.grey[500],
              },
            }
          : {
              background: {
                default: palette.grey[900],
                paper: palette.grey[800],
              },
              text: {
                primary: '#FFFFFF',
                secondary: palette.grey[400],
                disabled: palette.grey[600],
              },
            }),
      },
      typography: {
        fontFamily: '"Public Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        h1: {
          fontSize: '3rem',
          fontWeight: 700,
          lineHeight: 1.2,
        },
        h2: {
          fontSize: '2.5rem',
          fontWeight: 700,
          lineHeight: 1.3,
        },
        h3: {
          fontSize: '2rem',
          fontWeight: 600,
          lineHeight: 1.4,
        },
        h4: {
          fontSize: '1.5rem',
          fontWeight: 600,
          lineHeight: 1.5,
        },
        h5: {
          fontSize: '1.25rem',
          fontWeight: 600,
          lineHeight: 1.5,
        },
        h6: {
          fontSize: '1rem',
          fontWeight: 600,
          lineHeight: 1.6,
        },
        button: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
      shape: {
        borderRadius: 12,
      },
      shadows: [
        'none',
        '0px 2px 4px rgba(0, 0, 0, 0.05)',
        '0px 4px 8px rgba(0, 0, 0, 0.05)',
        '0px 8px 16px rgba(0, 0, 0, 0.05)',
        '0px 12px 24px rgba(0, 0, 0, 0.05)',
        '0px 16px 32px rgba(0, 0, 0, 0.05)',
        '0px 20px 40px rgba(0, 0, 0, 0.05)',
        '0px 24px 48px rgba(0, 0, 0, 0.05)',
        '0px 2px 4px rgba(0, 0, 0, 0.1)',
        '0px 4px 8px rgba(0, 0, 0, 0.1)',
        '0px 8px 16px rgba(0, 0, 0, 0.1)',
        '0px 12px 24px rgba(0, 0, 0, 0.1)',
        '0px 16px 32px rgba(0, 0, 0, 0.1)',
        '0px 20px 40px rgba(0, 0, 0, 0.1)',
        '0px 24px 48px rgba(0, 0, 0, 0.1)',
        '0px 28px 56px rgba(0, 0, 0, 0.1)',
        '0px 32px 64px rgba(0, 0, 0, 0.1)',
        '0px 36px 72px rgba(0, 0, 0, 0.1)',
        '0px 40px 80px rgba(0, 0, 0, 0.1)',
        '0px 44px 88px rgba(0, 0, 0, 0.1)',
        '0px 48px 96px rgba(0, 0, 0, 0.1)',
        '0px 52px 104px rgba(0, 0, 0, 0.1)',
        '0px 56px 112px rgba(0, 0, 0, 0.1)',
        '0px 60px 120px rgba(0, 0, 0, 0.1)',
        '0px 64px 128px rgba(0, 0, 0, 0.1)',
      ],
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              padding: '10px 20px',
              fontWeight: 600,
            },
            sizeLarge: {
              padding: '12px 28px',
              fontSize: '1rem',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 16,
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              fontWeight: 600,
            },
          },
        },
      },
    };

    return createTheme(themeOptions);
  }, [mode]);

  // Save mode to localStorage
  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  // Expose toggle function globally
  useEffect(() => {
    (window as any).toggleThemeMode = () => {
      setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
    };
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
