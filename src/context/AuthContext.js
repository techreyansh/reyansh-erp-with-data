import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Supabase user
  const [role, setRole] = useState(null); // Role from public.users
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoleForEmail = async (email) => {
    if (!email) {
      setRole(null);
      return;
    }
    try {
      const { data, error: dbError } = await supabase
        .from('users')
        .select('role')
        .eq('email', email)
        .single();

      if (dbError) {
        console.error('Error fetching role from users table:', dbError);
        setError('Failed to load user role');
        setRole(null);
        return;
      }

      if (!data || !data.role) {
        console.warn('No matching user/role found for email:', email);
        setError('Your account is not authorized to access this app.');
        setRole(null);
        return;
      }

      setRole(data.role);
      setError(null);
    } catch (e) {
      console.error('Unexpected error fetching role:', e);
      setError('Failed to load user role');
      setRole(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      setLoading(true);
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Error getting Supabase session:', sessionError);
          setUser(null);
          setRole(null);
          setError('Authentication error');
        } else if (data.session?.user) {
          const supaUser = data.session.user;
          if (mounted) {
            setUser(supaUser);
            await fetchRoleForEmail(supaUser.email);
          }
        } else {
          setUser(null);
          setRole(null);
          setError(null);
        }
      } catch (e) {
        console.error('Error initializing auth:', e);
        setUser(null);
        setRole(null);
        setError('Authentication error');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const supaUser = session?.user || null;
          setUser(supaUser);
          if (supaUser?.email) {
            await fetchRoleForEmail(supaUser.email);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setRole(null);
          setError(null);
        }
      }
    );

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (signInError) {
      console.error('Supabase OAuth sign-in error:', signInError);
      setError('Failed to sign in with Google');
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
      setError(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
      setUser(null);
      setRole(null);
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    role,
    loading,
    error,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user && !!role,
    hasRole: (requiredRole) =>
      !!role && !!requiredRole && String(role).trim() === String(requiredRole).trim(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 