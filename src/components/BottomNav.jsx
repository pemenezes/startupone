import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
 
export default function BottomNav({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
 
  const getNavItems = () => {
    if (role === 'employee') {
      return [
        { label: 'Início', path: '/employee', icon: '🏠' },
        { label: 'Acompanhar', path: '/employee/track', icon: '🚌' },
        { label: 'Carteira', path: '/employee/wallet', icon: '💰' },
        { label: 'Outros', path: '/employee/alternative', icon: '🚕' }
      ];
    } else if (role === 'driver') {
      return [
        { label: 'Rota do Dia', path: '/driver', icon: '🚌' },
        { label: 'Passageiros', path: '/driver/passengers', icon: '👥' },
        { label: 'Status', path: '/driver/status', icon: '🛡️' }
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
        const isRootActive = isRoot && location.pathname === `/${role}`;
        const isSubActive = !isRoot && location.pathname.startsWith(item.path);
        const finalActive = isRootActive || isSubActive;
 
        return (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className={`nav-item ${finalActive ? 'active' : ''}`}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              padding: '0.25rem', 
              gap: '0.2rem',
              color: finalActive ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: finalActive ? 'bold' : 'normal',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
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
