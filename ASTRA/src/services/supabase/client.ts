import { createClient } from '@supabase/supabase-js';
import { env } from '@/utils/env';

/**
 * Supabase client configuration for BookFairy
 *
 * This client handles:
 * - Google OAuth authentication
 * - User data management
 * - Real-time subscriptions
 * - Database operations
 */

export const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'bookfairy-web'
      }
    }
  }
);

/**
 * Database type definitions will be generated from Supabase
 * For now, we'll use a basic Database interface
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          hardcover_api_key: string;
          audiobookshelf_account_id: string;
          created_at: string;
          updated_at: string;
          onboarding_completed: boolean;
          last_onboarding_date: string;
          next_renewal_date: string;
          prefers_reduced_motion: boolean;
          high_contrast_mode: boolean;
          keyboard_navigation: boolean;
          screen_reader_mode: boolean;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      // Additional tables will be defined as we implement them
    };
  };
}

export type SupabaseClient = typeof supabase;