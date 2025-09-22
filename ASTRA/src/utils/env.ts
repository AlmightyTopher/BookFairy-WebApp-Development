/**
 * Environment variables configuration for BookFairy
 */

export interface EnvironmentConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_HARDCOVER_API_URL: string;
  VITE_AUDIOBOOKSHELF_API_URL: string;
  VITE_APP_ENV: string;
  VITE_APP_NAME: string;
  VITE_APP_DESCRIPTION: string;
}

function getEnvVar(key: keyof EnvironmentConfig): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

export const env: EnvironmentConfig = {
  VITE_SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL'),
  VITE_SUPABASE_ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY'),
  VITE_HARDCOVER_API_URL: getEnvVar('VITE_HARDCOVER_API_URL'),
  VITE_AUDIOBOOKSHELF_API_URL: getEnvVar('VITE_AUDIOBOOKSHELF_API_URL'),
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME || 'BookFairy',
  VITE_APP_DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'Your magical companion for discovering and managing audiobooks'
};

export const isDevelopment = env.VITE_APP_ENV === 'development';
export const isProduction = env.VITE_APP_ENV === 'production';