import { useCallback, useEffect, useState } from 'react';
import { fetchCompanyOperations } from '../../lib/companyOperations';
import {
  adminCompany, adminCreditTransactions, adminEmployees, adminOccurrences, adminRoutes,
} from '../../data/presentationCompanyData';
import { CompanyContext } from './company-context';

const presentationData = {
  company: adminCompany,
  employees: adminEmployees,
  routes: adminRoutes.map((route) => ({
    ...route,
    code: route.id,
    history: Array.from({ length: 30 }, (_, index) => ({
      day: index + 1,
      occupancy: Math.max(12, Math.min(100, route.historyBase + (((index * 7 + route.id.length * 3) % 19) - 9))),
    })),
  })),
  creditTransactions: adminCreditTransactions,
  occurrences: adminOccurrences,
};

export default function CompanyProvider({ children }) {
  // The presentation stays available while the optional Supabase view loads.
  const [data, setData] = useState(presentationData);
  const refresh = useCallback(async () => {
    try {
      const next = await fetchCompanyOperations();
      if (next.routes.length && next.employees.length) setData(next);
    } catch {
      // Keep the current data when the RPC is unavailable or the network is offline.
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(refresh, 0);
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh]);

  return <CompanyContext.Provider value={{ ...data, refresh }}>{children}</CompanyContext.Provider>;
}
