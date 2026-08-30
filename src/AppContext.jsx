import React, { useEffect, useState } from 'react';
import { useAuth } from './auth-context';
import { AppContext } from './app-context';
import { driverUser as initialDriver, employeeUser as initialEmployee, regions as initialRegions } from './data/mockData';

const seedEmployee = {
  ...initialEmployee,
  id: initialEmployee.id || 'E001',
};

export function AppProvider({ children }) {
  const { profile } = useAuth();

  const [employees, setEmployees] = useState([seedEmployee]);
  const [activeEmployeeId, setActiveEmployeeId] = useState(seedEmployee.id);
  const [driver, setDriver] = useState(initialDriver);
  const [regions] = useState(initialRegions);

  // Sync logged-in profile into demo state without remounting the router tree.
  // (A key={profile} remount was causing intermittent double-login.)
  useEffect(() => {
    if (!profile) return;

    if (profile.role === 'employee') {
      setEmployees([
        {
          ...seedEmployee,
          id: profile.id,
          name: profile.full_name || seedEmployee.name,
          email: profile.email || seedEmployee.email,
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

  const updateWalletBalance = (employeeId, amount) => {
    setEmployees((current) =>
      current.map((employee) =>
        employee.id === employeeId
          ? {
              ...employee,
              credits: (employee.credits ?? employee.wallet.balance) + amount,
              wallet: {
                ...employee.wallet,
                balance: employee.wallet.balance + amount,
                lastTopUp: new Date().toISOString().split('T')[0],
              },
            }
          : employee
      )
    );
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
    recordNoShow,
    updatePassengerStatus,
    addDriverPenalty,
    importEmployees,
    distributeCredits,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
