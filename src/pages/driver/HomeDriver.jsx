import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock3, MapPinned, Play, Square } from 'lucide-react';
import { useDriver } from './driver-context';
import { directionLabel } from '../../lib/schedule';
import { formatDriverDate } from '../../lib/driverSchedule';
import { formatJourneyTime } from '../../lib/driverJourneys';
import { attendanceCounts } from '../../lib/driverAttendanceState';
import { DriverEmpty, DriverError, DriverLoading } from './DriverUI';
import { exampleCounts, EXAMPLE_ROUTE } from '../../lib/exampleJourney';
import { useExampleJourney } from '../../lib/useExampleJourney';

function FinishJourneyDialog({ onClose, onConfirm, loading, pendingCount, attendanceUnavailable }) {
  const dialog = useRef(null);
  const cancel = useRef(null);

  useEffect(() => {
    dialog.current.showModal();
    cancel.current.focus();
  }, []);

  return (
    <dialog
      ref={dialog}
      className="driver-confirm-dialog"
      aria-labelledby="finish-journey-title"
      aria-describedby="finish-journey-description"
      onCancel={onClose}
    >
      <span className="driver-confirm-icon"><CheckCircle2 size={26} aria-hidden="true" /></span>
      <h2 id="finish-journey-title">Finalizar jornada?</h2>
      <p id="finish-journey-description">
        {attendanceUnavailable
          ? 'A lista de passageiros ainda não está disponível. Atualize a jornada antes de encerrar.'
          : pendingCount
          ? `Ainda há ${pendingCount} passageiro(s) aguardando confirmação. Resolva todos antes de encerrar.`
          : 'Confirme que a operação de hoje foi encerrada. A conclusão e o horário ficarão registrados.'}
      </p>
      <div className="driver-confirm-actions">
        <button ref={cancel} type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Voltar</button>
        <button type="button" className="btn btn-primary" onClick={onConfirm} disabled={loading || attendanceUnavailable || pendingCount > 0}>
          {loading ? 'Finalizando...' : 'Confirmar conclusão'}
        </button>
      </div>
    </dialog>
  );
}

function OperationCard() {
  const {
    operation,
    operationState,
    operationAction,
    attendance,
    startJourney,
    finishJourney,
  } = useDriver();
  const [confirmingFinish, setConfirmingFinish] = useState(false);
  const counts = attendanceCounts(attendance.data || []);
  const statusCopy = {
    planned: ['Jornada prevista', 'Prevista'],
    in_progress: ['Jornada em andamento', 'Em andamento'],
    completed: ['Jornada concluída', 'Concluída'],
    cancelled: ['Jornada cancelada', 'Cancelada'],
    unavailable: ['Jornada indisponível', 'Indisponível'],
  }[operationState];

  const confirmFinish = async () => {
    const result = await finishJourney();
    if (result) setConfirmingFinish(false);
  };

  if (operation.loading) return <DriverLoading>Carregando execução da jornada...</DriverLoading>;
  if (operation.error) return <DriverError error={operation.error} onRetry={operation.refresh} />;

  return (
    <section className="card driver-stack driver-operation-card" aria-label="Execução da jornada">
      <div className="driver-operation-heading">
        <div>
          <span className="eyebrow">Operação de hoje</span>
          <h2>{statusCopy[0]}</h2>
        </div>
        <span className={`driver-operation-status is-${operationState}`}>
          {statusCopy[1]}
        </span>
      </div>

      {operationState === 'planned' && (
        <>
          <p>Inicie quando estiver pronto. O andamento continuará disponível mesmo depois de atualizar ou fechar o aplicativo.</p>
          <button className="btn btn-primary" type="button" onClick={startJourney} disabled={operationAction.loading}>
            <Play size={18} aria-hidden="true" />{operationAction.loading ? 'Iniciando...' : 'Iniciar jornada'}
          </button>
        </>
      )}

      {operationState === 'in_progress' && (
        <>
          <div className="driver-operation-time"><Clock3 size={19} aria-hidden="true" /><span>Iniciada às <strong>{formatJourneyTime(operation.data.started_at)}</strong></span></div>
          {attendance.loading ? <DriverLoading>Carregando embarques...</DriverLoading> : attendance.error ? <DriverError error={attendance.error} onRetry={attendance.refresh} /> : <div className="driver-attendance-summary"><span><strong>{counts.expected}</strong> aguardando</span><span><strong>{counts.boarded}</strong> embarcados</span><span><strong>{counts.absent}</strong> ausentes</span></div>}
          <Link className="btn btn-primary" to="/driver/map">Retomar jornada</Link>
          <button className="btn btn-outline" type="button" onClick={() => setConfirmingFinish(true)} disabled={operationAction.loading}>
            <Square size={17} aria-hidden="true" />Finalizar jornada
          </button>
        </>
      )}

      {operationState === 'completed' && (
        <div className="driver-operation-time"><CheckCircle2 size={20} aria-hidden="true" /><span>Concluída às <strong>{formatJourneyTime(operation.data.completed_at)}</strong></span></div>
      )}

      {operationState === 'cancelled' && <p>Esta jornada foi cancelada e não pode ser iniciada novamente.</p>}
      {operationAction.error && <DriverError error={operationAction.error} />}
      {confirmingFinish && <FinishJourneyDialog onClose={() => setConfirmingFinish(false)} onConfirm={confirmFinish} loading={operationAction.loading} pendingCount={counts.expected} attendanceUnavailable={attendance.loading || Boolean(attendance.error)} />}
    </section>
  );
}

