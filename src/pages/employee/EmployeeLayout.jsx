import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import NotificationsPanel from '../../components/NotificationsPanel';
import EmployeeFlowGate from '../../components/EmployeeFlowGate';
import { TripProvider } from '../../TripContext';
import { useAuth } from '../../auth-context';
import { useNotifications } from '../../lib/useNotifications';
import {
  DEFAULT_NOTIFICATION_PREFS,
  fetchNotificationPrefs,
  filterNotificationsByPrefs,
} from '../../lib/notificationPrefs';
import TrackVan from './TrackVan';
import Credits from './Credits';
import CreditHistory from './CreditHistory';
import CancelTrip from './CancelTrip';
import ReviewDriver from './ReviewDriver';
import Profile from './Profile';
import HelpSupport from './HelpSupport';
import AccountSecurity from './AccountSecurity';
import NotificationPreferences from './NotificationPreferences';
import AlternativeTransport from './AlternativeTransport';
import DriverProfile from './DriverProfile';
import OnboardingCompany from './OnboardingCompany';
import OnboardingAddresses from './OnboardingAddresses';
import OnboardingRegion from './OnboardingRegion';
import OnboardingRoute from './OnboardingRoute';
import '../../mobility.css';

function EmployeeShell() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { signOut, profile } = useAuth();
  const { notifications, markRead } = useNotifications(profile?.id);
  const [prefs, setPrefs] = useState(DEFAULT_NOTIFICATION_PREFS);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchNotificationPrefs(profile?.id).then((next) => {
      if (!cancelled) setPrefs(next);
    });
    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  useEffect(() => {
    const onPrefsChanged = (event) => {
      if (event?.detail) setPrefs(event.detail);
    };
    window.addEventListener('movecorp:notification-prefs-changed', onPrefsChanged);
    return () => window.removeEventListener('movecorp:notification-prefs-changed', onPrefsChanged);
  }, []);

  const visibleNotifications = useMemo(
    () => filterNotificationsByPrefs(notifications, prefs),
    [notifications, prefs]
  );

  const unreadCount = visibleNotifications.filter((n) => !n.read).length;
  const firstName = (profile?.full_name || '').trim().split(/\s+/)[0];

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  const mapScreen = normalizedPath === '/employee' || normalizedPath === '/employee/track';
  return (
    <div className={`container employee-shell ${mapScreen ? 'is-map-screen' : ''}`} style={{ paddingBottom: mapScreen ? 0 : '80px', position: 'relative' }}>
      <header
        style={{
          padding: '1rem',
          background: 'var(--brand-gradient)',
          color: 'white',
          display: mapScreen ? 'none' : 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottomLeftRadius: 'var(--radius-lg)',
          borderBottomRightRadius: 'var(--radius-lg)',
          position: 'relative',
        }}
      >
        <div>
          <small style={{ display: 'block', opacity: 0.82, fontWeight: 700 }}>Comfy</small>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>
            {firstName ? `Olá, ${firstName}` : 'Olá'}
          </h2>
        </div>
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

      {mapScreen && (
        <button
          className="employee-map-notifications"
          type="button"
          aria-label={`Notificações${unreadCount > 0 ? `, ${unreadCount} não lidas` : ''}`}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          <Bell size={21} aria-hidden="true" />
          {unreadCount > 0 && <span className="employee-map-notifications__unread" />}
        </button>
      )}

      {isOpen && (
        <>
          <div
            className={mapScreen ? 'employee-map-notifications-backdrop' : undefined}
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
          <div className={mapScreen ? 'employee-map-notifications-panel' : 'employee-header-notifications-panel'}>
            <NotificationsPanel
              notifications={visibleNotifications}
              onMarkAsRead={markRead}
              onClose={() => setIsOpen(false)}
            />
          </div>
        </>
      )}

      <div className="employee-content" style={{ padding: mapScreen ? 0 : '1rem' }}>
        <EmployeeFlowGate>
          <Routes>
            <Route path="/" element={<TrackVan />} />
            <Route path="/track" element={<Navigate to="/employee" replace />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/credits/history" element={<CreditHistory />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/route-settings" element={<OnboardingRoute mode="settings" />} />
            <Route path="/help" element={<HelpSupport />} />
            <Route path="/security" element={<AccountSecurity />} />
            <Route path="/notifications" element={<NotificationPreferences />} />
            <Route path="/alternative" element={<AlternativeTransport />} />
            <Route path="/driver-profile" element={<DriverProfile />} />
            <Route path="/cancel" element={<CancelTrip />} />
            <Route path="/review" element={<ReviewDriver />} />
            <Route path="/onboarding/company" element={<OnboardingCompany />} />
            <Route path="/onboarding/addresses" element={<OnboardingAddresses />} />
            <Route path="/onboarding/region" element={<OnboardingRegion />} />
            <Route path="/onboarding/route" element={<OnboardingRoute />} />
            <Route path="*" element={<TrackVan />} />
          </Routes>
        </EmployeeFlowGate>
      </div>

      {!mapScreen && <BottomNav role="employee" />}
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
