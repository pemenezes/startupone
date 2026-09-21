import { useEffect, useMemo, useState } from 'react';
import { MapPin, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../../TripContext';
import { useAuth } from '../../auth-context';
import { selectedEmployeeRoute } from '../../lib/employeeRoutePreferences';
import { fetchJourneyStopArrivals, fetchRouteStops, journeyPosition, passengerJourneyCopy, stopPosition } from '../../lib/mobility';
import TripBottomSheet from '../../components/TripBottomSheet';
import BottomNav from '../../components/BottomNav';
import EmployeeMapBalance from '../../components/EmployeeMapBalance';
import EmployeeMapExtras from '../../components/EmployeeMapExtras';
import PresentationMobilityView from '../../components/PresentationMobilityView';
import DriverDemoMap from '../driver/DriverDemoMap';

export default function TrackVan() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const selectedRoute = selectedEmployeeRoute(profile?.id);
  const { todayRides, journeyStatuses } = useTrip();
  const ride = todayRides.find((item) => item.expectedToday) || todayRides[0];
  const route = ride?.route;
  const statusRow = journeyStatuses.find((item) => item.journey?.route_id === ride?.route_id);
  const journey = statusRow?.journey;
  const [stops, setStops] = useState([]);
  const [arrivals, setArrivals] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sheetLevel, setSheetLevel] = useState('standard');

  useEffect(() => {
    if (!route?.id) return;
    let alive = true;
    Promise.all([fetchRouteStops(route.id), fetchJourneyStopArrivals(journey?.id)])
      .then(([nextStops, nextArrivals]) => {
        if (alive) { setStops(nextStops); setArrivals(nextArrivals); setError(null); setLoading(false); }
      })
      .catch((nextError) => { if (alive) { setError(nextError); setLoading(false); } });
    return () => { alive = false; };
  }, [route?.id, journey?.id, journey?.position_updated_at]);

  const mapStops = useMemo(() => stops.map((stop) => ({
    ...stop, position: stopPosition(stop), destination: stop.kind === 'destination',
  })).filter((stop) => stop.position), [stops]);
  const arrivedIds = new Set(arrivals.map((arrival) => arrival.route_stop_id));
  const nextStop = mapStops.find((stop) => !arrivedIds.has(stop.id)) || mapStops.at(-1);
  const boardingStop = mapStops.find((stop) => stop.id === statusRow?.boarding_stop_id)
    || mapStops.find((stop) => stop.kind === 'boarding');
  const copy = passengerJourneyCopy(journey, ride?.cancelledToday ? { status: 'cancelled' } : statusRow);
  const eta = journey?.eta_minutes ?? (journey ? null : route?.eta_minutes);

  if (selectedRoute || !ride || !route?.id) return <PresentationMobilityView role="employee" />;
  if (loading) return <div className="card" style={{ margin: '1rem' }}>Carregando mapa da viagem...</div>;
  if (error || !mapStops.length) return <PresentationMobilityView role="employee" />;

  return <div className="page-transition mobility-page employee-mobility-page">
    <div className="mobility-stage">
      <section className="mobility-map" aria-label="Mapa da viagem">
        <DriverDemoMap origin={mapStops[0].position} position={journeyPosition(journey)} stops={mapStops} selected={nextStop?.id} complete={journey?.status === 'completed'} sheetLevel={sheetLevel} />
      </section>
      <div className="mobility-map-top"><button className="mobility-back" type="button" aria-label="Abrir detalhes da viagem" onClick={() => setSheetLevel('expanded')}><Menu size={21} /></button><span className="mobility-route-pill">{route.name}</span></div>
      <EmployeeMapBalance />
      <TripBottomSheet
        eyebrow={copy.label.toUpperCase()}
        title={eta != null && journey?.status === 'in_progress' ? `${eta} min até a próxima parada` : copy.label}
        subtitle={copy.detail}
        status={journey?.delay_minutes > 0 ? `Atraso de ${journey.delay_minutes} min` : journey?.status === 'in_progress' ? 'Em rota' : null}
        level={sheetLevel}
        onLevelChange={setSheetLevel}
        action={nextStop && <div className="mobility-next-stop"><MapPin size={18} /><span><small>{journey?.status === 'completed' ? 'Destino' : 'Próxima parada'}</small><strong>{nextStop.name}</strong></span></div>}
        footer={<BottomNav role="employee" embedded />}
      >
        <div className="mobility-detail-row"><span>Embarque</span><strong>{boardingStop?.name || route.boarding_stop}</strong></div>
        <div className="mobility-detail-row"><span>Destino</span><strong>{mapStops.at(-1)?.name || route.destination_label}</strong></div>
        <div className="mobility-detail-row"><span>Motorista</span><strong>{route.driver?.name || 'A definir'}</strong></div>
        <div className="mobility-detail-row"><span>Veículo</span><strong>{journey?.vehicle_model || route.driver?.vehicle?.label || 'Van Comfy'}{journey?.vehicle_plate ? ` · ${journey.vehicle_plate}` : ''}</strong></div>
        <div className="mobility-detail-row"><span>Situação do embarque</span><strong>{statusRow?.status === 'boarded' ? 'Confirmado' : statusRow?.status === 'absent' ? 'Ausência registrada' : ride.cancelledToday ? 'Cancelado' : 'Aguardando'}</strong></div>
        {!ride.cancelledToday && journey?.status !== 'completed' && journey?.status !== 'cancelled' && <button className="btn btn-outline" type="button" onClick={() => navigate('/employee/cancel')}>Cancelar viagem de hoje</button>}
        <EmployeeMapExtras canReview={Boolean(route.driver)} />
        {journey?.position_updated_at && <p className="mobility-updated">Posição atualizada às {new Date(journey.position_updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>}
      </TripBottomSheet>
    </div>
  </div>;
}
