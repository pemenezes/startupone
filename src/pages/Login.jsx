import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, Car } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="container page-transition" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Bem-vindo 👋</h1>
        <p>Selecione seu perfil de acesso para continuar no MoveCorp.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Funcionario */}
        <button 
          className="card" 
          onClick={() => navigate('/employee')}
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left', border: 'none', width: '100%', transition: 'var(--transition-fast)' }}
        >
          <div style={{ backgroundColor: 'var(--primary-light)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <User size={28} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Sou Funcionário</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Acesso ao fretado e rotas</p>
          </div>
        </button>

        {/* Motorista */}
        <button 
          className="card" 
          onClick={() => navigate('/driver')}
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left', border: 'none', width: '100%', transition: 'var(--transition-fast)' }}
        >
          <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <Car size={28} color="var(--secondary)" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Sou Motorista</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Gestão da rota diária</p>
          </div>
        </button>

        {/* Empresa / Admin */}
        <button 
          className="card" 
          onClick={() => navigate('/company')}
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left', border: 'none', width: '100%', transition: 'var(--transition-fast)' }}
        >
          <div style={{ backgroundColor: 'var(--bg-dark-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <Building2 size={28} color="white" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Sou Administrador</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Gestão de viagens e frotas</p>
          </div>
        </button>
      </div>
    </div>
  );
}
