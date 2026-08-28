import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, MapPin, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../app-context';

export default function RegionRequest() {
  const navigate = useNavigate();
  const { regions } = useAppContext();
  const [selectedRegion, setSelectedRegion] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  if (submitted) return <div className="page-transition empty-state request-success"><CheckCircle size={48} color="var(--secondary)" /><h1>Solicitação enviada</h1><p>O pedido para atuar em {selectedRegion} foi encaminhado para análise.</p><button className="btn btn-primary" type="button" onClick={() => navigate('/driver')}>Voltar à jornada</button></div>;

  return (
    <div className="page-transition">
      <button className="back-link" type="button" onClick={() => navigate(-1)}><ArrowLeft size={18} /> Voltar</button>
      <div className="section-heading"><div><span className="eyebrow">Área de atuação</span><h1>Solicitar nova região</h1><p>A mudança depende de justificativa e aprovação da empresa.</p></div></div>
      <form className="card stacked-form" onSubmit={handleSubmit}>
        <label><span><MapPin size={18} /> Nova região</span><select required value={selectedRegion} onChange={(event) => setSelectedRegion(event.target.value)}><option value="">Selecione uma região</option>{regions.map((region) => <option key={region.id} value={region.name}>{region.name} · {region.activeVans} vans ativas</option>)}</select></label>
        <label><span>Justificativa</span><textarea required value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explique o motivo da solicitação" /></label>
        <button className="btn btn-primary" type="submit"><Send size={18} /> Enviar solicitação</button>
      </form>
    </div>
  );
}

