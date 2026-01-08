import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User as AuthUser } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';
import { STRIPE_PRICES } from '../constants';


interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, password: string, name: string, plan: 'monthly' | 'annual' | 'free', hasAcceptedTerms: boolean) => Promise<{ needsCheckout: boolean; checkoutUrl?: string }>;
  logout: () => Promise<void>;
  updateProfilePicture: (newPictureUrl: string) => void;
  activateProCode: (code: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Convert Supabase AuthUser to our User type and fetch subscription_tier from public.users
  const mapAuthUserToUser = async (authUser: AuthUser): Promise<User> => {
    let subscriptionTier: 'free' | 'pro' = 'free';

    try {
      // Fetch subscription_tier from public.users table with timeout
      const fetchPromise = supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', authUser.id)
        .single();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout fetching user data')), 5000)
      );

      const { data: userData, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        console.warn('⚠️ Error fetching user subscription:', error.message);
        console.warn('⚠️ Usando tier por defecto: free');
      } else if (userData?.subscription_tier) {
        subscriptionTier = userData.subscription_tier as 'free' | 'pro';
      }
    } catch (err) {
      console.error('❌ Error o Timeout en mapAuthUserToUser:', err);
      console.warn('⚠️ Continuando con tier por defecto');
    }

    // TEMPORAL: Usar metadata como fallback
    if (authUser.user_metadata?.subscription_tier) {
      subscriptionTier = authUser.user_metadata.subscription_tier as 'free' | 'pro';
    }

    return {
      id: authUser.id,
      email: authUser.email || '',
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuario',
      birthDate: authUser.user_metadata?.birth_date,
      profilePictureUrl: authUser.user_metadata?.profile_picture_url || 'https://picsum.photos/seed/default/200/200',
      subscription_tier: subscriptionTier,
    };
  };

  useEffect(() => {
    console.log('🔄 Iniciando verificación de sesión...');

    // Safety timeout: ensure loading stops after 4s no matter what
    const timer = setTimeout(() => {
      console.warn('⚠️ La carga de auth tardó demasiado. Forzando fin de carga.');
      setIsLoading(false);
    }, 4000);

    // Check active session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('📊 Sesión recuperada:', session ? 'Usuario logueado' : 'No hay sesión');

        if (session?.user) {
          const mappedUser = await mapAuthUserToUser(session.user);
          setUser(mappedUser);
        }
      } catch (err) {
        console.error('❌ Error initializing auth:', err);
      } finally {
        setIsLoading(false);
        clearTimeout(timer);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('🔔 Cambio en estado de auth:', _event);
      if (session?.user) {
        try {
          const mappedUser = await mapAuthUserToUser(session.user);
          setUser(mappedUser);
        } catch (err) {
          console.error('❌ Error handling auth change:', err);
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log('🔑 Intentando login para:', email);

    // Timeout para la operación de login completa
    const loginPromise = supabase.auth.signInWithPassword({
      email,
      password,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('El servidor no responde. Por favor, comprueba tu conexión.')), 10000)
    );

    try {
      const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('✅ Auth exitoso. Mapeando usuario...');
        // Intentar mapear con un timeout interno
        const mappedUser = await mapAuthUserToUser(data.user);
        console.log('🔑 Login completado. Bienvenido:', mappedUser.email);
        setUser(mappedUser);
      }
    } catch (err: any) {
      console.error('❌ Error en proceso de login:', err.message);
      throw err;
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

    // Step 3: If plan is not free, get checkout URL from Stripe Edge Function
    if (plan !== 'free') {
      try {
        const priceId = plan === 'monthly'
          ? STRIPE_PRICES.MONTHLY
          : STRIPE_PRICES.ANNUAL;

        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('stripe-checkout', {
          body: {
            price_id: priceId,
            user_id: authUserId,
            return_url: window.location.origin
          }
        });

        if (checkoutError) throw checkoutError;
        if (checkoutData?.url) {
          return {
            needsCheckout: true,
            checkoutUrl: checkoutData.url
          };
        }
      } catch (err) {
        console.error('❌ Error getting checkout URL:', err);
        // We still let them sign up, but they might need to subscribe manually later
      }
    }

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

  const activateProCode = async (code: string): Promise<boolean> => {
    // CÓDIGO SECRETO PARA TESTEO
    const SECRET_CODE = "SKINAI_PRO_TEST";

    if (code.trim().toUpperCase() === SECRET_CODE) {
      if (user) {
        // Actualizar en base de Datos (Metadata)
        const { error } = await supabase.auth.updateUser({
          data: { subscription_tier: 'pro' }
        });

        if (error) {
          console.error("Error actualizando a PRO:", error);
          return false;
        }

        // Actualizar estado local
        setUser({ ...user, subscription_tier: 'pro' });
        return true;
      }
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout, updateProfilePicture, activateProCode }}>
      {children}
    </AuthContext.Provider>
  );
};