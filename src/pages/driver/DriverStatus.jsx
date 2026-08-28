import React from 'react';
import { AlertCircle, ArrowLeft, CheckCircle, History, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../app-context';

const penaltyLevels = [
  { label: 'Regular', description: 'Sua conta está em dia.', color: 'var(--secondary)', Icon: CheckCircle },
  { label: 'Atenção', description: 'Existe um aviso formal em acompanhamento.', color: 'var(--warning)', Icon: AlertCircle },
  { label: 'Suspensão de 1 dia', description: 'Sua conta está temporariamente suspensa.', color: 'var(--danger)', Icon: XCircle },
  { label: 'Suspensão de 1 semana', description: 'Procure a gestão responsável.', color: 'var(--danger)', Icon: XCircle },
  { label: 'Bloqueado', description: 'O acesso operacional está bloqueado.', color: 'var(--bg-dark)', Icon: XCircle },
];

export default function DriverStatus() {
  const navigate = useNavigate();
  const { driver } = useAppContext();
  const current = penaltyLevels[driver.penalties.level] || penaltyLevels[0];
  const StatusIcon = current.Icon;

  return (
    <div className="page-transition">
      <button className="back-link" type="button" onClick={() => navigate(-1)}><ArrowLeft size={18} /> Voltar</button>
      <div className="section-heading"><div><span className="eyebrow">Segurança operacional</span><h1>Status de conformidade</h1><p>Acompanhe sua situação e o histórico de ocorrências.</p></div></div>
      <article className="card compliance-card" style={{ borderTopColor: current.color }}>
        <StatusIcon size={34} color={current.color} /><div><small>Nível atual</small><h2>{current.label}</h2><p>{current.description}</p></div>
      </article>
      <div className="section-title"><History size={20} /><h2>Histórico de infrações</h2></div>
      {driver.penalties.history.length === 0 ? <div className="card empty-state"><CheckCircle size={32} color="var(--secondary)" /><strong>Nenhuma infração registrada</strong><span>Continue dirigindo com segurança.</span></div> : driver.penalties.history.map((item) => <article className="card history-row" key={`${item.date}-${item.type}`}><span><strong>{item.type}</strong><small>{item.date}</small></span><em>{item.severity}</em></article>)}
    </div>
  );
}

