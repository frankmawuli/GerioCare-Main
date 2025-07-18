import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User as AppUser } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('🔐 useAuth: Hook initialized with state:', { user: user?.email, userProfile: userProfile?.role, loading });

  useEffect(() => {
    console.log('🔄 useAuth: Effect running');
    
    // Check if we're in development mode and skip real auth
    const isDevelopment = import.meta.env.VITE_DEVELOPMENT_MODE === 'true';
    const hasSupabaseConfig = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (isDevelopment || !hasSupabaseConfig) {
      console.log('🛠️ useAuth: Development mode or missing config, using mock data');
      
      // Create mock user for development
      const mockUser = {
        id: 'mock-user-123',
        email: 'test@example.com',
      } as User;
      
      const mockProfile = {
        id: 'mock-user-123',
        email: 'test@example.com',
        role: 'older_adult',
        first_name: 'John',
        last_name: 'Doe',
        is_subscribed: true,
      } as AppUser;
      
      setTimeout(() => {
        console.log('✅ useAuth: Setting mock data');
        setUser(mockUser);
        setUserProfile(mockProfile);
        setLoading(false);
      }, 1000); // Simulate loading time
      
      return;
    }

    // Original Supabase auth logic
    console.log('🔄 useAuth: Using real Supabase auth');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🎫 useAuth: Session retrieved:', session?.user?.email ? 'User found' : 'No user');
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('👤 useAuth: User found, fetching profile for:', session.user.id);
        fetchUserProfile(session.user.id);
      } else {
        console.log('❌ useAuth: No session, setting loading to false');
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 useAuth: Auth state changed:', event, session?.user?.email ? 'User present' : 'No user');
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    console.log('📊 useAuth: Fetching user profile for ID:', userId);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ useAuth: Error fetching user profile:', error);
      } else {
        console.log('✅ useAuth: User profile fetched successfully:', data?.role);
        setUserProfile(data);
      }
    } catch (error) {
      console.error('💥 useAuth: Unexpected error:', error);
    } finally {
      console.log('🏁 useAuth: Setting loading to false');
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string, userData: Partial<AppUser>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (data.user && !error) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email,
          ...userData,
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        return { data: null, error: profileError };
      }
    }

    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
  };
};