import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BusFront, Zap } from 'lucide-react';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionamento automático após 2.5s para a tela de Login
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: 'var(--primary)',
      color: 'white'
    }}>
      <div className="page-transition" style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
          <BusFront size={80} strokeWidth={1.5} color="var(--bg-secondary)" />
          <Zap 
            size={32} 
            color="var(--warning)" 
            style={{ position: 'absolute', bottom: -5, right: -10, fill: 'var(--warning)' }} 
          />
        </div>
        <h1 style={{ fontSize: '2.5rem', margin: 0, color: 'white', letterSpacing: '-0.05em' }}>MoveCorp</h1>
        <p style={{ marginTop: '0.5rem', opacity: 0.9, fontSize: '1.1rem' }}>Mobilidade Inteligente</p>
      </div>
    </div>
  );
}
