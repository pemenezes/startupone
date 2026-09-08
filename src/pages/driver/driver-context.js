import { createContext, useContext } from 'react';

export const DriverContext = createContext(null);
export function useDriver() {
  const value = useContext(DriverContext);
  if (!value) throw new Error('useDriver requer DriverProvider');
  return value;
}
