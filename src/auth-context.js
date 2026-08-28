import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

/** URL segment → profiles.role */
export const ROLE_BY_LOGIN_PATH = {
  employee: 'employee',
  driver: 'driver',
  company: 'admin',
};

/**
 * Roles allowed to self-register. Administrator accounts are created separately,
 * so they are intentionally excluded here.
 */
export const ROLE_BY_REGISTER_PATH = {
  employee: 'employee',
  driver: 'driver',
};

export const HOME_BY_ROLE = {
  employee: '/employee',
  driver: '/driver',
  admin: '/company',
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
