import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../../auth-context';
import BottomNav from '../../components/BottomNav';
import NotificationsPanel from '../../components/NotificationsPanel';
import { useNotifications } from '../../lib/useNotifications';
import HomeDriver from './HomeDriver';
import ClaimRoute from './ClaimRoute';
import PassengerList from './PassengerList';
import MapNavigation from './MapNavigation';
import History from './History';
import Profile from './Profile';
import DriverStatus from './DriverStatus';
import RegionRequest from './RegionRequest';
import DriverNotificationPreferences from './DriverNotificationPreferences';
import DriverProvider from './DriverProvider';
import DriverLogout from './DriverLogout';
import { DriverBack, DriverEmpty } from './DriverUI';
import './driver.css';
import '../../mobility.css';

function DriverShell() {
  const { profile } = useAuth();
  const { notifications, markRead } = useNotifications(profile.id);
  const { pathname } = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const mapScreen = pathname === '/driver' || pathname === '/driver/map';
  return <div className={`container driver-shell ${mapScreen ? 'is-map-screen' : ''}`}>
    <header className="driver-header"><div><small>Comfy</small><h2>Painel do motorista</h2><span>{profile.full_name || 'Motorista'}</span></div>
      <div className="header-actions">
        <button className="header-action-button" type="button" aria-label={`Notificações${notifications.some((item) => !item.read) ? ' não lidas' : ''}`} aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)}><Bell size={22} aria-hidden="true" /></button>
        <DriverLogout compact />
      </div>
    </header>
    {mapScreen && <button className="driver-map-notifications" type="button" aria-label={`Notificações${notifications.some((item) => !item.read) ? ' não lidas' : ''}`} aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)}><Bell size={21} aria-hidden="true" />{notifications.some((item) => !item.read) && <span />}</button>}
    {notificationsOpen && <NotificationsPanel notifications={notifications} onMarkAsRead={markRead} onClose={() => setNotificationsOpen(false)} />}
    <main className="driver-main"><Routes>
      <Route path="/" element={<MapNavigation />} />
      <Route path="/journey" element={<HomeDriver />} />
      <Route path="/claim-route" element={<ClaimRoute />} />
      <Route path="/passengers" element={<PassengerList />} />
      <Route path="/history" element={<History />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/status" element={<DriverStatus />} />
      <Route path="/region-request" element={<RegionRequest />} />
      <Route path="/notifications" element={<DriverNotificationPreferences />} />
      <Route path="/map" element={<Navigate to="/driver" replace />} />
      <Route path="*" element={<div className="driver-stack"><DriverBack /><DriverEmpty title="Tela não encontrada"><p>Use a navegação para continuar.</p></DriverEmpty></div>} />
    </Routes></main>
    {!mapScreen && <BottomNav role="driver" />}
  </div>;
}

export default function DriverLayout() {
  const { profile } = useAuth();
  return <DriverProvider key={profile.id}><DriverShell /></DriverProvider>;
}
