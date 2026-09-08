import { useDriver } from './driver-context';
import { DriverBack, DriverEmpty, DriverError, DriverLoading } from './DriverUI';
export default function MapNavigation() {
  const { journey, assignment } = useDriver();
  return <div className="page-transition driver-stack"><DriverBack /><h1>Mapa da jornada</h1>
    {journey.loading ? <DriverLoading /> : journey.error ? <DriverError error={journey.error} onRetry={journey.refresh} /> :
      <DriverEmpty title="Navegação ainda indisponível"><p>{assignment ? `Rota assumida: ${assignment.route.name}.` : 'Você ainda não assumiu uma rota.'}</p><p>As paradas e a localização do veículo ainda não estão integradas. O mapa será disponibilizado quando houver dados reais do trajeto.</p></DriverEmpty>}
  </div>;
}