export default function HomeDriver() {
  const { journey, passengers, attendance, assignment, status, day, operationState } = useDriver();
  const example = useExampleJourney();
  const examplePending = exampleCounts(example).expected;
  const route = assignment?.route;
  const persisted = operationState === 'in_progress' || operationState === 'completed';
  const passengerSource = persisted ? attendance : passengers;
  const counts = attendanceCounts(attendance.data || []);

  return <div className="page-transition driver-stack">
    <div><h1>Sua jornada</h1><p>{formatDriverDate(day)} · Horário de Brasília</p></div>
    <section className="card driver-stack example-home-card" aria-label="Jornada de exemplo"><div className="example-section-heading"><div><span className="eyebrow">Exemplo interativo</span><h2>{EXAMPLE_ROUTE.name}</h2></div><MapPinned size={23} aria-hidden="true" /></div><p>{example.completedAt ? 'Jornada ilustrativa concluída. Você pode reiniciá-la para outra apresentação.' : example.startedAt ? `${examplePending} passageiro(s) aguardando. Continue de onde parou.` : 'Explore a jornada com mapa, paradas, embarques e a visão do passageiro.'}</p><Link className="btn btn-primary" to="/driver/example">{example.startedAt ? 'Abrir jornada de exemplo' : 'Explorar exemplo'}</Link></section>
    {journey.loading ? <DriverLoading>Carregando jornada...</DriverLoading> : journey.error ?
      <DriverError error={journey.error} onRetry={journey.refresh} /> : !assignment ?
      <DriverEmpty title="Nenhuma rota assumida"><p>Escolha uma empresa e uma rota para consultar sua operação de segunda a sexta.</p><Link className="btn btn-primary" to="/driver/claim-route">Assumir rota</Link></DriverEmpty> :
      <>
        <section className="card driver-stack">
          <span className="driver-badge">{directionLabel(route.direction)}</span>
          <h2>{route.name}</h2>
          <dl className="driver-details">
            <div><dt>Empresa</dt><dd>{route.company?.name || 'Não informado'}</dd></div>
            <div><dt>Saída prevista</dt><dd>{route.typical_start_time || route.estimated_arrival || 'Não informado'}</dd></div>
            <div><dt>Destino da rota</dt><dd>{route.destination_label || 'Não informado'}</dd></div>
            <div><dt>Vigência a partir de</dt><dd>{formatDriverDate(assignment.starts_on)}</dd></div>
          </dl>
          <Link className="btn btn-outline" to="/driver/claim-route">Trocar rota assumida</Link>
        </section>
        {status !== 'scheduled' && operationState !== 'in_progress' && operationState !== 'completed' ? <DriverEmpty title="Sem operação prevista hoje"><p>{status === 'future' ? `Sua atribuição começa em ${formatDriverDate(assignment.starts_on)}.` : 'A responsabilidade desta rota é de segunda a sexta.'}</p></DriverEmpty> :
          <>
            <OperationCard />
            {(status === 'scheduled' || persisted) && <section className="card driver-stack"><h2>{persisted ? 'Passageiros da jornada' : 'Passageiros previstos hoje'}</h2>
              {passengerSource.loading ? <DriverLoading>Carregando passageiros...</DriverLoading> : passengerSource.error ?
                <DriverError error={passengerSource.error} onRetry={passengerSource.refresh} /> :
                <><strong className="driver-total">{persisted ? counts.expected + counts.boarded + counts.absent : passengers.data.length}</strong><p>{persisted ? `${counts.boarded} embarcado(s), ${counts.absent} ausente(s) e ${counts.expected} aguardando confirmação.` : passengers.data.length ? 'Inscritos para hoje, descontados os cancelamentos.' : 'Nenhum passageiro previsto para hoje após considerar os dias de inscrição e os cancelamentos.'}</p><Link className="btn btn-primary" to="/driver/passengers">Ver passageiros</Link></>}
            </section>}
          </>}
        <button className="btn btn-outline" type="button" onClick={journey.refresh}>Atualizar jornada</button>
      </>}
  </div>;
}
