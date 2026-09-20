import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, User, Car } from 'lucide-react';
import ComfyBrand from '../components/ComfyBrand';

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
        background: 'linear-gradient(180deg, var(--brand-primary-soft), var(--surface-page))',
      }}
    >
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <ComfyBrand />
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Bem-vindo</h1>
        <p
          style={{
            margin: 0,
            color: 'var(--text-primary)',
            fontSize: '1rem',
            fontWeight: 500,
          }}
        >
          Selecione seu perfil de acesso para continuar na Comfy.
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
          <div className="login-role-icon" style={{ backgroundColor: 'var(--secondary-light)' }}>
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

      <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem' }}>
        Não tem uma conta?{' '}
        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
