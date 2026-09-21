import { useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, Users } from 'lucide-react';
import { useDriver } from './driver-context';
import { DriverBack, DriverEmpty, DriverError, DriverLoading } from './DriverUI';
import AttendanceConfirmation from './AttendanceConfirmation';
import { attendanceCounts } from '../../lib/driverAttendanceState';
import {
  PRESENTATION_ROUTE, PRESENTATION_STOPS, presentationPassengers, presentationStopIndex,
  readPresentationJourney, subscribePresentationJourney, updatePresentationJourney,
} from '../../lib/presentationMobility';

const labelByStatus = {
  expected: 'Aguardando', boarded: 'Embarcado', absent: 'Ausente', cancelled: 'Cancelado',
};

export default function PassengerList() {
  const { journey, passengers, attendance, attendanceAction, recordAttendance, assignment, status, operationState } = useDriver();
  const presentation = useSyncExternalStore(subscribePresentationJourney, readPresentationJourney, readPresentationJourney);
  const [search, setSearch] = useState('');
  const [pending, setPending] = useState(null);
  const persisted = operationState === 'in_progress' || operationState === 'completed';
  const source = persisted ? attendance : passengers;
  const live = !journey.loading && !journey.error && assignment && status === 'scheduled' && !source.loading && !source.error && source.data?.length > 0;
  const list = live ? (source.data || []).map((person) => persisted ? {
    id: person.passenger_id, name: person.passenger_name, homeAddress: person.boarding_address || 'Endereço não informado',
    stop: person.boarding_stop?.name || 'Parada da rota', status: person.status,
  } : { ...person, stop: 'Parada da rota', status: 'expected' }) : presentationPassengers(presentation).map((person) => ({
    id: person.passenger_id, name: person.passenger_name, status: person.status,
    stop: PRESENTATION_STOPS.find((stop) => stop.id === person.boarding_stop_id)?.name || 'Parada da rota',
  }));
  const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  const filtered = list.filter((person) => normalize(person.name).includes(normalize(search.trim())));
  const counts = attendanceCounts(list);
  const nextStop = PRESENTATION_STOPS[presentationStopIndex(presentation)];

  const askAttendance = (person, nextStatus) => setPending({
    passengerId: person.id, passengerName: person.name, currentStatus: person.status, status: nextStatus,
  });
  const confirmAttendance = async () => {
    if (live) {
      const updated = await recordAttendance(pending.passengerId, pending.status);
      if (!updated) return;
    } else {
      updatePresentationJourney({ type: 'attendance', passengerId: pending.passengerId, status: pending.status });
    }
    setPending(null);
  };

  return <div className="page-transition driver-stack driver-passenger-page">
    <DriverBack /><div><h1>Passageiros de hoje</h1><p>{live ? assignment.route.name : PRESENTATION_ROUTE.name}</p></div>
    <div className="driver-passenger-summary" aria-label="Resumo dos passageiros">
      <span><strong>{counts.expected}</strong>Aguardando</span><span><strong>{counts.boarded}</strong>Embarcados</span><span><strong>{counts.absent}</strong>Ausentes</span>
    </div>
    {!live && <Link className="card driver-next-stop" to="/driver"><MapPin size={20} /><span><small>Próxima parada</small><strong>{nextStop.name}</strong></span><span>Ver mapa</span></Link>}
    <label className="driver-search"><Search size={18} /><span className="sr-only">Buscar passageiro</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar passageiro" /></label>
    <p role="status">{filtered.length} de {list.length} passageiros</p>
    {!filtered.length ? <DriverEmpty title="Nenhum resultado"><p>Tente outro nome.</p></DriverEmpty> :
      <ul className="driver-passengers">{filtered.map((person) => <li className="card driver-stack" key={person.id}>
        <div className="driver-passenger-list-heading"><div className="driver-passenger-name"><span className="driver-passenger-avatar"><Users size={17} /></span><strong>{person.name}</strong></div><span className={`driver-badge is-${person.status}`}>{labelByStatus[person.status]}</span></div>
        <p><MapPin size={15} aria-hidden="true" />{person.stop}</p>
        {person.homeAddress && <small>{person.homeAddress}</small>}
        {person.status === 'expected' && <Link className="btn btn-outline" to="/driver">Ir para a parada</Link>}
        {['boarded', 'absent'].includes(person.status) && (live ? operationState === 'in_progress' : true) && <button type="button" className="btn btn-outline" onClick={() => askAttendance(person, person.status === 'boarded' ? 'absent' : 'boarded')}>Corrigir para {person.status === 'boarded' ? 'ausente' : 'embarcado'}</button>}
      </li>)}</ul>}
    {live && source.loading && <DriverLoading>Atualizando passageiros...</DriverLoading>}
    {attendanceAction.error && <DriverError error={attendanceAction.error} />}
    {live && <button className="btn btn-outline" type="button" onClick={source.refresh}>Atualizar passageiros</button>}
    {pending && <AttendanceConfirmation pending={pending} loading={attendanceAction.loading} onClose={() => setPending(null)} onConfirm={confirmAttendance} />}
  </div>;
}
