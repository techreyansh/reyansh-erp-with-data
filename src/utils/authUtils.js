import { useAuth } from '../context/AuthContext';

export const useCurrentUser = () => {
  const { user } = useAuth();
  return user || null;
};

export const useIsAuthenticated = () => {
  const { user } = useAuth();
  return !!user;
};

export const useUserRole = () => {
  const { role } = useAuth();
  return role;
};

export const useHasRole = (requiredRole) => {
  const { role } = useAuth();
  return role === requiredRole;
};
