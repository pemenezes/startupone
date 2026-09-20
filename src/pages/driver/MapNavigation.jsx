import { useMemo, useState } from 'react';
import { Check, LocateFixed, Menu, Navigation, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { navigationUrl } from '../../lib/driverNavigation';
import { PRESENTATION_STOPS } from '../../lib/presentationMobility';
import { attendanceCounts } from '../../lib/driverAttendanceState';
import { activeStopIndex, journeyPosition, stopPosition } from '../../lib/mobility';
import { useDriver } from './driver-context';
import { DriverBack, DriverError, DriverLoading } from './DriverUI';
import { useDriverLocation } from './useDriverLocation';
import TripBottomSheet from '../../components/TripBottomSheet';
import BottomNav from '../../components/BottomNav';
import PresentationMobilityView from '../../components/PresentationMobilityView';
import AttendanceConfirmation from './AttendanceConfirmation';
import DriverDemoMap from './DriverDemoMap';

export default function MapNavigation() {
  const {
    journey: schedule, assignment, operation, operationState, operationAction,
    attendance, attendanceAction, stops: routeStops, arrivals,
    recordAttendance, startJourney, finishJourney, confirmStop,
  } = useDriver();
  const location = useDriverLocation();
  const [pending, setPending] = useState(null);
  const [sheetLevel, setSheetLevel] = useState('standard');
  const stops = useMemo(() => (routeStops.data || []).map((stop) => ({
    ...stop, position: stopPosition(stop), destination: stop.kind === 'destination',
  })).filter((stop) => stop.position), [routeStops.data]);
  const passengers = attendance.data || [];
  const activeIndex = activeStopIndex(stops, arrivals.data || [], passengers);
  const activeStop = stops[activeIndex];
  const arrived = (arrivals.data || []).some((row) => row.route_stop_id === activeStop?.id);
  const stopPassengers = passengers.filter((person) => person.boarding_stop_id === activeStop?.id && person.status !== 'cancelled');
  const counts = attendanceCounts(passengers);
  const vanPosition = location.position || journeyPosition(operation.data);

  const arrive = async () => {
    const result = await confirmStop(activeStop.id);
    if (result && !activeStop.destination) setSheetLevel('expanded');
    if (result && activeStop.destination) await finishJourney();
  };
  const confirmAttendance = async () => {
    const updated = await recordAttendance(pending.passengerId, pending.status);
    if (updated) setPending(null);
  };
  const askAttendance = (passenger, status) => setPending({
    passengerId: passenger.passenger_id, passengerName: passenger.passenger_name,
    currentStatus: passenger.status, status,
  });

  if (schedule.loading || operation.loading || attendance.loading || routeStops.loading || arrivals.loading) return <div className="driver-stack"><DriverBack /><DriverLoading>Carregando jornada e mapa...</DriverLoading></div>;
  const error = schedule.error || operation.error || attendance.error || routeStops.error || arrivals.error;
  if (error) return <PresentationMobilityView role="driver" />;
  if (!assignment) return <PresentationMobilityView role="driver" />;
  if (operationState !== 'in_progress' && operationState !== 'completed') return <PresentationMobilityView role="driver" onStartJourney={operationState === 'planned' ? startJourney : undefined} startingJourney={operationAction.loading} journeyError={operationAction.error} />;
  if (operationState === 'completed') {
    const shownStops = stops.length ? stops : PRESENTATION_STOPS;
    return <div className="page-transition mobility-page driver-mobility-page"><div className="mobility-stage">
      <section className="mobility-map" aria-label="Mapa da jornada"><DriverDemoMap origin={shownStops[0].position} position={vanPosition} stops={shownStops} selected={shownStops.at(-1).id} complete sheetLevel={sheetLevel} /></section>
      <div className="mobility-map-top"><button className="mobility-back" type="button" aria-label="Abrir detalhes da jornada" onClick={() => setSheetLevel('expanded')}><Menu size={21} /></button><span className="mobility-route-pill">{assignment.route.name}</span></div>
      <TripBottomSheet eyebrow="JORNADA CONCLUÍDA" title="Chegou ao destino" subtitle={assignment.route.destination_label || 'Percurso finalizado'} status="Concluída" level={sheetLevel} onLevelChange={setSheetLevel} action={<Link className="btn btn-primary mobility-full-action" to="/driver/journey">Ver jornada</Link>} footer={<BottomNav role="driver" embedded />}>
        <div className="mobility-detail-row"><span>Embarcados</span><strong>{counts.boarded}</strong></div>
        <div className="mobility-detail-row"><span>Ausentes</span><strong>{counts.absent}</strong></div>
        <div className="mobility-detail-row"><span>Encerrada</span><strong>{new Date(operation.data.completed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</strong></div>
      </TripBottomSheet>
    </div></div>;
  }
  if (!activeStop) return <PresentationMobilityView role="driver" />;

  return <div className="page-transition mobility-page driver-mobility-page">
    <div className="mobility-stage">
      <section className="mobility-map" aria-label="Mapa da jornada">
        <DriverDemoMap origin={stops[0].position} position={vanPosition} stops={stops} selected={activeStop.id} sheetLevel={sheetLevel} />
      </section>
      <div className="mobility-map-top"><button className="mobility-back" type="button" aria-label="Abrir detalhes da jornada" onClick={() => setSheetLevel('expanded')}><Menu size={21} /></button><span className="mobility-route-pill">{assignment.route.name}</span></div>
      <div className="mobility-map-location"><LocateFixed size={16} /><span>{location.status === 'ready' ? 'Sua posição ativa' : operation.data?.position_updated_at ? 'Última posição da jornada' : 'Rota programada'}</span>{location.status !== 'ready' && <button type="button" onClick={location.start}>Ativar GPS</button>}</div>
      <TripBottomSheet
        eyebrow={`PARADA ${activeIndex + 1} DE ${stops.length}`}
        title={activeStop.name}
        subtitle={activeStop.destination ? 'Destino final' : arrived ? `${stopPassengers.length} passageiro(s) nesta parada` : 'Próxima parada'}
        status={operation.data?.delay_minutes > 0 ? `Atraso de ${operation.data.delay_minutes} min` : arrived ? 'Chegada confirmada' : 'Em rota'}
        level={sheetLevel}
        onLevelChange={setSheetLevel}
        footer={<BottomNav role="driver" embedded />}
        action={<div className="mobility-actions"><a className="btn btn-outline" href={navigationUrl(activeStop.position)} target="_blank" rel="noopener noreferrer"><Navigation size={18} />Navegar</a>{!arrived ? <button className="btn btn-primary" type="button" onClick={arrive} disabled={operationAction.loading}>{operationAction.loading ? 'Confirmando...' : activeStop.destination ? 'Chegar e concluir' : 'Confirmar chegada'}</button> : !activeStop.destination && <button className="btn btn-primary" type="button" onClick={() => setSheetLevel('expanded')}>Registrar passageiros</button>}</div>}
      >
        <div className="mobility-detail-row"><span>Situação</span><strong>{arrived ? 'No ponto' : 'A caminho'}</strong></div>
        <div className="mobility-detail-row"><span>Passageiros</span><strong>{counts.expected} aguardando · {counts.boarded} embarcados</strong></div>
        <Link className="btn btn-outline" to="/driver/journey">Detalhes da jornada</Link>
        {arrived && !activeStop.destination && <ul className="driver-boarding-list">{stopPassengers.map((passenger) => <li key={passenger.passenger_id}>
          <div className="driver-passenger-name"><span className="driver-passenger-avatar">{passenger.passenger_name.slice(0, 2).toUpperCase()}</span><strong>{passenger.passenger_name}</strong>{passenger.status !== 'expected' && <span className={`driver-attendance-status ${passenger.status === 'absent' ? 'is-absence' : ''}`}>{passenger.status === 'boarded' ? 'Embarcado' : 'Ausente'}</span>}</div>
          {passenger.status === 'expected' ? <div className="driver-boarding-actions"><button type="button" className="btn btn-primary" onClick={() => askAttendance(passenger, 'boarded')}><Check size={17} />Embarcou</button><button type="button" className="btn btn-outline" onClick={() => askAttendance(passenger, 'absent')}><X size={17} />Ausente</button></div> : <button type="button" className="btn btn-outline driver-correction-button" onClick={() => askAttendance(passenger, passenger.status === 'boarded' ? 'absent' : 'boarded')}>Corrigir registro</button>}
        </li>)}</ul>}
        {(operationAction.error || attendanceAction.error) && <DriverError error={operationAction.error || attendanceAction.error} />}
      </TripBottomSheet>
    </div>
    {pending && <AttendanceConfirmation pending={pending} loading={attendanceAction.loading} onClose={() => setPending(null)} onConfirm={confirmAttendance} />}
  </div>;
}
