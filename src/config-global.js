// Global configuration
export const CONFIG = {
  site: {
    basePath: '',
    name: 'DigiProPlat',
    serverUrl: import.meta.env.VITE_APP_URL || 'https://digiproplat.akadeadshot.work',
    assetURL: import.meta.env.VITE_APP_URL || '',
  },
  app: {
    name: 'DigiProPlat',
    version: '1.0.0',
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  },
  admin: {
    email: import.meta.env.VITE_ADMIN_EMAIL,
  },
};
