import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../../auth-context';
import BottomNav from '../../components/BottomNav';
import HomeDriver from './HomeDriver';
import ClaimRoute from './ClaimRoute';
import PassengerList from './PassengerList';
import MapNavigation from './MapNavigation';
import ExampleDriverJourney from './ExampleDriverJourney';
import ExamplePassengerView from '../employee/ExamplePassengerView';
import History from './History';
import Profile from './Profile';
import DriverStatus from './DriverStatus';
import RegionRequest from './RegionRequest';
import DriverProvider from './DriverProvider';
import DriverLogout from './DriverLogout';
import { DriverBack, DriverEmpty } from './DriverUI';
import './driver.css';

function DriverShell() {
  const { profile } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  return <div className="container driver-shell">
    <header className="driver-header"><div><small>Comfy</small><h2>Painel do motorista</h2><span>{profile.full_name || 'Motorista'}</span></div>
      <div className="header-actions">
        <button className="header-action-button" type="button" aria-label="Notificações" aria-expanded={notificationsOpen} aria-controls="driver-notifications" onClick={() => setNotificationsOpen((open) => !open)}><Bell size={22} aria-hidden="true" /></button>
        <DriverLogout compact />
      </div>
    </header>
    {notificationsOpen && <section id="driver-notifications" className="card driver-notifications" aria-label="Notificações"><h2>Notificações</h2><p>O recebimento de notificações ainda não está disponível.</p><button className="btn btn-outline" type="button" onClick={() => setNotificationsOpen(false)}>Fechar notificações</button></section>}
    <main className="driver-main"><Routes>
      <Route path="/" element={<HomeDriver />} />
      <Route path="/claim-route" element={<ClaimRoute />} />
      <Route path="/passengers" element={<PassengerList />} />
      <Route path="/history" element={<History />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/status" element={<DriverStatus />} />
      <Route path="/region-request" element={<RegionRequest />} />
      <Route path="/map" element={<MapNavigation />} />
      <Route path="/example" element={<ExampleDriverJourney />} />
      <Route path="/example/passenger" element={<ExamplePassengerView backTo="/driver/example" />} />
      <Route path="*" element={<div className="driver-stack"><DriverBack /><DriverEmpty title="Tela não encontrada"><p>Use a navegação para continuar.</p></DriverEmpty></div>} />
    </Routes></main>
    <BottomNav role="driver" />
  </div>;
}

export default function DriverLayout() {
  const { profile } = useAuth();
  return <DriverProvider key={profile.id}><DriverShell /></DriverProvider>;
}
