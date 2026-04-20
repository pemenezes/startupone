import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Send, ArrowLeft } from 'lucide-react';
import { regions } from '../../data/mockData';
 
export default function RegionRequest() {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState('');
  const [reason, setReason] = useState('');
 
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Solicitação de alteração para ${selectedRegion} enviada com sucesso!`);
    navigate('/driver');
  };
 
  return (
    <div className="page-transition">
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-outline" 
        style={{ width: 'auto', marginBottom: '1.5rem', padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
      >
        <ArrowLeft size={18} /> Voltar
      </button>
 
      <h2 style={{ marginBottom: '1rem' }}>Solicitar Alteração de Região</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        A alteração de região requer justificativa e aprovação da empresa contratante.
      </p>
 
      <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <MapPin size={18} /> Nova Região
          </label>
          <select 
            value={selectedRegion} 
            onChange={(e) => setSelectedRegion(e.target.value)} 
            required 
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}
          >
            <option value="">Selecione a região...</option>
            {regions.map(r => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>
 
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Justificativa</label>
          <textarea 
            value={reason} 
            onChange={(e) => setReason(e.target.value)} 
            required 
            placeholder="Explique o motivo da alteração..." 
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', minHeight: '100px', fontFamily: 'inherit' }}
          />
        </div>
 
        <button type="submit" className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Send size={18} /> Enviar Solicitação
        </button>
      </form>
    </div>
  );
}
