import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Tag, 
  CheckCircle2, 
  Map, 
  ShieldAlert, 
  Bell, 
  Lock, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  Briefcase 
} from 'lucide-react';
import { useAppContext } from '../../app-context';

export default function Profile() {
  const navigate = useNavigate();
  const { currentEmployee } = useAppContext();

  const configItems = [
    { label: 'Solicitar alteração de rota', icon: <Map size={18} color="var(--primary)" />, badge: 'Em breve' },
    { label: 'Preferências de notificação', icon: <Bell size={18} color="var(--primary)" />, badge: 'Em breve' },
    { label: 'Segurança da conta', icon: <Lock size={18} color="var(--primary)" />, badge: 'Em breve' },
    { label: 'Ajuda e suporte', icon: <HelpCircle size={18} color="var(--primary)" />, badge: 'Em breve' }
  ];

  return (
    <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Meu Perfil</h1>
        <p>Configurações e informações do colaborador.</p>
      </div>

      {/* 1. Card Principal do Usuário */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            backgroundColor: 'var(--primary-light)', 
            padding: '1rem', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '60px',
            height: '60px'
          }}>
            <User size={32} color="var(--primary)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{currentEmployee.name}</h2>
              <span style={{ 
                backgroundColor: '#dcfce3', 
                color: 'var(--secondary)', 
                fontSize: '0.75rem', 
                padding: '0.2rem 0.5rem', 
                borderRadius: '1rem', 
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <CheckCircle2 size={12} /> Ativo
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{currentEmployee.company}</p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
            <Tag size={16} color="var(--text-secondary)" />
            <span style={{ color: 'var(--text-secondary)', width: '70px' }}>Chapa:</span>
            <span style={{ fontWeight: 'bold' }}>E001</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
            <Mail size={16} color="var(--text-secondary)" />
            <span style={{ color: 'var(--text-secondary)', width: '70px' }}>E-mail:</span>
            <span>ana.silva@techcorp.com</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
            <Briefcase size={16} color="var(--text-secondary)" />
            <span style={{ color: 'var(--text-secondary)', width: '70px' }}>Setor:</span>
            <span>Tecnologia</span>
          </div>
        </div>
      </div>

      {/* 2. Regras e Advertências */}
      <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
        <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
          <ShieldAlert size={20} color="var(--warning)" /> Regras de Uso
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Advertências Ativas:</span>
            <span style={{ 
              backgroundColor: 'var(--warning)', 
              color: 'white', 
              padding: '0.1rem 0.5rem', 
              borderRadius: '1rem', 
              fontSize: '0.8rem', 
              fontWeight: 'bold' 
            }}>{currentEmployee.penalties.warnings}</span>
          </div>

          <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Cancelamentos realizados no <strong>mesmo dia</strong> da viagem ou ausências não justificadas geram <strong>advertências</strong>.</li>
            <li>Alterações definitivas de rota devem ser solicitadas com pelo menos <strong>1 dia de antecedência</strong> e requerem aprovação do RH da empresa.</li>
          </ul>
        </div>
      </div>

      {/* 3. Configurações Futuras */}
      <div>
        <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>Configurações</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {configItems.map((item, index) => (
            <div 
              key={index} 
              className="card" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '0.75rem 1rem', 
                opacity: 0.8,
                cursor: 'not-allowed'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {item.icon}
                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{item.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{item.badge}</span>
                <ChevronRight size={16} color="var(--text-secondary)" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Botão de Sair */}
      <button 
        className="btn btn-danger" 
        onClick={() => navigate('/login')}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.5rem', 
          marginTop: '1rem',
          backgroundColor: 'var(--danger-light)',
          color: 'var(--danger)',
          border: '1px solid #fecaca'
        }}
      >
        <LogOut size={18} /> Sair da conta
      </button>
    </div>
  );
}

