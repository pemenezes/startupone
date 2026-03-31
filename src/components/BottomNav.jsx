import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav({ role }) {
  const navigate = useNavigate();
  const location = useLocation();

  const getNavItems = () => {
    if (role === 'employee') {
      return [
        { label: 'Início', path: '/employee', icon: '🏠' },
        { label: 'Rotas', path: '/employee/routes', icon: '🗺️' },
        { label: 'Créditos', path: '/employee/credits', icon: '💳' },
        { label: 'Perfil', path: '/employee/profile', icon: '👤' }
      ];
    } else if (role === 'driver') {
      return [
        { label: 'Rota do Dia', path: '/driver', icon: '🚌' },
        { label: 'Passageiros', path: '/driver/passengers', icon: '👥' },
        { label: 'Histórico', path: '/driver/history', icon: '📋' }
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  if (navItems.length === 0) return null;

  return (
    <div className="bottom-nav">
      {navItems.map((item, index) => {
        // match exato ou rotas aninhadas, para simplificar vamos verificar startswith
        const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== `/${role}`);
        // ajuste para a raiz do role:
        const isRootActive = location.pathname === `/${role}`;
        const finalActive = (item.path === `/${role}` && isRootActive) || (item.path !== `/${role}` && location.pathname.startsWith(item.path));

        return (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className={`nav-item ${finalActive ? 'active' : ''}`}
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', gap: '0.2rem',
              color: finalActive ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: finalActive ? 'bold' : 'normal'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
