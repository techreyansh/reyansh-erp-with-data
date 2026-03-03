import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, email, role, roleCode } from public.users + roles
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUserWithRole = async (session) => {
    if (!session?.user?.id) {
      setUser(null);
      setError(null);
      return;
    }
    try {
      const { data, error: dbError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          roles (
            id,
            name,
            code
          )
        `)
        .eq('id', session.user.id)
        .single();

      if (dbError) {
        console.error('Role fetch error:', dbError);
        setError('Failed to load user role');
        setUser(null);
        return;
      }

      if (!data || !data.roles) {
        setError('Your account is not authorized to access this app.');
        setUser(null);
        return;
      }

      setUser({
        id: data.id,
        email: data.email,
        role: data.roles?.name ?? null,
        roleCode: data.roles?.code ?? null,
      });
      setError(null);
    } catch (e) {
      console.error('Unexpected error loading user/role:', e);
      setError('Failed to load user role');
      setUser(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session && mounted) {
          await loadUserWithRole(data.session);
        } else if (mounted) {
          setUser(null);
          setError(null);
        }
      } catch (e) {
        console.error('Error initializing auth:', e);
        if (mounted) {
          setUser(null);
          setError('Authentication error');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        if (session) {
          await loadUserWithRole(session);
        } else {
          setUser(null);
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
      setError(null);
      window.location.href = '/login';
    } catch (err) {
      console.error('Error signing out:', err);
      setUser(null);
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  const role = user?.role ?? null;

  const value = {
    user,
    role,
    loading,
    error,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user && !!user?.role,
    hasRole: (requiredRole) =>
      !!role && !!requiredRole && (String(role).trim() === String(requiredRole).trim() || String(user?.roleCode ?? '').trim() === String(requiredRole).trim()),
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