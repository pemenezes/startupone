import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, CheckCircle2, MapPin, Navigation, LocateFixed, Users, X } from 'lucide-react';
import { advanceJourney, createDemoRoute, initialJourney, navigationUrl } from '../../lib/driverDemo';
import { DriverBack } from './DriverUI';
import { useDriverLocation } from './useDriverLocation';
import DriverDemoMap from './DriverDemoMap';

function AttendanceConfirmation({ pending, onClose, onConfirm }) {
  const dialog = useRef(null);
  const cancel = useRef(null);
  useEffect(() => {
    dialog.current.showModal();
    cancel.current.focus();
  }, []);
  const boarding = pending.status === 'boarded';
  return <dialog ref={dialog} className="driver-confirm-dialog" aria-labelledby="attendance-title" aria-describedby="attendance-description" onCancel={onClose}>
    <span className={`driver-confirm-icon ${boarding ? '' : 'is-absence'}`}>{boarding ? <Users size={26} /> : <X size={26} />}</span>
    <h2 id="attendance-title">{boarding ? 'Confirmar embarque?' : 'Confirmar ausência?'}</h2>
    <p id="attendance-description">{boarding ? 'Confirmar que' : 'Confirmar a ausência de'} <strong>{pending.passenger}</strong>{boarding ? ' embarcou nesta parada?' : ' nesta parada?'}</p>
    <div className="driver-confirm-actions">
      <button ref={cancel} type="button" className="btn btn-outline" onClick={onClose}>Voltar</button>
      <button type="button" className={`btn ${boarding ? 'btn-primary' : 'driver-btn-absence'}`} onClick={onConfirm}>{boarding ? 'Confirmar embarque' : 'Confirmar ausência'}</button>
    </div>
  </dialog>;
}

export default function MapNavigation() {
  const location = useDriverLocation();
  const [lockedOrigin, setLockedOrigin] = useState(null);
  const origin = lockedOrigin || location.origin;
  const stops = useMemo(() => createDemoRoute(origin), [origin]);
  const [journey, setJourney] = useState(initialJourney);
  const [pending, setPending] = useState(null);
  const heading = useRef(null);
  const activeStop = stops[journey.index];
  const counts = Object.values(journey.attendance);
  const boarded = counts.filter((status) => status === 'boarded').length;
  const absent = counts.filter((status) => status === 'absent').length;
  const lockRoute = () => setLockedOrigin((current) => current || origin);
  const arrive = () => {
    lockRoute();
    setJourney((current) => advanceJourney(current, { type: 'arrive', stopId: activeStop.id }, stops));
  };
  const confirmAttendance = () => {
    const next = advanceJourney(journey, { type: 'attendance', ...pending }, stops);
    setJourney(next);
    setPending(null);
    if (next.index !== journey.index) requestAnimationFrame(() => heading.current?.focus());
  };

  return <div className="page-transition driver-stack driver-map-page">
    <DriverBack />
    <div className="driver-route-heading"><div><small>ACOMPANHAMENTO DA VIAGEM</small><h1>Sua rota</h1></div><span className="driver-badge">{journey.complete ? 'Concluída' : `Parada ${journey.index + 1} de ${stops.length}`}</span></div>
    <section className="driver-map-panel" aria-label="Mapa interativo da rota">
      <DriverDemoMap origin={origin} position={location.position} stops={stops} selected={activeStop.id} complete={journey.complete} />
      <div className="driver-location-bar">
        <div role="status"><LocateFixed size={17} aria-hidden="true" /><span>{location.status === 'ready' ? `GPS ativo · precisão de ${Math.round(location.accuracy)} m` : location.status === 'requesting' ? 'Buscando localização…' : location.status === 'error' ? location.message : 'Localização desativada'}</span></div>
        {location.status !== 'ready' && <button type="button" className="driver-gps-button" onClick={location.start} disabled={location.status === 'requesting'}>{location.status === 'error' ? 'Tentar novamente' : 'Ativar GPS'}</button>}
      </div>
    </section>

    <div className="driver-trip-progress" aria-label={`${journey.complete ? stops.length : journey.index} de ${stops.length} paradas concluídas`}>
      {stops.map((stop, index) => <span key={stop.id} className={journey.complete || index < journey.index ? 'is-done' : index === journey.index ? 'is-current' : ''} />)}
    </div>

    {journey.complete ? <section className="card driver-stack driver-complete" aria-label="Viagem concluída">
      <CheckCircle2 size={40} aria-hidden="true" /><h2 ref={heading} tabIndex={-1}>Você chegou ao destino</h2><p>Todas as paradas foram concluídas.</p>
      <div className="driver-trip-totals"><span><strong>{boarded}</strong> embarcados</span><span><strong>{absent}</strong> ausentes</span></div>
      <DriverBack>Voltar à jornada</DriverBack>
    </section> : <section className="card driver-stack driver-current-stop" aria-label="Parada atual">
      <div className="driver-stop-title"><span className="driver-stop-number">{activeStop.id}</span><div><small>{activeStop.destination ? 'DESTINO FINAL' : journey.arrived ? 'EMBARQUE LIBERADO' : 'PRÓXIMA PARADA'}</small><h2 ref={heading} tabIndex={-1}>{activeStop.name}</h2></div>{journey.arrived && <CheckCircle2 size={22} aria-label="Chegada confirmada" />}</div>
      <p>{activeStop.destination ? 'Confirme a chegada para concluir a viagem.' : `${activeStop.passengers.length} passageiros · ${activeStop.passengers.join(', ')}`}</p>
      <a className="btn btn-outline driver-navigate" href={navigationUrl(activeStop.position)} target="_blank" rel="noopener noreferrer" onClick={lockRoute}><Navigation size={18} aria-hidden="true" />Navegar até o local</a>
      {!journey.arrived ? <button type="button" className="btn btn-primary" onClick={arrive}><MapPin size={18} aria-hidden="true" />Confirmar chegada</button> : <ul className="driver-boarding-list">
        {activeStop.passengers.map((passenger) => {
          const status = journey.attendance[`${activeStop.id}:${passenger}`];
          return <li key={passenger}><div className="driver-passenger-name"><span className="driver-passenger-avatar">{passenger[0]}</span><strong>{passenger}</strong>{status && <span className={`driver-attendance-status ${status === 'absent' ? 'is-absence' : ''}`}>{status === 'boarded' ? 'Embarcado' : 'Ausente'}</span>}</div>
            {!status && <div className="driver-boarding-actions"><button type="button" className="btn btn-primary" aria-label={`Confirmar embarque de ${passenger}`} onClick={() => setPending({ stopId: activeStop.id, passenger, status: 'boarded' })}><Check size={18} aria-hidden="true" />Embarcou</button><button type="button" className="btn btn-outline" aria-label={`Registrar ausência de ${passenger}`} onClick={() => setPending({ stopId: activeStop.id, passenger, status: 'absent' })}><X size={18} aria-hidden="true" />Ausente</button></div>}
          </li>;
        })}
      </ul>}
    </section>}
    {!journey.complete && <div className="driver-trip-totals" aria-live="polite"><span><strong>{boarded}</strong> embarcados</span><span><strong>{absent}</strong> ausentes</span></div>}
    {pending && <AttendanceConfirmation pending={pending} onClose={() => setPending(null)} onConfirm={confirmAttendance} />}
  </div>;
}
