import React from 'react';
import { ArrowLeft, Bike, BusFront, CarFront, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const alternatives = [
  { title: 'Transporte público', detail: 'Linhas próximas ao seu ponto de embarque', eta: '18 min', icon: <BusFront size={24} />, color: 'var(--primary)' },
  { title: 'Táxi ou aplicativo', detail: 'Embarque estimado na Praça Matriz', eta: '6 min', icon: <CarFront size={24} />, color: 'var(--secondary)' },
  { title: 'Bicicleta compartilhada', detail: 'Estação disponível a 450 metros', eta: '4 min', icon: <Bike size={24} />, color: 'var(--warning)' },
];

export default function AlternativeTransport() {
  const navigate = useNavigate();

  return (
    <div className="page-transition">
      <button className="back-link" type="button" onClick={() => navigate(-1)}><ArrowLeft size={18} /> Voltar</button>
      <div className="section-heading">
        <div><span className="eyebrow">Plano alternativo</span><h1>Outras formas de chegar</h1><p>Compare opções para quando o fretado não atender sua jornada.</p></div>
      </div>
      <div className="option-list">
        {alternatives.map(({ title, detail, eta, icon, color }) => (
          <article className="card option-card" key={title}>
            <span className="option-card__icon" style={{ color }}>{icon}</span>
            <div><h3>{title}</h3><p>{detail}</p><strong>{eta}</strong></div>
            <button type="button" aria-label={`Abrir ${title}`} onClick={() => alert(`${title} selecionado para comparação.`)}><ExternalLink size={18} /></button>
          </article>
        ))}
      </div>
    </div>
  );
}

