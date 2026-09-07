import React, { useEffect, useState } from 'react';
import { useAuth } from './auth-context';
import { AppContext } from './app-context';
import { driverUser as initialDriver, employeeUser as initialEmployee, regions as initialRegions } from './data/mockData';
import { adjustEmployeeCredits, fetchCreditBalance } from './lib/credits';

const seedEmployee = {
  ...initialEmployee,
  id: initialEmployee.id || 'E001',
};

export function AppProvider({ children }) {
  const { profile, refreshProfile } = useAuth();

  const [employees, setEmployees] = useState([seedEmployee]);
  const [activeEmployeeId, setActiveEmployeeId] = useState(seedEmployee.id);
  const [driver, setDriver] = useState(initialDriver);
  const [regions] = useState(initialRegions);

  // Sync logged-in profile into demo state without remounting the router tree.
  useEffect(() => {
    if (!profile) return;

    if (profile.role === 'employee') {
      const balance = Number(profile.credit_balance ?? seedEmployee.wallet.balance);
      setEmployees([
        {
          ...seedEmployee,
          id: profile.id,
          name: profile.full_name || seedEmployee.name,
          email: profile.email || seedEmployee.email,
          credits: balance,
          wallet: {
            ...seedEmployee.wallet,
            balance,
            lastTopUp: profile.credit_last_top_up || seedEmployee.wallet.lastTopUp,
          },
        },
      ]);
      setActiveEmployeeId(profile.id);
    }

    if (profile.role === 'driver') {
      setDriver((current) => ({
        ...current,
        name: profile.full_name || current.name,
        email: profile.email || current.email,
      }));
    }
  }, [profile]);

  const currentEmployee = employees.find((employee) => employee.id === activeEmployeeId) || employees[0];

  const applyLocalBalance = (employeeId, balance, lastTopUp) => {
    setEmployees((current) =>
      current.map((employee) =>
        employee.id === employeeId
          ? {
              ...employee,
              credits: balance,
              wallet: {
                ...employee.wallet,
                balance,
                lastTopUp: lastTopUp || employee.wallet.lastTopUp,
              },
            }
          : employee
      )
    );
  };

  const updateWalletBalance = async (employeeId, amount, title) => {
    // Persist for real logged-in employees (UUID from Supabase)
    const isUuid = typeof employeeId === 'string' && employeeId.includes('-') && employeeId.length > 30;

    if (isUuid) {
      const result = await adjustEmployeeCredits(employeeId, amount, title);
      applyLocalBalance(employeeId, result.balance, result.lastTopUp);
      if (typeof refreshProfile === 'function') {
        try {
          await refreshProfile();
        } catch {
          /* local state already updated */
        }
      }
      return result;
    }

    // Fallback for mock / offline demo ids
    const employee = employees.find((e) => e.id === employeeId) || currentEmployee;
    const next = Number(((employee?.wallet?.balance || 0) + amount).toFixed(2));
    applyLocalBalance(employeeId, next, amount > 0 ? new Date().toISOString().slice(0, 10) : undefined);
    return { balance: next };
  };

  const reloadWallet = async (employeeId) => {
    const id = employeeId || activeEmployeeId;
    if (!id || !String(id).includes('-')) return;
    const data = await fetchCreditBalance(id);
    applyLocalBalance(id, data.balance, data.lastTopUp);
    return data;
  };

  const recordNoShow = (employeeId) => {
    setEmployees((current) =>
      current.map((employee) => {
        if (employee.id !== employeeId) return employee;
        const noShows = employee.penalties.noShows + 1;
        return {
          ...employee,
          penalties: {
            ...employee.penalties,
            noShows,
            warnings: noShows,
            status: noShows >= employee.penalties.nextPenaltyAt ? 'suspended' : 'warning',
          },
        };
      })
    );
  };

  const updatePassengerStatus = (stopId, passengerName, status) => {
    setDriver((current) => ({
      ...current,
      todayRoute: {
        ...current.todayRoute,
        stops: current.todayRoute.stops.map((stop) =>
          stop.id === stopId
            ? {
                ...stop,
                passengerStatuses: { ...stop.passengerStatuses, [passengerName]: status },
              }
            : stop
        ),
      },
    }));
  };

  const addDriverPenalty = (severity) => {
    setDriver((current) => ({
      ...current,
      penalties: {
        ...current.penalties,
        level: Math.min(current.penalties.level + 1, 4),
        history: [
          ...current.penalties.history,
          { date: new Date().toLocaleDateString('pt-BR'), type: 'Infração de rota', severity },
        ],
      },
    }));
  };

  const importEmployees = (newEmployees) => {
    setEmployees((current) => {
      const knownIds = new Set(current.map((employee) => employee.id));
      return [...current, ...newEmployees.filter((employee) => !knownIds.has(employee.id))];
    });
  };

  const distributeCredits = (amount) => {
    setEmployees((current) =>
      current.map((employee) => ({
        ...employee,
        credits: (employee.credits ?? employee.wallet.balance) + amount,
        wallet: { ...employee.wallet, balance: employee.wallet.balance + amount },
      }))
    );
  };

  const value = {
    employees,
    currentEmployee,
    setActiveEmployeeId,
    driver,
    regions,
    updateWalletBalance,
    reloadWallet,
    recordNoShow,
    updatePassengerStatus,
    addDriverPenalty,
    importEmployees,
    distributeCredits,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
