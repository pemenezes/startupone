import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { fetchCompanyOperations } from '../../lib/companyOperations';
import {
  adminCompany, adminCreditTransactions, adminEmployees, adminOccurrences, adminRoutes,
} from '../../data/presentationCompanyData';
import { CompanyContext } from './company-context';
import { readPresentationJourney, subscribePresentationJourney } from '../../lib/presentationMobility';
import { composeCompanyPresentation } from '../../data/companyPresentationBridge';
import { useAuth } from '../../auth-context';

const presentationData = {
  company: adminCompany,
  employees: adminEmployees,
  routes: adminRoutes,
  creditTransactions: adminCreditTransactions,
  occurrences: adminOccurrences,
};

export default function CompanyProvider({ children }) {
  const { isDemo } = useAuth();
  // The presentation stays available while the optional Supabase view loads.
  const [data, setData] = useState(presentationData);
  const journey = useSyncExternalStore(subscribePresentationJourney, readPresentationJourney, readPresentationJourney);
  const displayed = useMemo(() => composeCompanyPresentation(data, journey), [data, journey]);
  const refresh = useCallback(async () => {
    if (isDemo) return;
    try {
      const next = await fetchCompanyOperations();
      if (next.routes.length && next.employees.length) setData(next);
    } catch {
      // Keep the current data when the RPC is unavailable or the network is offline.
    }
  }, [isDemo]);

  useEffect(() => {
    if (isDemo) return undefined;
    const initial = window.setTimeout(refresh, 0);
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh, isDemo]);

  return <CompanyContext.Provider value={{ ...displayed, refresh }}>{children}</CompanyContext.Provider>;
}
