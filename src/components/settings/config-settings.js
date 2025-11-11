import { defaultFont } from 'src/theme/core/typography';

// ----------------------------------------------------------------------

export const STORAGE_KEY = 'app-settings';

export const defaultSettings = {
  colorScheme: 'light', // Default to light mode
  direction: 'ltr',
  contrast: 'default',
  navLayout: 'horizontal', // Default to horizontal navigation (top bar)
  primaryColor: 'default',
  navColor: 'integrate',
  compactLayout: true,
  fontFamily: defaultFont,
};
