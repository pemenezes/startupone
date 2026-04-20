import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, XCircle, ArrowLeft, History } from 'lucide-react';
import { useAppContext } from '../../AppContext';
 
const penaltyLevels = [
  { level: 0, label: 'Nenhum', description: 'Você está com a conta em dia!', color: 'var(--secondary)', icon: <CheckCircle size={24} /> },
  { level: 1, label: 'Leve', description: 'Aviso formal. A próxima infração resultará em suspensão.', color: 'var(--warning)', icon: <AlertCircle size={24} /> },
  { level: 2, label: 'Média', description: 'Conta suspensa por 1 dia.', color: 'var(--danger)', icon: <XCircle size={24} /> },
  { level: 3, label: 'Grave', description: 'Conta suspensa por 1 semana.', color: 'var(--danger)', icon: <XCircle size={24} /> },
  { level: 4, label: 'Muito Grave', description: 'Banimento permanente da plataforma.', color: 'black', icon: <XCircle size={24} /> },
];
 
export default function DriverStatus() {
  const navigate = useNavigate();
  const { driver } = useAppContext();
  const currentPenalty = penaltyLevels[driver.penalties.level];
 
  return (
    <div className="page-transition">
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-outline" 
        style={{ width: 'auto', marginBottom: '1.5rem', padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
      >
        <ArrowLeft size={18} /> Voltar
      </button>
 
      <h2 style={{ marginBottom: '1.5rem' }}>Status de Conformidade</h2>
 
      <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem', borderTop: `8px solid ${currentPenalty.color}` }}>
        <div style={{ display: 'flex', justifyContent: 'center', color: currentPenalty.color, marginBottom: '1rem' }}>
          {currentPenalty.icon}
        </div>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>Nível: {currentPenalty.label}</h3>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{currentPenalty.description}</p>
      </div>
 
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <History size={20} color="var(--text-secondary)" />
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Histórico de Infrações</h3>
        </div>
        
        {driver.penalties.history.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
            Nenhuma infração registrada. Continue assim!
          </div>
        ) : (
          driver.penalties.history.map((infraction, i) => (
            <div key={i} className="card" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{infraction.type}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{infraction.date}</p>
              </div>
              <span style={{ fontSize: '0.8rem', backgroundColor: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>
                {infraction.severity}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
