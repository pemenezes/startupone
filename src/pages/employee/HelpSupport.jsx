import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, ShieldAlert } from 'lucide-react';
import { useAppContext } from '../../app-context';

const FAQ = [
  {
    q: 'Como acompanho o fretado?',
    a: 'Na aba Mapa você vê a rota ativa e o status da van, depois de escolher uma linha no onboarding.',
  },
  {
    q: 'Como cancelo uma viagem?',
    a: 'Pelo início ou pelo acompanhamento, use Cancelar. Cancelamentos no mesmo dia podem gerar advertência.',
  },
  {
    q: 'Onde vejo meus créditos?',
    a: 'Na aba Créditos você consulta o saldo, adiciona valor e acessa o histórico de uso.',
  },
];

export default function HelpSupport() {
  const navigate = useNavigate();
  const { currentEmployee } = useAppContext();
  const warnings = currentEmployee?.penalties?.warnings ?? 0;

  return (
    <div
      className="page-transition"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}
    >
      <button
        type="button"
        className="btn btn-outline"
        onClick={() => navigate('/employee/profile')}
        style={{
          width: 'auto',
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <ArrowLeft size={18} /> Voltar ao perfil
      </button>

      <div>
        <h1
          style={{
            fontSize: '1.5rem',
            marginBottom: '0.35rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <HelpCircle size={24} color="var(--primary)" /> Ajuda e suporte
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Dúvidas gerais e regras de uso do MoveCorp.
        </p>
      </div>

      <div className="card">
        <h3
          style={{
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1.05rem',
          }}
        >
          <ShieldAlert size={18} color="var(--warning)" /> Regras de uso
        </h3>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 0.75rem',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '0.75rem',
          }}
        >
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Advertências ativas</span>
          <span
            style={{
              backgroundColor: 'var(--warning)',
              color: 'white',
              padding: '0.1rem 0.5rem',
              borderRadius: '1rem',
              fontSize: '0.8rem',
              fontWeight: 'bold',
            }}
          >
            {warnings}
          </span>
        </div>

        <ul
          style={{
            paddingLeft: '1.2rem',
            margin: 0,
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
          }}
        >
          <li>
            Cancelamentos no <strong>mesmo dia</strong> da viagem ou ausências não justificadas
            geram <strong>advertências</strong>.
          </li>
          <li>
            Alterações definitivas de rota devem ser pedidas com pelo menos{' '}
            <strong>1 dia de antecedência</strong> e precisam de aprovação do RH.
          </li>
        </ul>
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem', fontSize: '1.05rem' }}>Dúvidas frequentes</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {FAQ.map((item) => (
            <div key={item.q} className="card" style={{ padding: '0.9rem 1rem' }}>
              <p style={{ margin: '0 0 0.35rem', fontWeight: 600, fontSize: '0.95rem' }}>{item.q}</p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
