import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Building2, 
  Award, 
  Car, 
  Tag, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Briefcase, 
  LogOut,
  Bell,
  Check
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();

  // Mock preferences state
  const [preferences, setPreferences] = useState({
    newRoute: true,
    delayAlerts: true,
    reminders: true,
    adminMessages: true
  });

  const togglePreference = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEditCadastral = () => {
    alert("Dados Cadastrais: A alteração de CNH ou dados de contato requer envio de comprovantes e validação pelo suporte MoveCorp.");
  };

  const handleEditVehicle = () => {
    alert("Dados do Veículo: Para alterar a placa, capacidade ou modelo cadastrado, envie o CRLV atualizado para análise da diretoria de frotas.");
  };

  return (
    <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
      
      <div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Meu Perfil</h1>
        <p>Dados do condutor, veículo e conformidade.</p>
      </div>

      {/* A. Card principal do motorista */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            backgroundColor: '#dcfce3', 
            padding: '1rem', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '60px',
            height: '60px'
          }}>
            <User size={32} color="var(--secondary)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Carlos Roberto</h2>
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
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Parceiro MoveCorp</p>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '0.5rem', 
          borderTop: '1px solid var(--border)', 
          paddingTop: '1rem',
          textAlign: 'center' 
        }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Avaliação</span>
            <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.15rem', color: 'var(--warning)' }}>
              <Star fill="var(--warning)" color="var(--warning)" size={14} /> 4.8
            </div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Viagens</span>
            <div style={{ fontWeight: 'bold' }}>320</div>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Veículo</span>
            <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Van ABC-1234</div>
          </div>
        </div>
      </div>

      {/* B. Dados cadastrais do motorista */}
      <div className="card" style={{ backgroundColor: 'white' }}>
        <h3 style={{ marginBottom: '0.75rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Briefcase size={18} color="var(--secondary)" /> Dados Cadastrais
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Nome completo:</span>
            <strong>Carlos Roberto de Souza</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Telefone:</span>
            <strong>(11) 98765-4321</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>E-mail:</span>
            <strong>carlos.roberto@movecorp.com</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Nº CNH:</span>
            <strong>12345678900</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Categoria / Validade CNH:</span>
            <strong>Cat. D • 15/12/2028</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Empresa / Frota:</span>
            <strong>TransCorp Ltda.</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Tempo de Parceria:</span>
            <strong>2 anos e 4 meses</strong>
          </div>
        </div>
        <button 
          className="btn btn-outline" 
          onClick={handleEditCadastral}
          style={{ width: '100%', marginTop: '1rem', fontSize: '0.85rem', padding: '0.4rem' }}
        >
          Editar dados cadastrais
        </button>
      </div>

      {/* C. Dados do veículo */}
      <div className="card" style={{ backgroundColor: 'white' }}>
        <h3 style={{ marginBottom: '0.75rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Car size={18} color="var(--secondary)" /> Dados do Veículo
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Placa:</span>
            <strong>ABC-1234</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Modelo / Fabricante:</span>
            <strong>Mercedes-Benz Sprinter 315</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Capacidade / Ano:</span>
            <strong>15 passageiros • 2023</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Status Operacional:</span>
            <strong style={{ color: 'var(--secondary)' }}>Liberado para Rotas</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Última / Próxima Vistoria:</span>
            <strong>10/01/2026 • 10/07/2026</strong>
          </div>
        </div>
        <button 
          className="btn btn-outline" 
          onClick={handleEditVehicle}
          style={{ width: '100%', marginTop: '1rem', fontSize: '0.85rem', padding: '0.4rem' }}
        >
          Atualizar dados do veículo
        </button>
      </div>

      {/* D. Documentos e conformidade */}
      <div className="card" style={{ backgroundColor: 'white' }}>
        <h3 style={{ marginBottom: '0.75rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} color="var(--secondary)" /> Documentos e Conformidade
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Carteira Nacional de Habilitação (CNH)</span>
            <span style={{ backgroundColor: '#dcfce3', color: 'var(--secondary)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>CNH Válida</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--bg-primary)', paddingTop: '0.5rem' }}>
            <span>Documento do Veículo (CRLV)</span>
            <span style={{ backgroundColor: '#dcfce3', color: 'var(--secondary)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>Regularizado</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--bg-primary)', paddingTop: '0.5rem' }}>
            <span>Seguro APP (Acidentes Pessoais)</span>
            <span style={{ backgroundColor: '#dcfce3', color: 'var(--secondary)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>Seguro Ativo</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--bg-primary)', paddingTop: '0.5rem' }}>
            <span>Vistoria Técnica Semestral</span>
            <span style={{ backgroundColor: '#fef3c7', color: 'var(--warning)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <AlertTriangle size={12} /> Próxima Venc.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--bg-primary)', paddingTop: '0.5rem' }}>
            <span>Licenciamento Municipal (DTP)</span>
            <span style={{ backgroundColor: '#dcfce3', color: 'var(--secondary)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>Em Dia</span>
          </div>

        </div>
      </div>

      {/* E. Preferências operacionais */}
      <div className="card" style={{ backgroundColor: 'white' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SettingsIcon size={18} color="var(--secondary)" /> Preferências Operacionais
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '500' }}>Notificações de nova rota</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avisar quando for atribuída uma nova escala</p>
            </div>
            <input 
              type="checkbox" 
              checked={preferences.newRoute} 
              onChange={() => togglePreference('newRoute')}
              style={{ width: '40px', height: '20px', cursor: 'pointer', accentColor: 'var(--secondary)' }} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--bg-primary)', paddingTop: '0.75rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '500' }}>Alertas de atraso</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avisar se houver lentidão reportada na via</p>
            </div>
            <input 
              type="checkbox" 
              checked={preferences.delayAlerts} 
              onChange={() => togglePreference('delayAlerts')}
              style={{ width: '40px', height: '20px', cursor: 'pointer', accentColor: 'var(--secondary)' }} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--bg-primary)', paddingTop: '0.75rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '500' }}>Lembretes antes da jornada</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Notificar 30 minutos antes do início previsto</p>
            </div>
            <input 
              type="checkbox" 
              checked={preferences.reminders} 
              onChange={() => togglePreference('reminders')}
              style={{ width: '40px', height: '20px', cursor: 'pointer', accentColor: 'var(--secondary)' }} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--bg-primary)', paddingTop: '0.75rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '500' }}>Mensagens da empresa</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Permitir comunicados administrativos</p>
            </div>
            <input 
              type="checkbox" 
              checked={preferences.adminMessages} 
              onChange={() => togglePreference('adminMessages')}
              style={{ width: '40px', height: '20px', cursor: 'pointer', accentColor: 'var(--secondary)' }} 
            />
          </div>

        </div>
      </div>

      {/* F. Botão sair */}
      <button 
        className="btn btn-danger" 
        onClick={() => navigate('/login')}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.5rem', 
          marginTop: '0.5rem',
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

// Simple Helper component for settings icon
function SettingsIcon({ size, color }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

// Simple Helper component for Star icon
function Star({ fill, color, size }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={fill} 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

