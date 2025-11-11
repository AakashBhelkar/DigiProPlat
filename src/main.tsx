import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Force light mode - clear any dark mode preferences BEFORE React loads
if (typeof window !== 'undefined') {
  // Clear MUI theme mode storage
  localStorage.setItem('theme-mode', 'light');
  
  // Clear app settings dark mode preference
  const appSettings = localStorage.getItem('app-settings');
  if (appSettings) {
    try {
      const settings = JSON.parse(appSettings);
      if (settings.colorScheme === 'dark') {
        settings.colorScheme = 'light';
        localStorage.setItem('app-settings', JSON.stringify(settings));
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
  
  // Force light mode on document immediately
  document.documentElement.setAttribute('data-mui-color-scheme', 'light');
  document.documentElement.style.colorScheme = 'light';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
