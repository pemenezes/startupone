import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, CarTaxiFront, Bike, ArrowLeft } from 'lucide-react';

const OPTIONS = [
  {
    id: 'app',
    title: 'App de mobilidade',
    description: 'Chame um carro sob demanda quando o fretado não estiver disponível.',
    icon: CarTaxiFront,
    color: 'var(--primary)',
    bg: 'var(--primary-light)',
  },
  {
    id: 'vt',
    title: 'Vale-transporte',
    description: 'Use créditos convertidos para ônibus e metrô da cidade.',
    icon: Bus,
    color: 'var(--secondary)',
    bg: '#f0fdf4',
  },
  {
    id: 'bike',
    title: 'Bike / micromobilidade',
    description: 'Opções curtas perto do seu ponto de embarque.',
    icon: Bike,
    color: 'var(--warning)',
    bg: '#fffbeb',
  },
];

export default function AlternativeTransport() {
  const navigate = useNavigate();

  return (
    <div className="page-transition">
      <button
        type="button"
        onClick={() => navigate('/employee')}
        className="btn btn-outline"
        style={{
          width: 'auto',
          marginBottom: '1.25rem',
          padding: '0.5rem 1rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <ArrowLeft size={18} /> Voltar
      </button>

      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>Transporte Alternativo</h1>
      <p style={{ margin: '0 0 1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
        Quando o fretado não for a melhor opção, escolha uma alternativa abaixo.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              type="button"
              className="card"
              onClick={() => alert(`${option.title}: em breve no MoveCorp.`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                textAlign: 'left',
                cursor: 'pointer',
                border: '1px solid var(--border)',
                width: '100%',
                background: 'var(--bg-secondary)',
              }}
            >
              <div
                style={{
                  backgroundColor: option.bg,
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                }}
              >
                <Icon size={24} color={option.color} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{option.title}</h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
