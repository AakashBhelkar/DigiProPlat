import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

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