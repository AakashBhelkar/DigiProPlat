import { defaultFont } from 'src/theme/core/typography';

// ----------------------------------------------------------------------

export const STORAGE_KEY = 'app-settings';

export const defaultSettings = {
  colorScheme: 'light', // Default to light mode
  direction: 'ltr',
  contrast: 'default', // Default contrast (not high)
  navLayout: 'horizontal', // Default to horizontal navigation (top bar)
  primaryColor: 'default', // Default primary color
  navColor: 'integrate', // Default nav color
  compactLayout: false, // Default to false for minimal theme
  fontFamily: defaultFont,
};
