import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDriver } from './driver-context';
import { DriverBack, DriverEmpty, DriverError, DriverLoading } from './DriverUI';
import AttendanceConfirmation from './AttendanceConfirmation';

const labelByStatus = {
  expected: 'Aguardando',
  boarded: 'Embarcado',
  absent: 'Ausente',
  cancelled: 'Cancelado',
};

export default function PassengerList() {
  const {
    journey, passengers, attendance, attendanceAction, recordAttendance,
    assignment, status, operationState,
  } = useDriver();
  const [search, setSearch] = useState('');
  const [pending, setPending] = useState(null);
  const persisted = operationState === 'in_progress' || operationState === 'completed';
  const source = persisted ? attendance : passengers;
  const list = (source.data || []).map((passenger) => persisted ? {
    id: passenger.passenger_id,
    name: passenger.passenger_name,
    homeAddress: passenger.boarding_address || 'Endereço não informado',
    status: passenger.status,
  } : { ...passenger, status: 'expected' });
  const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  const filtered = list.filter((passenger) => normalize(passenger.name).includes(normalize(search.trim())));

  const askAttendance = (passenger, passengerStatus) => setPending({
    passengerId: passenger.id,
    passengerName: passenger.name,
    currentStatus: passenger.status,
    status: passengerStatus,
  });
  const confirmAttendance = async () => {
    const updated = await recordAttendance(pending.passengerId, pending.status);
    if (updated) setPending(null);
  };

  return <div className="page-transition driver-stack">
    <DriverBack /><h1>Passageiros de hoje</h1>
    {journey.loading ? <DriverLoading /> : journey.error ? <DriverError error={journey.error} onRetry={journey.refresh} /> :
      !assignment ? <DriverEmpty title="Sem rota assumida"><Link className="btn btn-primary" to="/driver/claim-route">Assumir rota</Link></DriverEmpty> :
      status !== 'scheduled' && !persisted ? <DriverEmpty title="Sem operação prevista hoje"><p>Consulte a vigência e os dias da rota na jornada.</p></DriverEmpty> :
      <><h2>{assignment.route.name}</h2><p>{persisted ? 'Situação registrada na jornada. Correções ficam salvas no histórico da operação.' : 'A lista será vinculada à operação quando a jornada começar.'}</p>
        {source.loading ? <DriverLoading>Carregando passageiros...</DriverLoading> : source.error ? <DriverError error={source.error} onRetry={source.refresh} /> :
          <><label className="driver-stack">Buscar por nome<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome do passageiro" /></label>
            <p role="status">{filtered.length} de {list.length} passageiro(s)</p>
            {!list.length ? <DriverEmpty title="Nenhum passageiro previsto"><p>Não há passageiros vinculados à operação de hoje.</p></DriverEmpty> :
              !filtered.length ? <DriverEmpty title="Nenhum resultado"><p>Tente outro nome.</p></DriverEmpty> :
                <ul className="driver-passengers">{filtered.map((passenger) => <li className="card driver-stack" key={passenger.id}>
                  <div className="driver-passenger-list-heading"><strong>{passenger.name}</strong><span className={`driver-badge is-${passenger.status}`}>{labelByStatus[passenger.status]}</span></div>
                  <p>Endereço residencial: {passenger.homeAddress}</p>
                  {operationState === 'in_progress' && passenger.status === 'expected' && <Link className="btn btn-outline" to="/driver/map">Confirmar chegada na parada</Link>}
                  {operationState === 'in_progress' && ['boarded', 'absent'].includes(passenger.status) && <button type="button" className="btn btn-outline" onClick={() => askAttendance(passenger, passenger.status === 'boarded' ? 'absent' : 'boarded')}>Corrigir para {passenger.status === 'boarded' ? 'ausente' : 'embarcado'}</button>}
                </li>)}</ul>}
          </>}
        {attendanceAction.error && <DriverError error={attendanceAction.error} />}
        <button className="btn btn-outline" type="button" onClick={source.refresh} disabled={source.loading}>Atualizar passageiros</button>
      </>}
    {pending && <AttendanceConfirmation pending={pending} loading={attendanceAction.loading} onClose={() => setPending(null)} onConfirm={confirmAttendance} />}
  </div>;
}
