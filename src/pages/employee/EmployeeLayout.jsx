import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import NotificationsPanel from '../../components/NotificationsPanel';
import EmployeeFlowGate from '../../components/EmployeeFlowGate';
import { TripProvider, useTrip } from '../../TripContext';
import { useAuth } from '../../auth-context';
import HomeEmployee from './HomeEmployee';
import TrackVan from './TrackVan';
import Credits from './Credits';
import CancelTrip from './CancelTrip';
import ReviewDriver from './ReviewDriver';
import Profile from './Profile';
import AlternativeTransport from './AlternativeTransport';
import DriverProfile from './DriverProfile';
import OnboardingCompany from './OnboardingCompany';
import OnboardingAddresses from './OnboardingAddresses';
import OnboardingRoute from './OnboardingRoute';

const initialNotifications = [
  {
    id: 1,
    type: 'warning',
    title: 'Advertência registrada',
    message: 'Você possui 1 advertência por ausência sem cancelamento prévio.',
    createdAt: '2026-06-21T09:30:00',
    read: false,
    actionUrl: '/employee/profile',
  },
];

function EmployeeShell() {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const { hasActiveTrip } = useTrip();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const firstName = (profile?.full_name || '').trim().split(/\s+/)[0];

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const handleTrackNav = () => {
    if (!hasActiveTrip) {
      navigate('/employee/onboarding/route');
      return;
    }
    navigate('/employee/track');
  };

  return (
    <div className="container" style={{ paddingBottom: '80px', position: 'relative' }}>
      <header
        style={{
          padding: '1rem',
          backgroundColor: 'var(--primary)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottomLeftRadius: 'var(--radius-lg)',
          borderBottomRightRadius: 'var(--radius-lg)',
          position: 'relative',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{firstName ? `Olá, ${firstName}` : 'MoveCorp'}</h2>
        <div className="header-actions">
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.25rem',
            }}
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--danger)',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>
          <button className="header-action-button" type="button" onClick={handleLogout} aria-label="Sair">
            <LogOut size={21} />
          </button>
        </div>
      </header>

      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 90,
              backgroundColor: 'transparent',
            }}
          />
          <NotificationsPanel
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onClose={() => setIsOpen(false)}
          />
        </>
      )}

      <div style={{ padding: '1rem' }}>
        <EmployeeFlowGate>
          <Routes>
            <Route path="/" element={<HomeEmployee />} />
            <Route path="/track" element={<TrackVan />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/alternative" element={<AlternativeTransport />} />
            <Route path="/driver-profile" element={<DriverProfile />} />
            <Route path="/cancel" element={<CancelTrip />} />
            <Route path="/review" element={<ReviewDriver />} />
            <Route path="/onboarding/company" element={<OnboardingCompany />} />
            <Route path="/onboarding/addresses" element={<OnboardingAddresses />} />
            <Route path="/onboarding/route" element={<OnboardingRoute />} />
            <Route path="*" element={<HomeEmployee />} />
          </Routes>
        </EmployeeFlowGate>
      </div>

      <BottomNav role="employee" onTrackNavigate={handleTrackNav} hasActiveTrip={hasActiveTrip} />
    </div>
  );
}

export default function EmployeeLayout() {
  return (
    <TripProvider>
      <EmployeeShell />
    </TripProvider>
  );
}
