import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import HomeDriver from './HomeDriver';
import PassengerList from './PassengerList';
import MapNavigation from './MapNavigation';
import History from './History';
import Profile from './Profile';
import DriverStatus from './DriverStatus';
import RegionRequest from './RegionRequest';
import NotificationsPanel from '../../components/NotificationsPanel';
import { useAuth } from '../../auth-context';

const initialNotifications = [
  {
    id: 1,
    type: "info",
    title: "Nova rota atribuída",
    message: "Uma nova rota RT-14 foi atribuída à sua van para a jornada de hoje.",
    createdAt: "2026-06-22T06:00:00",
    read: false,
    actionUrl: "/driver"
  },
  {
    id: 2,
    type: "warning",
    title: "Vistoria veicular próxima",
    message: "A vistoria do veículo Van ABC-1234 expira em 10 dias. Agende a revisão.",
    createdAt: "2026-06-22T05:30:00",
    read: false,
    actionUrl: "/driver/profile"
  },
  {
    id: 3,
    type: "danger",
    title: "Documentação pendente",
    message: "Seu licenciamento anual vence em 3 dias. Regularize para evitar bloqueio da conta.",
    createdAt: "2026-06-21T09:00:00",
    read: false,
    actionUrl: "/driver/profile"
  },
  {
    id: 4,
    type: "success",
    title: "Nova avaliação de passageiro",
    message: "Você recebeu uma avaliação 5 estrelas do passageiro na Rota RT-14!",
    createdAt: "2026-06-21T19:30:00",
    read: false,
    actionUrl: "/driver/history"
  }
];

export default function DriverLayout() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="container" style={{ paddingBottom: '80px', backgroundColor: '#f0fdf4', minHeight: '100vh', position: 'relative' }}>
      <header style={{ 
        padding: '1rem', 
        backgroundColor: 'var(--secondary)', 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 'var(--radius-lg)',
        borderBottomRightRadius: 'var(--radius-lg)',
        position: 'relative'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Driver Panel</h2>
        
        <div className="header-actions">
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.25rem'
          }}
        >
          <Bell size={22} />
          {unreadCount > 0 && (
            <span style={{
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
              justifyContent: 'center'
            }}>
              {unreadCount}
            </span>
          )}
        </button>
        <button className="header-action-button" type="button" onClick={handleLogout} aria-label="Sair"><LogOut size={21} /></button>
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
              backgroundColor: 'transparent'
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
        <Routes>
          <Route path="/" element={<HomeDriver />} />
          <Route path="/passengers" element={<PassengerList />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/status" element={<DriverStatus />} />
          <Route path="/region-request" element={<RegionRequest />} />
          <Route path="/map" element={<MapNavigation />} />
          <Route path="*" element={<HomeDriver />} />
        </Routes>
      </div>

      <BottomNav role="driver" />
    </div>
  );
}
