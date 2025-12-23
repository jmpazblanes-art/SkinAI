import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User as AuthUser } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';


interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, password: string, name: string, plan: 'monthly' | 'annual' | 'free', hasAcceptedTerms: boolean) => Promise<{ needsCheckout: boolean; checkoutUrl?: string }>;
  logout: () => Promise<void>;
  updateProfilePicture: (newPictureUrl: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Convert Supabase AuthUser to our User type
  // IMPORTANT: Uses auth.id directly (auth_user_id), NOT users table ID
  const mapAuthUserToUser = (authUser: AuthUser): User => {
    return {
      id: authUser.id,  // Use Auth ID directly (this is sent to n8n as auth_user_id)
      email: authUser.email || '',
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuario',
      birthDate: authUser.user_metadata?.birth_date,
      profilePictureUrl: authUser.user_metadata?.profile_picture_url || 'https://picsum.photos/seed/default/200/200',
    };
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapAuthUserToUser(session.user));
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapAuthUserToUser(session.user));
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user) {
      const mappedUser = mapAuthUserToUser(data.user);
      console.log('🔑 Login successful. User auth_user_id:', mappedUser.id);
      console.log('📧 Email:', mappedUser.email);
      setUser(mappedUser);
    }
  };

  const signup = async (email: string, password: string, name: string, plan: 'monthly' | 'annual' | 'free', hasAcceptedTerms: boolean) => {
    // Step 1: Create user in Supabase Auth FIRST
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          plan,
          has_accepted_terms: hasAcceptedTerms,
          terms_accepted_at: new Date().toISOString(),
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('No se pudo crear el usuario');
    }

    const authUserId = data.user.id;
    console.log('✅ Auth user created with ID:', authUserId);

    // Step 2: Create user object for state (Supabase trigger handles the DB record)
    const newUser: User = {
      id: authUserId,
      email: data.user.email || '',
      name: name,
      birthDate: undefined,
      profilePictureUrl: 'https://picsum.photos/seed/default/200/200',
      subscription_tier: 'free',
    };

    console.log('✅ Signup successful. Using Auth user ID:', newUser.id);
    setUser(newUser);

    return {
      needsCheckout: false,
    };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    setUser(null);
  };

  const updateProfilePicture = (newPictureUrl: string) => {
    if (user) {
      const updatedUser = { ...user, profilePictureUrl: newPictureUrl };
      setUser(updatedUser);
      // Update Supabase user metadata
      supabase.auth.updateUser({
        data: { profile_picture_url: newPictureUrl }
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout, updateProfilePicture }}>
      {children}
    </AuthContext.Provider>
  );
};