import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Car, BusFront } from 'lucide-react';

export default function Register() {
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
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Criar conta</h1>
        <p
          style={{
            margin: 0,
            color: 'var(--text-primary)',
            fontSize: '1rem',
            fontWeight: 500,
          }}
        >
          Selecione como você quer se cadastrar no MoveCorp.
        </p>
      </div>

      <div className="login-role-list">
        <button
          type="button"
          className="login-role-card login-role-card--employee"
          onClick={() => navigate('/register/employee')}
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
          onClick={() => navigate('/register/driver')}
        >
          <div className="login-role-icon" style={{ backgroundColor: '#f0fdf4' }}>
            <Car size={28} color="var(--secondary)" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Sou motorista</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Gestão de rota diária</p>
          </div>
        </button>
      </div>

      <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem' }}>
        Já tem uma conta?{' '}
        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          Entrar
        </Link>
      </p>
    </div>
  );
}
