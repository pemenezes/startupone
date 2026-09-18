import { Link } from 'react-router-dom';
import { useDriver } from './driver-context';
import { directionLabel } from '../../lib/schedule';
import { formatDriverDate } from '../../lib/driverSchedule';
import { DriverEmpty, DriverError, DriverLoading } from './DriverUI';

export default function HomeDriver() {
  const { journey, passengers, assignment, status, day } = useDriver();
  const route = assignment?.route;
  return <div className="page-transition driver-stack">
    <div><h1>Sua jornada</h1><p>{formatDriverDate(day)} · Horário de Brasília</p></div>
    <section className="card driver-stack">
      <span className="driver-badge">Mapa da rota</span>
      <h2>Seu caminho, parada a parada</h2>
      <p>Acompanhe as paradas e confirme o embarque dos passageiros.</p>
      <Link className="btn btn-primary" to="/driver/map">Abrir mapa interativo</Link>
    </section>
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
          <p>Responsabilidade de segunda a sexta. Os horários são previstos; a execução da viagem ainda não é registrada.</p>
          <Link className="btn btn-outline" to="/driver/claim-route">Trocar rota assumida</Link>
        </section>
        {status !== 'scheduled' ? <DriverEmpty title="Sem operação prevista hoje"><p>{status === 'future' ? `Sua atribuição começa em ${formatDriverDate(assignment.starts_on)}.` : 'A responsabilidade desta rota é de segunda a sexta.'}</p></DriverEmpty> :
          <section className="card driver-stack"><h2>Passageiros previstos hoje</h2>
            {passengers.loading ? <DriverLoading>Carregando passageiros...</DriverLoading> : passengers.error ?
              <DriverError error={passengers.error} onRetry={passengers.refresh} /> :
              <><strong className="driver-total">{passengers.data.length}</strong><p>{passengers.data.length ? 'Inscritos para hoje, descontados os cancelamentos. A contagem não indica embarques.' : 'Nenhum passageiro previsto para hoje após considerar os dias de inscrição e os cancelamentos.'}</p><Link className="btn btn-primary" to="/driver/passengers">Ver passageiros</Link></>}
          </section>}
        <button className="btn btn-outline" type="button" onClick={journey.refresh}>Atualizar jornada</button>
      </>}
  </div>;
}
