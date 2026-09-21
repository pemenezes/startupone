import { useState } from 'react';
import { CheckCircle2, MapPin } from 'lucide-react';
import { useAuth } from '../../auth-context';
import { DriverBack } from './DriverUI';

const regions = ['Centro', 'Zona Oeste', 'Zona Sul', 'Zona Norte', 'Zona Leste'];

export default function RegionRequest() {
  const { profile } = useAuth();
  const storageKey = `comfy:driver-region:${profile.id}`;
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem(storageKey)) || null; } catch { return null; }
  });
  const [region, setRegion] = useState(saved?.region || 'Zona Oeste');
  const [reason, setReason] = useState(saved?.reason || '');
  const save = (event) => {
    event.preventDefault();
    const request = { region, reason: reason.trim(), date: new Date().toISOString() };
    try { window.localStorage.setItem(storageKey, JSON.stringify(request)); } catch { /* Visible state remains available. */ }
    setSaved(request);
  };
  return <div className="page-transition driver-stack driver-region-page"><DriverBack to="/driver/profile">Voltar ao perfil</DriverBack>
    <div><h1>Solicitação de região</h1><p>Escolha a área onde prefere atuar.</p></div>
    <section className="card driver-region-current"><MapPin size={22} /><span><small>Região atual</small><strong>Centro e arredores</strong></span></section>
    {saved && <section className="card driver-region-saved"><CheckCircle2 size={23} /><span><strong>Solicitação registrada</strong><small>{saved.region} · {new Date(saved.date).toLocaleDateString('pt-BR')}</small></span></section>}
    <form className="card driver-stack" onSubmit={save}><h2>Nova região desejada</h2>
      <label className="driver-stack">Região<select value={region} onChange={(event) => setRegion(event.target.value)}>{regions.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="driver-stack">Motivo da solicitação<textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={240} placeholder="Conte brevemente o motivo" /></label>
      <button className="btn btn-primary" type="submit">Registrar solicitação</button>
    </form>
  </div>;
}
