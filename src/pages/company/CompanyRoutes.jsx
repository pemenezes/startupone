import { useEffect, useMemo, useState } from 'react';
import { latLngBounds } from 'leaflet';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import { ArrowRight, Clock3, MapPin, Navigation, Search, Users, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { PointIcon, VanIcon } from '../../components/MapMarkers';
import {
  adminEmployees, adminRoutes, ADMIN_ROUTE_STATUS, filterAdminRoutes,
  routeBoarded, routeHistory, routeOccupancy,
} from '../../data/adminDemo';

function FocusRoute({ route }) {
  const map = useMap();
  useEffect(() => {
    const positions = route?.path || adminRoutes.flatMap((item) => item.path);
    map.fitBounds(latLngBounds(positions), { padding: [32, 32], maxZoom: 13, animate: false });
  }, [map, route]);
  return null;
}

function RouteDetails({ route, onClose }) {
  const passengers = route.passengers.map((entry) => ({
    ...entry,
    employee: adminEmployees.find((employee) => employee.id === entry.id),
  }));
  const history = routeHistory(route);
  return <section className="card admin-route-details" aria-label={`Detalhes da rota ${route.id}`}><div className="admin-card-heading"><div><span className="admin-eyebrow">{route.id} · {route.region}</span><h2>{route.name}</h2><span className={`admin-status is-${route.status}`}>{ADMIN_ROUTE_STATUS[route.status]}</span></div><button type="button" className="admin-icon-button" aria-label="Fechar detalhes" onClick={onClose}><X size={20} /></button></div>
    <div className="admin-detail-grid"><div><span>Motorista</span><strong>{route.driver}</strong></div><div><span>Veículo</span><strong>{route.vehicle}</strong></div><div><span>Capacidade</span><strong>{route.capacity} lugares</strong></div><div><span>Embarcados</span><strong>{routeBoarded(route)}/{route.capacity}</strong></div><div><span>Ocupação atual</span><strong>{routeOccupancy(route)}%</strong></div><div><span>Progresso ilustrativo</span><strong>{route.progress}%</strong></div><div><span>Chegada prevista</span><strong>{route.arrival}</strong></div><div><span>Próxima parada</span><strong>{route.nextStop}</strong></div><div><span>ETA ilustrativo</span><strong>{route.etaMinutes == null ? 'Aguardando' : `${route.etaMinutes} min`}</strong></div></div>
    <div className="admin-detail-columns"><div><h3>Passageiros cadastrados</h3><ul className="admin-detail-passengers">{passengers.map((passenger) => <li key={passenger.id}><span>{passenger.employee?.name || passenger.id}</span><span className={`admin-status is-${passenger.status}`}>{passenger.status === 'boarded' ? 'Embarcado' : passenger.status === 'absent' ? 'Ausente' : 'Aguardando'}</span></li>)}</ul></div><div><h3>Ocupação nos últimos 30 dias</h3><div className="admin-history-chart" role="img" aria-label={`Histórico ilustrativo de ocupação da rota ${route.id} nos últimos 30 dias`}>{history.map((item) => <span key={item.day} title={`Dia ${item.day}: ${item.occupancy}%`} style={{ height: `${item.occupancy}%` }} />)}</div><p>{route.noShows30Days} ausência(s) registradas no período ilustrativo.</p></div></div>
  </section>;
}

export default function CompanyRoutes() {
  const [params, setParams] = useSearchParams();
  const [region, setRegion] = useState('');
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => filterAdminRoutes(adminRoutes, { region, status, query }), [region, status, query]);
  const selected = filtered.find((route) => route.id === params.get('route')) || null;
  const selectRoute = (id) => setParams(id ? { route: id } : {});
  const regions = [...new Set(adminRoutes.map((route) => route.region))].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  return <div className="page-transition admin-page"><header className="admin-page-heading"><div><span className="admin-eyebrow">Operação de exemplo</span><h1>Rotas operacionais</h1><p>Filtre as rotas e abra seus detalhes para acompanhar o cenário ilustrativo.</p></div><span className="admin-sample-badge">Dados ilustrativos</span></header>
    <section className="card admin-filters" aria-label="Filtros de rotas"><label><span>Região</span><select value={region} onChange={(event) => setRegion(event.target.value)}><option value="">Todas</option>{regions.map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Todos</option><option value="planned">Aguardando</option><option value="in_progress">Em andamento</option><option value="delayed">Atrasada</option><option value="completed">Concluída</option></select></label><label className="admin-search"><span>ID, motorista ou placa</span><div><Search size={18} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar rota" /></div></label><button type="button" className="btn btn-outline" onClick={() => { setRegion(''); setStatus(''); setQuery(''); }}>Limpar filtros</button></section>
    <div className="admin-routes-grid"><section className="admin-route-list" aria-label="Lista de rotas"><p role="status">{filtered.length} de {adminRoutes.length} rotas</p>{filtered.length ? filtered.map((route) => <button key={route.id} type="button" className={`card admin-route-card ${selected?.id === route.id ? 'is-selected' : ''}`} onClick={() => selectRoute(route.id)} aria-pressed={selected?.id === route.id}><span className="admin-route-card-title"><strong>{route.id}</strong><span className={`admin-status is-${route.status}`}>{ADMIN_ROUTE_STATUS[route.status]}</span></span><strong>{route.name}</strong><small>{route.region} · {route.driver}</small><span className="admin-route-card-meta"><span><Users size={15} />{routeBoarded(route)}/{route.capacity} embarcados</span><span><Clock3 size={15} />{route.departure}</span></span><span className="admin-progress"><span style={{ width: `${route.progress}%` }} /></span><span className="admin-route-card-footer">{route.progress}% do percurso <ArrowRight size={16} /></span></button>) : <div className="card admin-empty"><h2>Nenhuma rota encontrada</h2><p>Altere os filtros para ver outros trajetos.</p></div>}</section>
      <section className="card admin-routes-map" aria-label="Mapa das rotas"><MapContainer center={[-23.55, -46.65]} zoom={11} scrollWheelZoom={false} className="admin-map"><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />{filtered.map((route) => <Polyline key={route.id} positions={route.path} pathOptions={{ color: selected?.id === route.id ? '#004aad' : route.status === 'delayed' ? '#c45546' : '#77a7e8', weight: selected?.id === route.id ? 6 : 4, opacity: selected && selected.id !== route.id ? .35 : .85 }} eventHandlers={{ click: () => selectRoute(route.id) }} />)}{filtered.map((route) => <Marker key={route.id} position={route.position} icon={selected?.id === route.id ? VanIcon : PointIcon} title={`${route.id} · ${route.name}`} eventHandlers={{ click: () => selectRoute(route.id) }} />)}<FocusRoute route={selected} /></MapContainer><div className="admin-map-legend"><MapPin size={16} /><span>Posições e trajetos ilustrativos; sem GPS em tempo real.</span></div></section></div>
    {selected ? <RouteDetails route={selected} onClose={() => selectRoute(null)} /> : <section className="card admin-route-prompt"><Navigation size={22} /><span>Selecione uma rota na lista ou no mapa para ver motorista, passageiros, progresso e histórico.</span></section>}
  </div>;
}
