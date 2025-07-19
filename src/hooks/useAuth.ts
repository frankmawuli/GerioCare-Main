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
    console.log('🔄 useAuth: Initializing Supabase authentication');
    
    // Check for Supabase configuration
    const hasSupabaseConfig = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!hasSupabaseConfig) {
      console.error('❌ useAuth: Missing Supabase configuration');
      setLoading(false);
      return;
    }

    // Initialize Supabase auth
    console.log('🔄 useAuth: Using Supabase authentication');
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
        console.log('🔔 useAuth: Auth state changed:', event, session?.user?.email ? `User: ${session.user.email}` : 'No user');
        
        // Always set the user from the session
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 useAuth: User authenticated, fetching profile...');
          await fetchUserProfile(session.user.id);
        } else {
          console.log('🚪 useAuth: User logged out, clearing profile');
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
        
        // If user profile doesn't exist (404), create a basic profile
        if (error.code === 'PGRST116') {
          console.log('👤 useAuth: User profile not found, creating basic profile...');
          await createBasicUserProfile(userId);
        } else {
          console.error('❌ useAuth: Database error fetching user profile:', error);
          setUserProfile(null);
        }
      } else if (data) {
        console.log('✅ useAuth: User profile fetched successfully:', { id: data.id, role: data.role, email: data.email });
        setUserProfile(data);
      } else {
        console.warn('⚠️ useAuth: User profile data is empty');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('💥 useAuth: Unexpected error fetching user profile:', error);
      setUserProfile(null);
    } finally {
      console.log('🏁 useAuth: Setting loading to false');
      setLoading(false);
    }
  };

  const createBasicUserProfile = async (userId: string) => {
    try {
      // Get user email from Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        console.error('❌ useAuth: No user email found for profile creation');
        setUserProfile(null);
        return;
      }

      // Create basic user profile
      const basicProfile = {
        id: userId,
        email: user.email,
        role: 'older_adult' as const,
        first_name: user.email.split('@')[0], // Use email prefix as temporary first name
        last_name: 'User', // Temporary last name
        is_subscribed: false,
      };

      const { data, error } = await supabase
        .from('users')
        .insert(basicProfile)
        .select()
        .single();

      if (error) {
        console.error('❌ useAuth: Error creating user profile:', error);
        setUserProfile(null);
      } else {
        console.log('✅ useAuth: Basic user profile created:', data);
        setUserProfile(data);
      }
    } catch (error) {
      console.error('💥 useAuth: Unexpected error creating user profile:', error);
      setUserProfile(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔑 useAuth: Attempting sign in for:', email);
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ useAuth: Sign in error:', error);
        setLoading(false);
        return { data, error };
      }
      
      if (data.user) {
        console.log('✅ useAuth: Sign in successful, user ID:', data.user.id);
        // The onAuthStateChange listener will handle setting the user and fetching profile
        // Don't set loading to false here as the auth state change will handle it
      }
      
      return { data, error };
    } catch (error) {
      console.error('💥 useAuth: Unexpected sign in error:', error);
      setLoading(false);
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<AppUser>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('❌ useAuth: Sign up error:', error);
        return { data, error };
      }

      if (data.user) {
        console.log('✅ useAuth: Sign up successful, creating user profile...');
        
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
            ...userData,
          });

        if (profileError) {
          console.error('❌ useAuth: Error creating user profile:', profileError);
          return { data: null, error: profileError };
        }
        
        console.log('✅ useAuth: User profile created successfully');
      }

      return { data, error };
    } catch (error) {
      console.error('💥 useAuth: Unexpected sign up error:', error);
      return { data: null, error };
    }
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