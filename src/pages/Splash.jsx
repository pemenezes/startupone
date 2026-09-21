import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ComfyBrand from '../components/ComfyBrand';

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
      background: 'linear-gradient(180deg, white 0%, var(--brand-primary-soft) 100%)',
      color: 'var(--brand-primary-deep)'
    }}>
      <div className="page-transition" style={{ textAlign: 'center' }}>
        <ComfyBrand className="comfy-brand--splash" />
        <p style={{ marginTop: '0.8rem', fontSize: '1.1rem', color: 'var(--brand-primary-deep)', fontWeight: 500 }}>
          Mobilidade inteligente
        </p>
      </div>
    </div>
  );
}
