import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Map, CreditCard, User, Bus, Users, ClipboardList } from 'lucide-react';

export default function BottomNav({ role, onTrackNavigate, hasActiveTrip }) {
  const navigate = useNavigate();
  const location = useLocation();

  const getNavItems = () => {
    if (role === 'employee') {
      return [
        { label: 'Início', path: '/employee', Icon: Home },
        { label: 'Mapa', path: '/employee/track', Icon: Map, requiresTrip: true },
        { label: 'Créditos', path: '/employee/credits', Icon: CreditCard },
        { label: 'Perfil', path: '/employee/profile', Icon: User },
      ];
    } else if (role === 'driver') {
      return [
        { label: 'Jornada', path: '/driver', Icon: Bus },
        { label: 'Passageiros', path: '/driver/passengers', Icon: Users },
        { label: 'Histórico', path: '/driver/history', Icon: ClipboardList },
        { label: 'Perfil', path: '/driver/profile', Icon: User },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  if (navItems.length === 0) return null;

  return (
    <div className="bottom-nav">
      {navItems.map((item, index) => {
        const isRoot = item.path === `/${role}`;
        const finalActive = isRoot
          ? location.pathname === item.path
          : location.pathname.startsWith(item.path);
        const Icon = item.Icon;

        return (
          <button
            key={index}
            type="button"
            onClick={() => {
              if (item.requiresTrip && onTrackNavigate) {
                onTrackNavigate();
                return;
              }
              if (item.requiresTrip && !hasActiveTrip) {
                navigate('/employee/onboarding/route');
                return;
              }
              navigate(item.path);
            }}
            className={`nav-item ${finalActive ? 'active' : ''}`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              gap: '0.25rem',
              color: finalActive ? '#111111' : '#4b5563',
              fontWeight: finalActive ? 600 : 400,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: item.requiresTrip && hasActiveTrip === false ? 0.55 : 1,
            }}
          >
            <Icon size={22} strokeWidth={finalActive ? 2 : 1.6} color="currentColor" />
            <span style={{ fontSize: '0.7rem' }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
