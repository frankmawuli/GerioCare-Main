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

    // Initialize auth state
    initializeAuth();

    // Listen for auth changes with realtime updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 useAuth: Auth state changed:', event, session?.user?.email ? `User: ${session.user.email}` : 'No user');
        
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

    return () => {
      console.log('🧹 useAuth: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('🎫 useAuth: Getting initial session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ useAuth: Error getting session:', error);
        setLoading(false);
        return;
      }

      console.log('🎫 useAuth: Session retrieved:', session?.user?.email ? 'User found' : 'No user');
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('👤 useAuth: User found, fetching profile for:', session.user.id);
        await fetchUserProfile(session.user.id);
      } else {
        console.log('❌ useAuth: No session, setting loading to false');
        setLoading(false);
      }
    } catch (error) {
      console.error('💥 useAuth: Error initializing auth:', error);
      setLoading(false);
    }
  };

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
        
        // If user profile doesn't exist (404), this is expected for new users
        if (error.code === 'PGRST116') {
          console.log('👤 useAuth: User profile not found - this is normal for new users');
          setUserProfile(null);
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
    console.log('📝 useAuth: Attempting sign up for:', email);
    setLoading(true);
    
    try {
      // First, create the auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('❌ useAuth: Sign up error:', error);
        setLoading(false);
        return { data, error };
      }

      if (data.user) {
        console.log('✅ useAuth: Sign up successful, creating user profile...');
        
        // Create user profile in the users table
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
            role: userData.role || 'older_adult',
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            phone: userData.phone || null,
            is_subscribed: userData.is_subscribed || false,
          })
          .select()
          .single();

        if (profileError) {
          console.error('❌ useAuth: Error creating user profile:', profileError);
          setLoading(false);
          return { data: null, error: profileError };
        }
        
        console.log('✅ useAuth: User profile created successfully:', profileData);
        setUserProfile(profileData);
      }

      setLoading(false);
      return { data, error };
    } catch (error) {
      console.error('💥 useAuth: Unexpected sign up error:', error);
      setLoading(false);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    console.log('🚪 useAuth: Attempting sign out');
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ useAuth: Sign out error:', error);
      } else {
        console.log('✅ useAuth: Sign out successful');
        setUser(null);
        setUserProfile(null);
      }
      
      setLoading(false);
      return { error };
    } catch (error) {
      console.error('💥 useAuth: Unexpected sign out error:', error);
      setLoading(false);
      return { error };
    }
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