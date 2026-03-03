import { supabase } from '../lib/supabaseClient';

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.user) return null;
  return data.session.user;
};

export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return !!user;
};

export const getUserRole = () => {
  // Prefer role from context; this helper is kept for backward compatibility.
  // New code should use useAuth().role instead.
  console.warn('getUserRole from authUtils is deprecated. Use useAuth().role instead.');
  return null;
};

export const hasRole = async (role) => {
  console.warn('hasRole from authUtils is deprecated. Use useAuth().hasRole instead.');
  return false;
};

export const hasPermission = async () => {
  // Permissions are handled at the app level; this is a no-op placeholder.
  return false;
};