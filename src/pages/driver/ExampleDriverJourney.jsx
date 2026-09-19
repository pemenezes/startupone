import { useEffect, useRef, useState } from 'react';
import { Check, CheckCircle2, MapPin, Navigation, RotateCcw, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { navigationUrl } from '../../lib/driverDemo';
import {
  dispatchExampleJourney, exampleActiveStop, exampleCounts, examplePassengerStatus,
  EXAMPLE_PASSENGERS, EXAMPLE_ROUTE, EXAMPLE_STOPS,
} from '../../lib/exampleJourney';
import { useExampleJourney } from '../../lib/useExampleJourney';
import AttendanceConfirmation from './AttendanceConfirmation';
import DriverDemoMap from './DriverDemoMap';
import { DriverBack } from './DriverUI';
import '../../example.css';

function FinishExampleDialog({ pendingCount, destinationReached, onClose, onConfirm }) {
  const dialog = useRef(null);
  const cancel = useRef(null);
  useEffect(() => {
    dialog.current.showModal();
    cancel.current.focus();
  }, []);
  return <dialog ref={dialog} className="driver-confirm-dialog" aria-labelledby="example-finish-title" onCancel={onClose}>
    <span className="driver-confirm-icon"><CheckCircle2 size={26} /></span>
    <h2 id="example-finish-title">Finalizar jornada?</h2>
    <p>{pendingCount ? `Ainda há ${pendingCount} passageiro(s) aguardando confirmação.` : !destinationReached ? 'Confirme a chegada ao destino antes de finalizar.' : 'Todos os embarques foram definidos e a chegada ao destino foi confirmada.'}</p>
    <div className="driver-confirm-actions"><button ref={cancel} type="button" className="btn btn-outline" onClick={onClose}>Voltar</button><button type="button" className="btn btn-primary" onClick={onConfirm} disabled={pendingCount > 0 || !destinationReached}>Confirmar conclusão</button></div>
  </dialog>;
}

function ResetExampleDialog({ onClose, onConfirm }) {
  const dialog = useRef(null);
  const cancel = useRef(null);
  useEffect(() => {
    dialog.current.showModal();
    cancel.current.focus();
  }, []);
  return <dialog ref={dialog} className="driver-confirm-dialog" aria-labelledby="example-reset-title" onCancel={onClose}><h2 id="example-reset-title">Reiniciar o exemplo?</h2><p>Os registros ilustrativos desta apresentação serão apagados do navegador.</p><div className="driver-confirm-actions"><button ref={cancel} className="btn btn-outline" type="button" onClick={onClose}>Voltar</button><button className="btn btn-primary" type="button" onClick={onConfirm}>Reiniciar</button></div></dialog>;
}

export default function ExampleDriverJourney() {
  const state = useExampleJourney();
  const [pending, setPending] = useState(null);
  const [finishOpen, setFinishOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const activeStopId = exampleActiveStop(state);
  const activeStop = EXAMPLE_STOPS[activeStopId - 1];
  const arrived = state.arrivedStops.includes(activeStopId);
  const counts = exampleCounts(state);
  const mapStops = EXAMPLE_STOPS.map((stop) => ({ ...stop, passengers: stop.passengerIds.map((id) => EXAMPLE_PASSENGERS.find((passenger) => passenger.id === id).name) }));
  const stopPassengers = EXAMPLE_PASSENGERS.filter((passenger) => passenger.stopId === activeStopId);
  const askAttendance = (passenger, status) => setPending({
    passengerId: passenger.id, passengerName: passenger.name,
    currentStatus: examplePassengerStatus(state, passenger.id), status,
  });
  const recordAttendance = () => {
    dispatchExampleJourney({ type: 'record', passengerId: pending.passengerId, status: pending.status });
    setPending(null);
  };
  const finish = () => {
    dispatchExampleJourney({ type: 'complete' });
    setFinishOpen(false);
  };

  return <div className="page-transition driver-stack driver-example-page">
    <DriverBack /><div className="example-heading"><div><span className="eyebrow">Exemplo interativo</span><h1>{EXAMPLE_ROUTE.name}</h1><p>Uma jornada ilustrativa dentro da Comfy.</p></div><span className="driver-badge">Dados de exemplo</span></div>
    {!state.startedAt ? <section className="card driver-stack example-intro"><h2>Pronto para iniciar?</h2><p>Acompanhe as paradas, confirme embarques e veja como o passageiro recebe a informação.</p><div className="example-meta"><span>Saída prevista <strong>{EXAMPLE_ROUTE.departure}</strong></span><span>Passageiros <strong>{EXAMPLE_PASSENGERS.length}</strong></span><span>Paradas <strong>{EXAMPLE_STOPS.length}</strong></span></div><button className="btn btn-primary" type="button" onClick={() => dispatchExampleJourney({ type: 'start' })}>Iniciar jornada de exemplo</button></section> : <>
      <section className="driver-map-panel" aria-label="Mapa da jornada de exemplo"><DriverDemoMap origin={EXAMPLE_STOPS[0].position} position={null} stops={mapStops} selected={activeStopId} complete={Boolean(state.completedAt)} /><div className="example-map-caption"><MapPin size={16} /><span>Pontos ilustrativos; a navegação abre no aplicativo do dispositivo.</span></div></section>
      <div className="driver-trip-progress" aria-label={`${activeStopId - 1} de ${EXAMPLE_STOPS.length} paradas concluídas`}>{EXAMPLE_STOPS.map((stop) => <span key={stop.id} className={state.completedAt || stop.id < activeStopId ? 'is-done' : stop.id === activeStopId ? 'is-current' : ''} />)}</div>
      <div className="example-counts" aria-live="polite"><span><strong>{counts.expected}</strong>Aguardando</span><span><strong>{counts.boarded}</strong>Embarcados</span><span><strong>{counts.absent}</strong>Ausentes</span></div>
      {state.completedAt ? <section className="card driver-stack driver-complete"><CheckCircle2 size={40} /><h2>Jornada concluída</h2><p>Todos os passageiros foram atendidos e a chegada ao destino foi registrada.</p><Link className="btn btn-outline" to="/driver/example/passenger">Ver visão do passageiro</Link></section> : <section className="card driver-stack driver-current-stop"><div className="driver-stop-title"><span className="driver-stop-number">{activeStop.id}</span><div><small>{activeStop.destination ? 'DESTINO FINAL' : arrived ? 'CHEGADA CONFIRMADA' : 'PRÓXIMA PARADA'}</small><h2>{activeStop.name}</h2></div>{arrived && <CheckCircle2 size={22} />}</div><p>{activeStop.destination ? 'Confirme a chegada ao destino para encerrar o percurso.' : `${stopPassengers.length} passageiro(s) nesta parada`}</p><a className="btn btn-outline driver-navigate" href={navigationUrl(activeStop.position)} target="_blank" rel="noopener noreferrer"><Navigation size={18} />Navegar até o local</a>
        {!arrived && <button className="btn btn-primary" type="button" onClick={() => dispatchExampleJourney({ type: 'arrive', stopId: activeStopId })}><MapPin size={18} />Confirmar chegada</button>}
        {arrived && !activeStop.destination && <ul className="driver-boarding-list">{stopPassengers.map((passenger) => {
          const status = examplePassengerStatus(state, passenger.id);
          return <li key={passenger.id}><div className="driver-passenger-name"><span className="driver-passenger-avatar">{passenger.name.slice(0, 2).toUpperCase()}</span><strong>{passenger.name}</strong>{status !== 'expected' && <span className={`driver-attendance-status ${status === 'absent' ? 'is-absence' : ''}`}>{status === 'boarded' ? 'Embarcado' : 'Ausente'}</span>}</div><small>{passenger.address}</small>{status === 'expected' ? <div className="driver-boarding-actions"><button className="btn btn-primary" type="button" onClick={() => askAttendance(passenger, 'boarded')}><Check size={18} />Embarcou</button><button className="btn btn-outline" type="button" onClick={() => askAttendance(passenger, 'absent')}><X size={18} />Ausente</button></div> : <button className="btn btn-outline" type="button" onClick={() => askAttendance(passenger, status === 'boarded' ? 'absent' : 'boarded')}>Corrigir registro</button>}</li>;
        })}</ul>}
      </section>}
      <section className="card driver-stack"><div className="example-section-heading"><div><span className="eyebrow">Controle de embarque</span><h2>Passageiros da jornada</h2></div><Users size={22} /></div><ul className="example-passenger-list">{EXAMPLE_PASSENGERS.map((passenger) => {
        const status = examplePassengerStatus(state, passenger.id);
        return <li key={passenger.id}><span><strong>{passenger.name}</strong><small>{EXAMPLE_STOPS[passenger.stopId - 1].name}</small></span><span className={`driver-badge is-${status}`}>{status === 'expected' ? 'Aguardando' : status === 'boarded' ? 'Embarcado' : 'Ausente'}</span>{!state.completedAt && status !== 'expected' && <button type="button" className="example-link-button" onClick={() => askAttendance(passenger, status === 'boarded' ? 'absent' : 'boarded')}>Corrigir</button>}</li>;
      })}</ul><Link className="btn btn-outline" to="/driver/example/passenger">Ver visão do passageiro</Link></section>
      <section className="card driver-stack"><h2>Encerramento</h2><p>{counts.expected ? 'Resolva os passageiros pendentes para concluir a jornada.' : 'Todos os passageiros têm uma situação definida.'}</p><button className="btn btn-outline" type="button" onClick={() => setFinishOpen(true)}>Finalizar jornada</button></section>
      {state.history.length > 0 && <section className="card driver-stack"><h2>Histórico de registros</h2><ul className="example-history">{[...state.history].reverse().map((event, index) => <li key={`${event.at}-${index}`}><strong>{EXAMPLE_PASSENGERS.find((passenger) => passenger.id === event.passengerId)?.name}</strong><span>{event.previous === 'expected' ? 'Registro' : 'Correção'}: {event.status === 'boarded' ? 'embarcado' : 'ausente'} · {new Date(event.at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span></li>)}</ul></section>}
    </>}
    <button className="btn btn-outline example-reset" type="button" onClick={() => setResetOpen(true)}><RotateCcw size={16} />Reiniciar exemplo</button>
    {pending && <AttendanceConfirmation pending={pending} loading={false} onClose={() => setPending(null)} onConfirm={recordAttendance} />}
    {finishOpen && <FinishExampleDialog pendingCount={counts.expected} destinationReached={state.arrivedStops.includes(EXAMPLE_STOPS.length)} onClose={() => setFinishOpen(false)} onConfirm={finish} />}
    {resetOpen && <ResetExampleDialog onClose={() => setResetOpen(false)} onConfirm={() => { dispatchExampleJourney({ type: 'reset' }); setResetOpen(false); }} />}
  </div>;
}
