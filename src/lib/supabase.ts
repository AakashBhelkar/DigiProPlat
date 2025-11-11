import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

// Suppress multiple GoTrueClient warning for admin client
// This is expected when using both user and admin clients in the same context
// The warning is informational and doesn't affect functionality
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  
  // Only suppress specific warnings
  console.warn = (...args: any[]) => {
    const message = args[0];
    if (typeof message === 'string') {
      // Suppress GoTrueClient warning
      if (message.includes('Multiple GoTrueClient instances detected')) {
        return;
      }
      // Suppress GridLegacy deprecation warning (informational only)
      if (message.includes('GridLegacy component is deprecated')) {
        return;
      }
    }
    originalWarn.apply(console, args);
  };
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mafryhnhgopxfckrepxv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hZnJ5aG5oZ29weGZja3JlcHh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTk1MTU1NCwiZXhwIjoyMDc3NTI3NTU0fQ.7Z9eNr1BW19YM0UhrQ9R-4ZZBcPzRSEyJ2QtOCfHJFQ';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Regular client for user operations (uses anon key)
// Use singleton pattern to prevent multiple instances
// Use global window object to ensure true singleton across module reloads
declare global {
  interface Window {
    __supabaseClient?: ReturnType<typeof createClient<Database>>;
    __supabaseAdminClient?: ReturnType<typeof createClient<Database>>;
  }
}

function getSupabaseClient() {
  if (typeof window !== 'undefined' && window.__supabaseClient) {
    return window.__supabaseClient;
  }
  
  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'sb-user-session'
    }
  });
  
  if (typeof window !== 'undefined') {
    window.__supabaseClient = client;
  }
  
  return client;
}

function getSupabaseAdminClient() {
  if (typeof window !== 'undefined' && window.__supabaseAdminClient) {
    return window.__supabaseAdminClient;
  }
  
  // Admin client uses service role key - create with unique storage key to avoid conflicts
  // Use a memory-only storage to prevent any localStorage conflicts
  // Generate a unique storage key based on timestamp to ensure no conflicts
  const uniqueStorageKey = `sb-admin-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  const memoryStorage: Storage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0
  };
  
  const client = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage: memoryStorage,
      storageKey: uniqueStorageKey
    },
    // Disable realtime for admin client to reduce overhead
    realtime: {
      params: {
        eventsPerSecond: 0
      }
    }
  });
  
  if (typeof window !== 'undefined') {
    window.__supabaseAdminClient = client;
  }
  
  return client;
}

// Export singleton instances
export const supabase = getSupabaseClient();
// Lazy load admin client - only create when actually needed
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;
export const supabaseAdmin = (() => {
  if (!_supabaseAdmin) {
    _supabaseAdmin = getSupabaseAdminClient();
  }
  return _supabaseAdmin;
})();

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: Error) => {
  console.error('Supabase error:', error);
  throw new Error(error.message || 'An unexpected error occurred');
};

// File upload helper with progress
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      handleSupabaseError(error);
    }

    if (onProgress) {
      onProgress(100);
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data!.path);

    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// Upload multiple files with progress
export const uploadMultipleFiles = async (
  bucket: string,
  basePath: string,
  files: File[],
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<string[]> => {
  const uploadPromises = files.map(async (file, index) => {
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
    const filePath = `${basePath}/${fileName}`;

    return uploadFile(bucket, filePath, file, (progress) => {
      if (onProgress) {
        onProgress(index, progress);
      }
    });
  });

  return Promise.all(uploadPromises);
};

// Get file download URL
export const getFileUrl = (bucket: string, path: string): string => {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrl;
};

// Delete file
export const deleteFile = async (bucket: string, path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    handleSupabaseError(error);
  }
};

// Delete multiple files
export const deleteMultipleFiles = async (bucket: string, paths: string[]): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove(paths);

  if (error) {
    handleSupabaseError(error);
  }
};

// Check if bucket exists and is accessible
export const checkBucketAccess = async (bucket: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.storage.from(bucket).list('', { limit: 1 });
    return !error;
  } catch {
    return false;
  }
};