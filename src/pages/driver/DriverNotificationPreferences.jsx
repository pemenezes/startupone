import { useState } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../auth-context';
import { DriverBack } from './DriverUI';

const options = [
  { key: 'journey', title: 'Jornada', detail: 'Início, andamento e conclusão' },
  { key: 'passengers', title: 'Passageiros', detail: 'Alterações de embarque e ausências' },
  { key: 'operation', title: 'Operação', detail: 'Avisos de rota e região' },
];

export default function DriverNotificationPreferences() {
  const { profile } = useAuth();
  const key = `comfy:driver-notifications:${profile.id}`;
  const [prefs, setPrefs] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem(key)) || { journey: true, passengers: true, operation: true }; }
    catch { return { journey: true, passengers: true, operation: true }; }
  });
  const [saved, setSaved] = useState(false);
  const change = (name) => {
    const next = { ...prefs, [name]: !prefs[name] };
    setPrefs(next);
    setSaved(true);
    try { window.localStorage.setItem(key, JSON.stringify(next)); } catch { /* Visible state remains available. */ }
  };
  return <div className="page-transition driver-stack"><DriverBack to="/driver/profile">Voltar ao perfil</DriverBack>
    <div><h1>Notificações</h1><p>Escolha os avisos que deseja receber.</p></div>
    {options.map((item) => <label className="card driver-notification-option" key={item.key}><span className="driver-profile-row-icon"><Bell size={19} /></span><span><strong>{item.title}</strong><small>{item.detail}</small></span><input type="checkbox" checked={Boolean(prefs[item.key])} onChange={() => change(item.key)} /></label>)}
    {saved && <p className="driver-settings-saved" role="status"><CheckCircle2 size={18} />Preferências salvas</p>}
  </div>;
}
