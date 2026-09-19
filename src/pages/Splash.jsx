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
      backgroundColor: 'var(--primary)',
      color: 'white'
    }}>
      <div className="page-transition" style={{ textAlign: 'center' }}>
        <ComfyBrand inverse />
        <p style={{ marginTop: '1rem', fontSize: '1.1rem', color: 'var(--primary-light)', fontWeight: 500 }}>
          Mobilidade inteligente
        </p>
      </div>
    </div>
  );
}
