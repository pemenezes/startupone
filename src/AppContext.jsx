import React, { createContext, useContext, useEffect, useState } from 'react';
import { employeeUser as initialEmployee, driverUser as initialDriver, regions as initialRegions } from './data/mockData';
import { useAuth } from './AuthContext';

const AppContext = createContext();

const seedEmployee = {
  ...initialEmployee,
  id: initialEmployee.id || 'E001',
};

export function AppProvider({ children }) {
  const { profile } = useAuth();

  const [employees, setEmployees] = useState([seedEmployee]);
  const [activeEmployeeId, setActiveEmployeeId] = useState(seedEmployee.id);
  const [driver, setDriver] = useState(initialDriver);
  const [regions, setRegions] = useState(initialRegions);

  // Bridge Supabase profile → employee demo state (name / email / id)
  useEffect(() => {
    if (!profile || profile.role !== 'employee') return;

    setEmployees((prev) => {
      const template = prev[0] || seedEmployee;
      return [
        {
          ...template,
          id: profile.id,
          name: profile.full_name || template.name,
          email: profile.email || template.email,
        },
      ];
    });
    setActiveEmployeeId(profile.id);
  }, [profile]);

  const currentEmployee = employees.find((e) => e.id === activeEmployeeId) || employees[0];

  const updateWalletBalance = (employeeId, amount) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId
          ? {
              ...emp,
              wallet: {
                ...emp.wallet,
                balance: emp.wallet.balance + amount,
                lastTopUp: new Date().toISOString().split('T')[0],
              },
            }
          : emp
      )
    );
  };

  const recordNoShow = (employeeId) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== employeeId) return emp;
        const newNoShows = emp.penalties.noShows + 1;
        let newStatus = emp.penalties.status;
        if (newNoShows >= emp.penalties.nextPenaltyAt) {
          newStatus = 'suspended';
        } else if (newNoShows > 0) {
          newStatus = 'warning';
        }
        return {
          ...emp,
          penalties: { ...emp.penalties, noShows: newNoShows, status: newStatus },
        };
      })
    );
  };

  const updatePassengerStatus = (stopId, passengerName, status) => {
    setDriver((prev) => ({
      ...prev,
      todayRoute: {
        ...prev.todayRoute,
        stops: prev.todayRoute.stops.map((stop) =>
          stop.id === stopId
            ? { ...stop, status: stop.status === 'next' && status === 'checked' ? 'done' : stop.status }
            : stop
        ),
      },
    }));
  };

  const addDriverPenalty = (severity) => {
    setDriver((prev) => ({
      ...prev,
      penalties: {
        ...prev.penalties,
        level: Math.min(prev.penalties.level + 1, 4),
        history: [
          ...prev.penalties.history,
          { date: new Date().toLocaleDateString(), type: 'Infração de Rota', severity },
        ],
      },
    }));
  };

  const importEmployees = (newList) => {
    setEmployees((prev) => [...prev, ...newList]);
  };

  const distributeCredits = (amount) => {
    setEmployees((prev) =>
      prev.map((emp) => ({
        ...emp,
        wallet: { ...emp.wallet, balance: emp.wallet.balance + amount },
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

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
