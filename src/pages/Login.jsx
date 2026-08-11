import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, Car, BusFront } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div
      className="container page-transition"
      style={{
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: 'var(--primary-light)',
      }}
    >
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <BusFront
          size={64}
          strokeWidth={1.5}
          color="var(--primary)"
          style={{ marginBottom: '1rem' }}
        />
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Bem-vindo</h1>
        <p
          style={{
            margin: 0,
            color: 'var(--text-primary)',
            fontSize: '1rem',
            fontWeight: 500,
          }}
        >
          Selecione seu perfil de acesso para continuar no MoveCorp.
        </p>
      </div>

      <div className="login-role-list">
        <button
          type="button"
          className="login-role-card login-role-card--employee"
          onClick={() => navigate('/login/employee')}
        >
          <div className="login-role-icon" style={{ backgroundColor: 'var(--primary-light)' }}>
            <User size={28} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Sou funcionário</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Acesso ao fretado e rotas</p>
          </div>
        </button>

        <button
          type="button"
          className="login-role-card login-role-card--driver"
          onClick={() => navigate('/login/driver')}
        >
          <div className="login-role-icon" style={{ backgroundColor: '#f0fdf4' }}>
            <Car size={28} color="var(--secondary)" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Sou motorista</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Gestão de rota diária</p>
          </div>
        </button>

        <button
          type="button"
          className="login-role-card login-role-card--admin"
          onClick={() => navigate('/login/company')}
        >
          <div className="login-role-icon" style={{ backgroundColor: 'var(--bg-dark-secondary)' }}>
            <Building2 size={28} color="white" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Sou administrador</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Gestão de viagens e frotas</p>
          </div>
        </button>
      </div>
    </div>
  );
}
