import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

interface User {
  id: string;
  email: string;
  name: string;
  hardcoverApiKey?: string;
  audiobookshelfCreated?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Supabase auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email!,
          hardcoverApiKey: session.user.user_metadata?.hardcover_api_key,
          audiobookshelfCreated: session.user.user_metadata?.audiobookshelf_created
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email!,
          hardcoverApiKey: session.user.user_metadata?.hardcover_api_key,
          audiobookshelfCreated: session.user.user_metadata?.audiobookshelf_created
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    console.log('🧚‍♀️ BookFairy: Starting Google OAuth sign-in...');
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        console.error('🧚‍♀️ BookFairy: OAuth error:', error);
        throw error;
      }
      
      console.log('🧚‍♀️ BookFairy: OAuth initiated successfully:', data);
    } catch (error) {
      console.error('🧚‍♀️ BookFairy: Sign-in failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('🧚‍♀️ BookFairy: Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    console.log('🧚‍♀️ BookFairy: Updating user profile...', updates);
    
    // Update Supabase user metadata
    const { error } = await supabase.auth.updateUser({
      data: {
        ...updates,
        hardcover_api_key: updates.hardcoverApiKey,
        audiobookshelf_created: updates.audiobookshelfCreated
      }
    });
    
    if (error) {
      console.error('🧚‍♀️ BookFairy: Profile update failed:', error);
      throw error;
    }
    
    setUser({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signInWithGoogle,
      signOut,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}