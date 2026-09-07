import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShieldAlert, AlertCircle, Info, CheckCircle2, Check } from 'lucide-react';

export default function NotificationsPanel({ notifications, onMarkAsRead, onClose }) {
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case 'danger':
        return <AlertCircle size={18} color="var(--danger)" />;
      case 'warning':
        return <ShieldAlert size={18} color="var(--warning)" />;
      case 'success':
        return <CheckCircle2 size={18} color="var(--secondary)" />;
      case 'info':
      default:
        return <Info size={18} color="var(--primary)" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'danger': return 'var(--danger)';
      case 'warning': return 'var(--warning)';
      case 'success': return 'var(--secondary)';
      case 'info':
      default:
        return 'var(--primary)';
    }
  };

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const handleItemClick = (notification) => {
    onMarkAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    onClose();
  };

  return (
    <div style={{
      position: 'absolute',
      top: '65px',
      right: '10px',
      left: '10px',
      backgroundColor: 'white',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      border: '1px solid var(--border)',
      zIndex: 100,
      maxHeight: '400px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }} className="page-transition">
      
      {/* Header */}
      <div style={{ 
        padding: '0.75rem 1rem', 
        borderBottom: '1px solid var(--border)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Notificações
        </h4>
        <button 
          onClick={onClose} 
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            padding: '0.25rem',
            color: 'var(--text-secondary)'
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Nenhuma notificação por enquanto.
          </div>
        ) : (
          notifications.map((item) => (
            <div 
              key={item.id} 
              onClick={() => handleItemClick(item)}
              style={{
                display: 'flex',
                gap: '0.75rem',
                padding: '1rem',
                borderBottom: '1px solid var(--border)',
                borderLeft: `4px solid ${getBorderColor(item.type)}`,
                cursor: 'pointer',
                backgroundColor: item.read ? 'transparent' : 'var(--primary-light)',
                transition: 'background-color var(--transition-fast)'
              }}
            >
              <div style={{ flexShrink: 0, marginTop: '0.15rem' }}>
                {getIcon(item.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.15rem' }}>
                  <h5 style={{ margin: 0, fontWeight: item.read ? '600' : 'bold', fontSize: '0.85rem' }}>{item.title}</h5>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{formatTime(item.createdAt)}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                  {item.message}
                </p>
              </div>
              {!item.read && (
                <div style={{ 
                  flexShrink: 0, 
                  alignSelf: 'center',
                  backgroundColor: 'var(--primary)',
                  borderRadius: '50%',
                  width: '6px',
                  height: '6px'
                }} />
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Footer */}
      {notifications.some(n => !n.read) && (
        <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
          <button 
            onClick={() => notifications.forEach(n => !n.read && onMarkAsRead(n.id))}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--primary)', 
              fontSize: '0.8rem', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <Check size={14} /> Marcar todas como lidas
          </button>
        </div>
      )}
    </div>
  );
}

