import { useEffect, useMemo, useState } from 'react';
import { latLngBounds } from 'leaflet';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import { ArrowRight, Clock3, MapPin, Navigation, Search, Users, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { PointIcon, VanIcon } from '../../components/MapMarkers';
import { ADMIN_ROUTE_STATUS, filterAdminRoutes, routeBoarded, routeHistory, routeLabel, routeOccupancy } from '../../data/adminDemo';
import { useCompanyData } from './company-context';

function FocusRoute({ route, routes }) {
  const map = useMap();
  useEffect(() => {
    const points = (route ? route.path : routes.flatMap((item) => item.path)).filter((point) => Array.isArray(point) && point.length === 2);
    if (points.length) map.fitBounds(latLngBounds(points), { padding: [32, 32], maxZoom: 13, animate: false });
  }, [map, route, routes]);
  return null;
}

function RouteDetails({ route, employees, onClose }) {
  const history = routeHistory(route);
  return <section className="card admin-route-details" aria-label={`Detalhes da rota ${routeLabel(route)}`}>
    <div className="admin-card-heading"><div><span className="admin-eyebrow">{routeLabel(route)} · {route.region}</span><h2>{route.name}</h2><span className={`admin-status is-${route.status}`}>{ADMIN_ROUTE_STATUS[route.status] || route.status}</span></div><button type="button" className="admin-icon-button" aria-label="Fechar detalhes" onClick={onClose}><X size={20} /></button></div>
    <div className="admin-detail-grid"><div><span>Motorista</span><strong>{route.driver || 'Não atribuído'}</strong></div><div><span>Veículo</span><strong>{route.vehicle || 'Não atribuído'}</strong></div><div><span>Capacidade</span><strong>{route.capacity} lugares</strong></div><div><span>Embarcados</span><strong>{routeBoarded(route)}/{route.capacity}</strong></div><div><span>Ocupação atual</span><strong>{routeOccupancy(route)}%</strong></div><div><span>Progresso</span><strong>{route.progress}%</strong></div><div><span>Chegada prevista</span><strong>{route.arrival || 'Aguardando'}</strong></div><div><span>Próxima parada</span><strong>{route.nextStop || 'Aguardando'}</strong></div><div><span>ETA</span><strong>{route.etaMinutes == null ? 'Aguardando' : `${route.etaMinutes} min`}</strong></div></div>
    {route.stops?.length > 0 && <div className="admin-stop-list"><h3>Paradas do percurso</h3>{route.stops.map((stop, index) => <div key={stop.id} className={`admin-stop-row ${stop.arrived ? 'is-arrived' : ''}`}><span>{index + 1}</span><strong>{stop.name}</strong><small>{stop.arrived ? 'Visitada' : 'Aguardando'}</small></div>)}</div>}
    <div className="admin-detail-columns"><div><h3>Passageiros cadastrados</h3>{route.passengers.length ? <ul className="admin-detail-passengers">{route.passengers.map((entry) => { const passenger = employees.find((employee) => employee.id === entry.id); return <li key={entry.id}><span>{passenger?.name || entry.name || entry.id}</span><span className={`admin-status is-${entry.status}`}>{entry.status === 'boarded' ? 'Embarcado' : entry.status === 'absent' ? 'Ausente' : 'Aguardando'}</span></li>; })}</ul> : <p className="admin-muted">Nenhum passageiro nesta rota.</p>}</div><div><h3>Ocupação nos últimos 30 dias</h3>{history.length ? <div className="admin-history-chart" role="img" aria-label={`Histórico de ocupação da rota ${routeLabel(route)}`}>{history.map((item) => <span key={item.day} title={`Dia ${item.day}: ${item.occupancy}%`} style={{ height: `${item.occupancy}%` }} />)}</div> : <p className="admin-muted">Ainda não há histórico de ocupação disponível.</p>}<p>{route.noShows30Days} ausência(s) registradas nos últimos 30 dias.</p></div></div>
  </section>;
}

export default function CompanyRoutes() {
  const { routes, employees } = useCompanyData();
  const [params, setParams] = useSearchParams();
  const [region, setRegion] = useState('');
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => filterAdminRoutes(routes, { region, status, query }), [routes, region, status, query]);
  const selected = filtered.find((route) => route.id === params.get('route')) || null;
  const selectRoute = (id) => setParams(id ? { route: id } : {});
  const regions = [...new Set(routes.map((route) => route.region).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const mapRoutes = filtered.filter((route) => Array.isArray(route.path) && route.path.length >= 2);
  const mapCenter = mapRoutes[0]?.path[0] || [-23.55, -46.65];

  return <div className="page-transition admin-page"><header className="admin-page-heading"><div><span className="admin-eyebrow">Operação atual</span><h1>Rotas operacionais</h1><p>Filtre as rotas e abra seus detalhes para acompanhar a operação.</p></div></header>
    <section className="card admin-filters" aria-label="Filtros de rotas"><label><span>Região</span><select value={region} onChange={(event) => setRegion(event.target.value)}><option value="">Todas</option>{regions.map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Todos</option><option value="planned">Aguardando</option><option value="in_progress">Em andamento</option><option value="delayed">Atrasada</option><option value="completed">Concluída</option><option value="cancelled">Cancelada</option></select></label><label className="admin-search"><span>ID, motorista ou placa</span><div><Search size={18} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar rota" /></div></label><button type="button" className="btn btn-outline" onClick={() => { setRegion(''); setStatus(''); setQuery(''); }}>Limpar filtros</button></section>
    <div className="admin-routes-grid"><section className="admin-route-list" aria-label="Lista de rotas"><p role="status">{filtered.length} de {routes.length} rotas</p>{filtered.length ? filtered.map((route) => <button key={route.id} type="button" className={`card admin-route-card ${selected?.id === route.id ? 'is-selected' : ''}`} onClick={() => selectRoute(route.id)} aria-pressed={selected?.id === route.id}><span className="admin-route-card-title"><strong>{routeLabel(route)}</strong><span className={`admin-status is-${route.status}`}>{ADMIN_ROUTE_STATUS[route.status] || route.status}</span></span><strong>{route.name}</strong><small>{route.region} · {route.driver || 'Motorista não atribuído'}</small><span className="admin-route-card-meta"><span><Users size={15} />{routeBoarded(route)}/{route.capacity} embarcados</span><span><Clock3 size={15} />{route.departure || 'A definir'}</span></span><span className="admin-progress"><span style={{ width: `${route.progress}%` }} /></span><span className="admin-route-card-footer">{route.progress}% do percurso <ArrowRight size={16} /></span></button>) : <div className="card admin-empty"><h2>Nenhuma rota encontrada</h2><p>Altere os filtros para ver outros trajetos.</p></div>}</section>
      <section className="card admin-routes-map" aria-label="Mapa das rotas"><MapContainer center={mapCenter} zoom={11} scrollWheelZoom={false} className="admin-map"><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />{mapRoutes.map((route) => <Polyline key={route.id} positions={route.path} pathOptions={{ color: selected?.id === route.id ? '#004aad' : route.status === 'delayed' ? '#c45546' : '#a8c6eb', weight: selected?.id === route.id ? 6 : 4, opacity: selected && selected.id !== route.id ? .35 : .85 }} eventHandlers={{ click: () => selectRoute(route.id) }} />)}{filtered.filter((route) => Array.isArray(route.position) && route.position.length === 2).map((route) => <Marker key={route.id} position={route.position} icon={selected?.id === route.id ? VanIcon : PointIcon} title={`${routeLabel(route)} · ${route.name}`} eventHandlers={{ click: () => selectRoute(route.id) }} />)}<FocusRoute route={selected} routes={filtered} /></MapContainer><div className="admin-map-legend"><MapPin size={16} /><span>Última posição registrada e percurso cadastrado.</span></div></section>
      {selected ? <RouteDetails route={selected} employees={employees} onClose={() => selectRoute(null)} /> : <section className="card admin-route-prompt"><Navigation size={22} /><span>Selecione uma rota na lista ou no mapa para ver motorista, passageiros e progresso.</span></section>}</div>
  </div>;
}
