import React, { useState } from 'react';
import { useAuth } from './auth-context';
import { AppContext } from './app-context';
import { driverUser as initialDriver, employeeUser as initialEmployee, regions as initialRegions } from './data/mockData';

export function AppProvider({ children }) {
  const { profile } = useAuth();
  const profileKey = `${profile?.id || 'demo'}:${profile?.role || 'guest'}`;

  return <StatefulAppProvider key={profileKey} profile={profile}>{children}</StatefulAppProvider>;
}

function StatefulAppProvider({ children, profile }) {
  const employeeSeed = profile?.role === 'employee'
    ? {
        ...initialEmployee,
        id: profile.id,
        name: profile.full_name || initialEmployee.name,
        email: profile.email || initialEmployee.email,
      }
    : initialEmployee;
  const driverSeed = profile?.role === 'driver'
    ? {
        ...initialDriver,
        name: profile.full_name || initialDriver.name,
        email: profile.email || initialDriver.email,
      }
    : initialDriver;

  const [employees, setEmployees] = useState([employeeSeed]);
  const [activeEmployeeId, setActiveEmployeeId] = useState(employeeSeed.id);
  const [driver, setDriver] = useState(driverSeed);
  const [regions] = useState(initialRegions);

  const currentEmployee = employees.find((employee) => employee.id === activeEmployeeId) || employees[0];

  const updateWalletBalance = (employeeId, amount) => {
    setEmployees((current) => current.map((employee) => employee.id === employeeId
      ? {
          ...employee,
          credits: employee.credits + amount,
          wallet: {
            ...employee.wallet,
            balance: employee.wallet.balance + amount,
            lastTopUp: new Date().toISOString().split('T')[0],
          },
        }
      : employee));
  };

  const recordNoShow = (employeeId) => {
    setEmployees((current) => current.map((employee) => {
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
    }));
  };

  const updatePassengerStatus = (stopId, passengerName, status) => {
    setDriver((current) => ({
      ...current,
      todayRoute: {
        ...current.todayRoute,
        stops: current.todayRoute.stops.map((stop) => stop.id === stopId
          ? { ...stop, passengerStatuses: { ...stop.passengerStatuses, [passengerName]: status } }
          : stop),
      },
    }));
  };

  const addDriverPenalty = (severity) => {
    setDriver((current) => ({
      ...current,
      penalties: {
        ...current.penalties,
        level: Math.min(current.penalties.level + 1, 4),
        history: [...current.penalties.history, { date: new Date().toLocaleDateString('pt-BR'), type: 'Infração de rota', severity }],
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
    setEmployees((current) => current.map((employee) => ({
      ...employee,
      credits: employee.credits + amount,
      wallet: { ...employee.wallet, balance: employee.wallet.balance + amount },
    })));
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
