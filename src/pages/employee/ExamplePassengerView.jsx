import { ArrowLeft, BusFront, CheckCircle2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EXAMPLE_PASSENGERS, EXAMPLE_PASSENGER_ID, EXAMPLE_ROUTE, EXAMPLE_STOPS, examplePassengerStatus } from '../../lib/exampleJourney';
import { useExampleJourney } from '../../lib/useExampleJourney';
import DriverDemoMap from '../driver/DriverDemoMap';
import '../../example.css';

export default function ExamplePassengerView({ backTo = '/employee' }) {
  const state = useExampleJourney();
  const passenger = EXAMPLE_PASSENGERS.find((item) => item.id === EXAMPLE_PASSENGER_ID);
  const status = examplePassengerStatus(state, passenger.id);
  const statusLabel = status === 'boarded' ? 'Embarque confirmado' : status === 'absent' ? 'Ausência registrada' : state.startedAt ? 'Aguardando embarque' : 'Jornada ainda não iniciada';
  const selected = state.completedAt ? 4 : state.startedAt ? Math.min(EXAMPLE_STOPS.find((stop) => stop.passengerIds.some((id) => examplePassengerStatus(state, id) === 'expected'))?.id || 4, 4) : 1;
  const mapStops = EXAMPLE_STOPS.map((stop) => ({ ...stop, passengers: stop.passengerIds.map((id) => EXAMPLE_PASSENGERS.find((item) => item.id === id).name) }));

  return <div className="page-transition example-passenger-page"><Link className="example-back" to={backTo}><ArrowLeft size={20} />Voltar</Link><div className="example-heading"><div><span className="eyebrow">Visão do passageiro · exemplo</span><h1>Sua viagem</h1><p>Veja como a confirmação do motorista aparece para o passageiro.</p></div><span className="driver-badge">Dados de exemplo</span></div>
    <article className="card example-passenger-card"><header><div><small>Ida · {EXAMPLE_ROUTE.departure}</small><h2>{EXAMPLE_ROUTE.name}</h2></div><BusFront size={27} /></header><div className={`example-passenger-status is-${status}`} role="status">{status === 'boarded' ? <CheckCircle2 size={22} /> : <MapPin size={22} />}<span><strong>{statusLabel}</strong><small>{state.completedAt ? 'Jornada concluída' : state.startedAt ? 'Jornada em andamento' : 'Saída prevista para 07:30'}</small></span></div><dl className="example-passenger-details"><div><dt>Passageiro</dt><dd>{passenger.name}</dd></div><div><dt>Ponto de embarque</dt><dd>{EXAMPLE_STOPS[passenger.stopId - 1].name}</dd></div><div><dt>Motorista</dt><dd>{EXAMPLE_ROUTE.driver}</dd></div><div><dt>Veículo</dt><dd>{EXAMPLE_ROUTE.vehicle}</dd></div></dl></article>
    <section className="driver-map-panel example-passenger-map" aria-label="Mapa ilustrativo da viagem"><DriverDemoMap origin={EXAMPLE_STOPS[0].position} position={null} stops={mapStops} selected={selected} complete={Boolean(state.completedAt)} /><div className="example-map-caption"><MapPin size={16} /><span>Percurso ilustrativo. A posição da van não é transmitida ao vivo.</span></div></section>
    <p className="example-footnote">Este exemplo usa dados fictícios salvos apenas neste navegador. A jornada real e os dados do Supabase não são alterados.</p>
  </div>;
}
