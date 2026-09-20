import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Map, CreditCard, User, Users, ClipboardList } from 'lucide-react';

export default function BottomNav({ role, embedded = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const getNavItems = () => {
    if (role === 'employee') {
      return [
        { label: 'Mapa', path: '/employee', Icon: Map },
        { label: 'Créditos', path: '/employee/credits', Icon: CreditCard },
        { label: 'Perfil', path: '/employee/profile', Icon: User },
      ];
    } else if (role === 'driver') {
      return [
        { label: 'Mapa', path: '/driver', Icon: Map },
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
    <div className={`bottom-nav ${embedded ? 'is-embedded' : ''}`}>
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
              navigate(item.path);
            }}
            className={`nav-item ${finalActive ? 'active' : ''}`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              gap: '0.25rem',
              color: finalActive ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: finalActive ? 600 : 400,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
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
