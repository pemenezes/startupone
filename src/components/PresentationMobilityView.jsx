import { useState, useSyncExternalStore } from 'react';
import { Check, LocateFixed, MapPin, Menu, Navigation, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth-context';
import { navigationUrl } from '../lib/driverNavigation';
import { EMPLOYEE_ROUTE_OPTIONS, selectedEmployeeRoute } from '../lib/employeeRoutePreferences';
import { attendanceCounts } from '../lib/driverAttendanceState';
import { passengerJourneyCopy } from '../lib/mobilityState';
import {
  PRESENTATION_PASSENGERS, PRESENTATION_ROUTE, PRESENTATION_STOPS,
  presentationPassengers, presentationStopIndex, readPresentationJourney,
  subscribePresentationJourney, updatePresentationJourney,
} from '../lib/presentationMobility';
import AttendanceConfirmation from '../pages/driver/AttendanceConfirmation';
import DriverDemoMap from '../pages/driver/DriverDemoMap';
import BottomNav from './BottomNav';
import EmployeeMapBalance from './EmployeeMapBalance';
import EmployeeMapExtras from './EmployeeMapExtras';
import TripBottomSheet from './TripBottomSheet';

export default function PresentationMobilityView({ role, onStartJourney, startingJourney = false, journeyError }) {
  const { profile } = useAuth();
  const storedState = useSyncExternalStore(subscribePresentationJourney, readPresentationJourney, readPresentationJourney);
  const [sheetLevel, setSheetLevel] = useState('standard');
  const [pending, setPending] = useState(null);
  const isDriver = role === 'driver';
  const state = onStartJourney ? { ...storedState, arrivedStops: [], statuses: {}, completed: false, started: false } : storedState;
  const passengers = presentationPassengers(state);
  const stopIndex = presentationStopIndex(state);
  const driverStarted = onStartJourney ? false : state.started;
  const driverCompleted = onStartJourney ? false : state.completed;
  const shownRoute = isDriver ? null : selectedEmployeeRoute(profile?.id) || EMPLOYEE_ROUTE_OPTIONS[0];
  const mapStops = shownRoute?.stops || PRESENTATION_STOPS;
  const stop = mapStops[Math.min(stopIndex, mapStops.length - 1)];
  const arrived = state.arrivedStops.includes(PRESENTATION_STOPS[stopIndex]?.id);
  const atStop = passengers.filter((person) => person.boarding_stop_id === stop.id);
  const counts = attendanceCounts(passengers);
  const lastStop = mapStops[Math.max(0, state.arrivedStops.length - 1)];
  const vanPosition = state.arrivedStops.length ? lastStop?.position : shownRoute?.stops[0]?.position || [-23.5408, -46.6389];
  const passenger = passengers.find((person) => person.passenger_id === PRESENTATION_PASSENGERS[0].passenger_id);
  const passengerCopy = passengerJourneyCopy(state.completed ? { status: 'completed' } : state.started ? { status: 'in_progress' } : null, passenger);
  const nextEta = state.completed ? null : Math.max(3, 18 - stopIndex * 5);
  const startJourney = async () => {
    if (onStartJourney) {
      await onStartJourney();
      return;
    }
    updatePresentationJourney({ type: 'start' });
  };

  const confirmArrival = () => {
    updatePresentationJourney({ type: 'arrive', stopId: stop.id });
    if (!stop.destination) setSheetLevel('expanded');
  };
  const askAttendance = (person, status) => setPending({
    passengerId: person.passenger_id,
    passengerName: person.passenger_name,
    currentStatus: person.status,
    status,
  });
  const confirmAttendance = () => {
    updatePresentationJourney({ type: 'attendance', passengerId: pending.passengerId, status: pending.status });
    setPending(null);
  };

  return <div className={`page-transition mobility-page ${isDriver ? 'driver-mobility-page' : 'employee-mobility-page'}`}>
    <div className="mobility-stage">
      <section className="mobility-map" aria-label={isDriver ? 'Mapa da jornada' : 'Mapa da viagem'}>
        <DriverDemoMap origin={mapStops[0].position} position={vanPosition} stops={mapStops} selected={stop.id} complete={state.completed} sheetLevel={sheetLevel} />
      </section>
      <div className="mobility-map-top"><button className="mobility-back" type="button" aria-label="Abrir detalhes da viagem" onClick={() => setSheetLevel('expanded')}><Menu size={21} /></button><span className="mobility-route-pill">{shownRoute?.name || PRESENTATION_ROUTE.name}</span></div>
      {!isDriver && <EmployeeMapBalance />}
      <div className="mobility-map-location"><LocateFixed size={16} /><span>{isDriver ? 'Posição da van' : 'Acompanhe sua viagem'}</span></div>
      {isDriver ? <TripBottomSheet
        eyebrow={driverCompleted ? 'JORNADA CONCLUÍDA' : !driverStarted ? 'JORNADA PRONTA' : `PARADA ${stopIndex + 1} DE ${PRESENTATION_STOPS.length}`}
        title={driverCompleted ? 'Chegou ao destino' : !driverStarted ? 'Sua jornada de hoje' : stop.name}
        subtitle={driverCompleted ? 'Todos os embarques foram registrados.' : stop.destination ? 'Destino final' : arrived ? `${atStop.length} passageiro(s) nesta parada` : 'Próxima parada'}
        status={driverCompleted ? 'Concluída' : !driverStarted ? 'Prevista' : arrived ? 'Chegada confirmada' : 'Em rota'}
        level={sheetLevel}
        onLevelChange={setSheetLevel}
        action={driverCompleted
          ? <button className="btn btn-primary mobility-full-action" type="button" onClick={() => { updatePresentationJourney({ type: 'restart' }); setSheetLevel('standard'); }}>Iniciar novo percurso</button>
          : !driverStarted ? <button className="btn btn-primary mobility-full-action" type="button" onClick={startJourney} disabled={startingJourney}>{startingJourney ? 'Iniciando...' : 'Iniciar jornada'}</button>
          : <div className="mobility-actions"><a className="btn btn-outline" href={navigationUrl(stop.position)} target="_blank" rel="noopener noreferrer"><Navigation size={18} />Navegar</a>{!arrived ? <button className="btn btn-primary" type="button" onClick={confirmArrival}>{stop.destination ? 'Chegar e concluir' : 'Confirmar chegada'}</button> : <button className="btn btn-primary" type="button" onClick={() => setSheetLevel('expanded')}>Registrar passageiros</button>}</div>}
        footer={<BottomNav role="driver" embedded />}
      >
        {journeyError && <p className="driver-logout-error" role="alert">{journeyError.message}</p>}
        <div className="mobility-detail-row"><span>Rota</span><strong>{PRESENTATION_ROUTE.name}</strong></div>
        <div className="mobility-detail-row"><span>Situação</span><strong>{arrived ? 'No ponto' : 'A caminho'}</strong></div>
        <div className="mobility-detail-row"><span>Passageiros</span><strong>{counts.expected} aguardando · {counts.boarded} embarcados</strong></div>
        <Link className="btn btn-outline" to="/driver/journey">Detalhes da jornada</Link>
        {arrived && !stop.destination && <ul className="driver-boarding-list">{atStop.map((person) => <li key={person.passenger_id}><div className="driver-passenger-name"><span className="driver-passenger-avatar">{person.passenger_name.slice(0, 2).toUpperCase()}</span><strong>{person.passenger_name}</strong>{person.status !== 'expected' && <span className={`driver-attendance-status ${person.status === 'absent' ? 'is-absence' : ''}`}>{person.status === 'boarded' ? 'Embarcado' : 'Ausente'}</span>}</div>{person.status === 'expected' ? <div className="driver-boarding-actions"><button type="button" className="btn btn-primary" onClick={() => askAttendance(person, 'boarded')}><Check size={17} />Embarcou</button><button type="button" className="btn btn-outline" onClick={() => askAttendance(person, 'absent')}><X size={17} />Ausente</button></div> : <button type="button" className="btn btn-outline driver-correction-button" onClick={() => askAttendance(person, person.status === 'boarded' ? 'absent' : 'boarded')}>Corrigir registro</button>}</li>)}</ul>}
      </TripBottomSheet> : <TripBottomSheet
        eyebrow={passengerCopy.label.toUpperCase()}
        title={nextEta == null ? 'Chegou ao destino' : !state.started ? 'Sua viagem está programada' : `${nextEta} min até a próxima parada`}
        subtitle={passengerCopy.detail}
        status={state.completed ? 'Concluída' : state.started ? 'Em rota' : 'Prevista'}
        level={sheetLevel}
        onLevelChange={setSheetLevel}
        action={<div className="mobility-next-stop"><MapPin size={18} /><span><small>{state.completed ? 'Destino' : 'Próxima parada'}</small><strong>{stop.name}</strong></span></div>}
        footer={<BottomNav role="employee" embedded />}
      >
        <div className="mobility-detail-row"><span>Embarque</span><strong>{mapStops[0].name}</strong></div>
        <div className="mobility-detail-row"><span>Destino</span><strong>{mapStops.at(-1).name}</strong></div>
        <div className="mobility-detail-row"><span>Motorista</span><strong>{shownRoute?.driver.name || PRESENTATION_ROUTE.driver}</strong></div>
        <div className="mobility-detail-row"><span>Veículo</span><strong>{shownRoute?.driver.vehicle.label || PRESENTATION_ROUTE.vehicle}</strong></div>
        <div className="mobility-detail-row"><span>Situação do embarque</span><strong>{passenger.status === 'boarded' ? 'Confirmado' : passenger.status === 'absent' ? 'Ausência registrada' : 'Aguardando'}</strong></div>
        <EmployeeMapExtras />
      </TripBottomSheet>}
    </div>
    {pending && <AttendanceConfirmation pending={pending} loading={false} onClose={() => setPending(null)} onConfirm={confirmAttendance} />}
  </div>;
}
