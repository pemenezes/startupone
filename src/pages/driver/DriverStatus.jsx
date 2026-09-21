import { BadgeCheck, CalendarDays, CarFront, FileCheck2, ShieldCheck } from 'lucide-react';
import { DriverBack } from './DriverUI';

const documents = [
  { name: 'CNH', detail: 'Categoria D · válida até 18/04/2028' },
  { name: 'CRLV', detail: 'Veículo ABC-1D23 · exercício 2026' },
  { name: 'Autorização de transporte', detail: 'Válida até 30/11/2027' },
];

export default function DriverStatus() {
  return <div className="page-transition driver-stack driver-status-page"><DriverBack to="/driver/profile">Voltar ao perfil</DriverBack>
    <div><h1>Situação operacional</h1><p>Acompanhe seu cadastro, documentos e ocorrências.</p></div>
    <section className="card driver-status-hero"><span className="driver-profile-row-icon"><ShieldCheck size={25} /></span><div><h2>Motorista ativo</h2><p>Cadastro liberado para as jornadas da sua rota.</p></div><BadgeCheck size={23} /></section>
    <section className="driver-profile-options"><h2>Documentação</h2>{documents.map((item) => <div className="card driver-profile-row" key={item.name}><span className="driver-profile-row-icon"><FileCheck2 size={20} /></span><span><strong>{item.name}</strong><small>{item.detail}</small></span><span className="driver-badge is-boarded">Em dia</span></div>)}</section>
    <section className="card driver-status-penalties"><span className="driver-profile-row-icon"><CarFront size={22} /></span><div><h2>Ocorrências</h2><p>Nenhuma penalidade registrada.</p></div><strong>0</strong></section>
    <p className="driver-status-updated"><CalendarDays size={16} /> Situação atualizada hoje</p>
  </div>;
}
