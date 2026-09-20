import { useState } from 'react';
import { CalendarDays, ChevronDown, Clock3, MapPin, Users } from 'lucide-react';
import { DriverBack } from './DriverUI';

const trips = [
  { id: 'trip-1', daysAgo: 1, route: 'Centro → Campus Comfy', time: '06:45 – 08:10', boarded: 12, absent: 1, stops: 6, distance: '18,4 km', vehicle: 'Van Sprinter · ABC-1D23' },
  { id: 'trip-2', daysAgo: 3, route: 'Campus Comfy → Centro', time: '17:35 – 19:02', boarded: 11, absent: 2, stops: 6, distance: '19,1 km', vehicle: 'Van Sprinter · ABC-1D23' },
  { id: 'trip-3', daysAgo: 6, route: 'Centro → Campus Comfy', time: '06:47 – 08:16', boarded: 13, absent: 0, stops: 6, distance: '18,4 km', vehicle: 'Van Sprinter · ABC-1D23' },
];

function tripDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function History() {
  const [openId, setOpenId] = useState(null);
  return <div className="page-transition driver-stack driver-history-page">
    <DriverBack /><div><h1>Histórico de viagens</h1><p>Confira suas últimas jornadas e os registros de embarque.</p></div>
    <div className="driver-history-summary"><CalendarDays size={21} /><span><strong>3 viagens concluídas</strong><small>36 embarques · 3 ausências</small></span></div>
    <div className="driver-history-list">{trips.map((trip) => <article className="card driver-history-card" key={trip.id}>
      <button type="button" className="driver-history-heading" aria-expanded={openId === trip.id} onClick={() => setOpenId(openId === trip.id ? null : trip.id)}>
        <span className="driver-history-icon"><MapPin size={21} /></span><span><small>{tripDate(trip.daysAgo)}</small><strong>{trip.route}</strong></span><ChevronDown className={openId === trip.id ? 'is-open' : ''} size={19} />
      </button>
      <div className="driver-history-facts"><span><Clock3 size={15} />{trip.time}</span><span><Users size={15} />{trip.boarded} embarcados</span></div>
      {openId === trip.id && <div className="driver-history-detail">
        <div className="mobility-detail-row"><span>Situação</span><strong>Concluída</strong></div>
        <div className="mobility-detail-row"><span>Passageiros ausentes</span><strong>{trip.absent}</strong></div>
        <div className="mobility-detail-row"><span>Paradas realizadas</span><strong>{trip.stops}</strong></div>
        <div className="mobility-detail-row"><span>Distância percorrida</span><strong>{trip.distance}</strong></div>
        <div className="mobility-detail-row"><span>Veículo</span><strong>{trip.vehicle}</strong></div>
      </div>}
    </article>)}</div>
  </div>;
}
