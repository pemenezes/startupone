import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, CheckCircle2, MapPin, Navigation, LocateFixed, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createDemoRoute, navigationUrl } from '../../lib/driverDemo';
import { attendanceCounts, firstPendingStop, groupPassengersForStops } from '../../lib/driverAttendanceState';
import { useDriver } from './driver-context';
import { DriverBack, DriverEmpty, DriverError, DriverLoading } from './DriverUI';
import { useDriverLocation } from './useDriverLocation';
import AttendanceConfirmation from './AttendanceConfirmation';
import DriverDemoMap from './DriverDemoMap';

export default function MapNavigation() {
  const {
    journey: schedule, assignment, status, operation, operationState, operationAction,
    attendance, attendanceAction, recordAttendance, finishJourney,
  } = useDriver();
  const location = useDriverLocation();
  const [lockedOrigin, setLockedOrigin] = useState(null);
  const [arrivedStop, setArrivedStop] = useState(null);
  const [pending, setPending] = useState(null);
  const heading = useRef(null);
  const origin = lockedOrigin || location.origin;
  const passengerGroups = useMemo(() => groupPassengersForStops(attendance.data || [], 3), [attendance.data]);
  const stops = useMemo(() => createDemoRoute(origin, passengerGroups), [origin, passengerGroups]);
  const activeIndex = firstPendingStop(passengerGroups);
  const activeStop = stops[activeIndex];
  const arrived = arrivedStop === activeIndex;
  const counts = attendanceCounts(attendance.data || []);
  const lockRoute = () => setLockedOrigin((current) => current || origin);

  useEffect(() => {
    requestAnimationFrame(() => heading.current?.focus());
  }, [activeIndex]);

  const arrive = async () => {
    lockRoute();
    if (activeStop.destination) {
      await finishJourney();
      return;
    }
    setArrivedStop(activeIndex);
  };

  const confirmAttendance = async () => {
    const updated = await recordAttendance(pending.passengerId, pending.status);
    if (updated) setPending(null);
  };

  const askAttendance = (passenger, passengerStatus) => setPending({
    passengerId: passenger.passenger_id,
    passengerName: passenger.passenger_name,
    currentStatus: passenger.status,
    status: passengerStatus,
  });

  if (schedule.loading) return <div className="driver-stack"><DriverBack /><DriverLoading>Carregando jornada...</DriverLoading></div>;
  if (schedule.error) return <div className="driver-stack"><DriverBack /><DriverError error={schedule.error} onRetry={schedule.refresh} /></div>;
  if (!assignment) return <div className="driver-stack"><DriverBack /><DriverEmpty title="Rota indisponível"><p>Não há uma rota atribuída para abrir no mapa.</p></DriverEmpty></div>;
  if (operation.loading) return <div className="driver-stack"><DriverBack /><DriverLoading>Carregando execução da jornada...</DriverLoading></div>;
  if (operation.error) return <div className="driver-stack"><DriverBack /><DriverError error={operation.error} onRetry={operation.refresh} /></div>;
  if (operationState === 'planned') return <div className="driver-stack"><DriverBack /><DriverEmpty title="Jornada ainda não iniciada"><p>Inicie a jornada antes de acompanhar as paradas.</p><Link className="btn btn-primary" to="/driver">Ir para a jornada</Link></DriverEmpty></div>;
  if (operationState === 'completed') return <div className="driver-stack"><DriverBack /><DriverEmpty title="Jornada concluída"><p>A operação de hoje já foi finalizada.</p></DriverEmpty></div>;
  if (status !== 'scheduled' && operationState !== 'in_progress') return <div className="driver-stack"><DriverBack /><DriverEmpty title="Rota indisponível"><p>Não há uma operação prevista para abrir no mapa hoje.</p></DriverEmpty></div>;
  if (operationState !== 'in_progress') return <div className="driver-stack"><DriverBack /><DriverEmpty title="Jornada indisponível"><p>Esta operação não pode ser acompanhada no mapa.</p></DriverEmpty></div>;
  if (attendance.loading) return <div className="driver-stack"><DriverBack /><DriverLoading>Carregando embarques...</DriverLoading></div>;
  if (attendance.error) return <div className="driver-stack"><DriverBack /><DriverError error={attendance.error} onRetry={attendance.refresh} /></div>;

  return <div className="page-transition driver-stack driver-map-page">
    <DriverBack />
    <div className="driver-route-heading"><div><small>ACOMPANHAMENTO DA VIAGEM</small><h1>Sua rota</h1></div><span className="driver-badge">Parada {activeIndex + 1} de {stops.length}</span></div>
    <section className="driver-map-panel" aria-label="Mapa interativo da rota">
      <DriverDemoMap origin={origin} position={location.position} stops={stops} selected={activeStop.id} complete={false} />
      <div className="driver-location-bar">
        <div role="status"><LocateFixed size={17} aria-hidden="true" /><span>{location.status === 'ready' ? `GPS ativo · precisão de ${Math.round(location.accuracy)} m` : location.status === 'requesting' ? 'Buscando localização…' : location.status === 'error' ? location.message : 'Localização desativada'}</span></div>
        {location.status !== 'ready' && <button type="button" className="driver-gps-button" onClick={location.start} disabled={location.status === 'requesting'}>{location.status === 'error' ? 'Tentar novamente' : 'Ativar GPS'}</button>}
      </div>
    </section>

    <div className="driver-trip-progress" aria-label={`${activeIndex} de ${stops.length} paradas concluídas`}>
      {stops.map((stop, index) => <span key={stop.id} className={index < activeIndex ? 'is-done' : index === activeIndex ? 'is-current' : ''} />)}
    </div>

    <section className="card driver-stack driver-current-stop" aria-label="Parada atual">
      <div className="driver-stop-title"><span className="driver-stop-number">{activeStop.id}</span><div><small>{activeStop.destination ? 'DESTINO FINAL' : arrived ? 'EMBARQUE LIBERADO' : 'PRÓXIMA PARADA'}</small><h2 ref={heading} tabIndex={-1}>{activeStop.name}</h2></div>{arrived && <CheckCircle2 size={22} aria-label="Chegada confirmada" />}</div>
      <p>{activeStop.destination ? 'Todos os passageiros foram atendidos. Confirme a chegada para concluir a jornada.' : `${activeStop.passengers.length} passageiro(s) nesta parada`}</p>
      <a className="btn btn-outline driver-navigate" href={navigationUrl(activeStop.position)} target="_blank" rel="noopener noreferrer" onClick={lockRoute}><Navigation size={18} aria-hidden="true" />Navegar até o local</a>
      {!arrived ? <button type="button" className="btn btn-primary" onClick={arrive} disabled={operationAction.loading}><MapPin size={18} aria-hidden="true" />{activeStop.destination && operationAction.loading ? 'Finalizando...' : 'Confirmar chegada'}</button> : <ul className="driver-boarding-list">
        {activeStop.passengers.map((passenger) => <li key={passenger.passenger_id}>
          <div className="driver-passenger-name"><span className="driver-passenger-avatar">{passenger.passenger_name.slice(0, 2).toUpperCase()}</span><strong>{passenger.passenger_name}</strong>{passenger.status !== 'expected' && <span className={`driver-attendance-status ${passenger.status === 'absent' ? 'is-absence' : ''}`}>{passenger.status === 'boarded' ? 'Embarcado' : 'Ausente'}</span>}</div>
          {passenger.status === 'expected' ? <div className="driver-boarding-actions"><button type="button" className="btn btn-primary" onClick={() => askAttendance(passenger, 'boarded')}><Check size={18} aria-hidden="true" />Embarcou</button><button type="button" className="btn btn-outline" onClick={() => askAttendance(passenger, 'absent')}><X size={18} aria-hidden="true" />Ausente</button></div> : <button type="button" className="btn btn-outline driver-correction-button" onClick={() => askAttendance(passenger, passenger.status === 'boarded' ? 'absent' : 'boarded')}>Corrigir para {passenger.status === 'boarded' ? 'ausente' : 'embarcado'}</button>}
        </li>)}
      </ul>}
    </section>
    {(operationAction.error || attendanceAction.error) && <DriverError error={operationAction.error || attendanceAction.error} />}
    <div className="driver-trip-totals" aria-live="polite"><span><strong>{counts.expected}</strong> aguardando</span><span><strong>{counts.boarded}</strong> embarcados</span><span><strong>{counts.absent}</strong> ausentes</span></div>
    {pending && <AttendanceConfirmation pending={pending} loading={attendanceAction.loading} onClose={() => setPending(null)} onConfirm={confirmAttendance} />}
  </div>;
}
