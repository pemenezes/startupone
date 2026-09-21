import { createContext, useContext } from 'react';

export const CompanyContext = createContext(null);
export function useCompanyData() {
  const context = useContext(CompanyContext);
  if (!context) throw new Error('Painel corporativo indisponível.');
  return context;
}
