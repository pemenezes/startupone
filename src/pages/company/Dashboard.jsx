import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, MapPin, Route as RouteIcon, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  adminSummary, criticalRoutes, routeBoarded, routeOccupancy,
  routeLabel, ADMIN_ROUTE_STATUS,
} from '../../data/adminDemo';
import { useCompanyData } from './company-context';

function AnalysisPreview({ type, routes, onClose }) {
  const dialog = useRef(null);
  useEffect(() => { dialog.current.showModal(); }, []);
  const boarded = routes.reduce((total, route) => total + routeBoarded(route), 0);
  const capacity = routes.reduce((total, route) => total + route.capacity, 0);
  return <dialog ref={dialog} className="admin-dialog" aria-labelledby="admin-preview-title" onCancel={onClose}>
    <span className="admin-eyebrow">Análise da operação</span>
    <h2 id="admin-preview-title">{type === 'merge' ? 'Unificar rotas selecionadas' : 'Reotimizar rotas selecionadas'}</h2>
    <p>{routes.map(routeLabel).join(' + ')} · {boarded} embarcados em {capacity} lugares disponíveis.</p>
    <div className="admin-preview-note">{type === 'merge' ? 'A ocupação conjunta seria de ' + (capacity ? Math.round((boarded / capacity) * 100) : 0) + '%. A viabilidade do trajeto, horários e capacidade de cada veículo ainda precisa de um algoritmo de roteirização.' : 'Estas rotas estão abaixo de 60% de ocupação. A análise operacional pode sugerir ajustes de percurso, horários ou capacidade.'}</div>
    <p className="admin-muted">Nenhuma rota será alterada por esta prévia.</p>
    <button className="btn btn-primary" type="button" onClick={onClose}>Entendi</button>
  </dialog>;
}

export default function Dashboard() {
  const { company, routes, employees, occurrences } = useCompanyData();
  const summary = adminSummary(routes, employees, occurrences);
  const critical = criticalRoutes(routes);
  const [selectedIds, setSelectedIds] = useState([]);
  const [previewType, setPreviewType] = useState(null);
  const selectedRoutes = critical.filter((route) => selectedIds.includes(route.id));
  const toggle = (id) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const noShows = routes.reduce((total, route) => total + route.noShows30Days, 0);
  const mainRoute = routes.find((route) => route.id === 'CF-01');
  const activeRoutes = routes.filter((route) => ['in_progress', 'delayed'].includes(route.status)).length;
  const boardedToday = routes.reduce((total, route) => total + routeBoarded(route), 0);
  const alertsToday = routes.filter((route) => route.status === 'delayed').length + routes.reduce((total, route) => total + (route.passengers || []).filter((person) => person.status === 'absent').length, 0);

  return <div className="page-transition admin-page">
    <header className="admin-page-heading"><div><span className="admin-eyebrow">{company.name} · Plano {company.plan}</span><h1>Visão geral</h1><p>Operação de hoje, da primeira parada ao destino.</p></div></header>

    {mainRoute && <section className="card admin-featured-route" aria-label="Rota principal"><div><span className="admin-featured-kicker"><RouteIcon size={16} />Rota em destaque · {routeLabel(mainRoute)} · {ADMIN_ROUTE_STATUS[mainRoute.status]}</span><h2>{mainRoute.name}</h2><p><MapPin size={16} />{mainRoute.status === 'completed' ? 'Percurso concluído' : `Próxima parada: ${mainRoute.nextStop}`}</p></div><div className="admin-featured-facts"><span><strong>{routeBoarded(mainRoute)}</strong> embarcados</span><span><strong>{mainRoute.todayAbsences || 0}</strong> ausentes</span><span><strong>{mainRoute.progress}%</strong> do percurso</span><span><strong>{mainRoute.status === 'planned' ? mainRoute.departure : mainRoute.status === 'completed' ? mainRoute.arrival : `${mainRoute.etaMinutes} min`}</strong>{mainRoute.status === 'planned' ? ' saída prevista' : mainRoute.status === 'completed' ? ' chegada' : ' até a próxima parada'}</span></div><Link className="btn btn-accent" to={`/company/routes?route=${mainRoute.id}`}>Acompanhar rota</Link></section>}

    <section className="admin-metric-grid" aria-label="Indicadores da operação">
      <article className="card admin-metric"><div><span>Rotas em andamento</span><RouteIcon size={21} /></div><strong>{activeRoutes}</strong><small>{summary.routes.total} cadastradas · {summary.routes.completed} concluídas</small></article>
      <article className="card admin-metric"><div><span>Passageiros embarcados hoje</span><Users size={21} /></div><strong>{boardedToday}</strong><small>{summary.employees} colaboradores cadastrados</small></article>
      <article className="card admin-metric"><div><span>Ocupação das rotas operadas</span><TrendingUp size={21} /></div><strong>{summary.occupancy}%</strong><small>Em rotas iniciadas ou concluídas</small></article>
      <article className="card admin-metric"><div><span>Ocorrências de hoje</span><AlertTriangle size={21} /></div><strong>{alertsToday}</strong><small>Atrasos e ausências confirmadas</small></article>
    </section>

    <div className="admin-dashboard-grid">
      <section className="card admin-critical-card"><div className="admin-card-heading"><div><span className="admin-eyebrow">Atenção operacional</span><h2>Rotas com baixa ocupação</h2><p>Rotas em operação ou concluídas abaixo de 60%.</p></div><div className="admin-heading-actions"><button className="btn btn-outline" type="button" disabled={selectedIds.length === 0} onClick={() => setPreviewType('optimize')}>Prévia de reotimização</button><button className="btn btn-outline" type="button" disabled={selectedIds.length < 2} onClick={() => setPreviewType('merge')}>Prévia de unificação</button></div></div>
        <div className="table-scroll"><table className="admin-table"><thead><tr><th><span className="sr-only">Selecionar</span></th><th>Rota</th><th>Motorista / horário</th><th>Situação</th><th>Ocupação</th><th>Detalhes</th></tr></thead><tbody>{critical.map((route) => <tr key={route.id}><td><input type="checkbox" aria-label={`Selecionar rota ${routeLabel(route)}`} checked={selectedIds.includes(route.id)} onChange={() => toggle(route.id)} /></td><td><strong>{routeLabel(route)}</strong><small>{route.name}</small></td><td>{route.driver}<small>Saída {route.departure}</small></td><td><span className={`admin-status is-${route.status}`}>{ADMIN_ROUTE_STATUS[route.status]}</span></td><td><strong>{routeOccupancy(route)}%</strong><small>{routeBoarded(route)}/{route.capacity} lugares</small></td><td><Link to={`/company/routes?route=${route.id}`}>Ver detalhes</Link></td></tr>)}</tbody></table></div>
      </section>
      <aside className="card admin-insights"><span className="admin-eyebrow">Análise complementar</span><h2>O que merece atenção</h2><div><strong>{critical.length}</strong><span>rotas com baixa ocupação hoje</span></div><div><strong>{noShows}</strong><span>ausências registradas nos últimos 30 dias</span></div><p>Selecione rotas para comparar possíveis ajustes de percurso e capacidade.</p><Link className="btn btn-primary" to="/company/routes">Explorar todas as rotas</Link></aside>
    </div>
    {previewType && <AnalysisPreview type={previewType} routes={selectedRoutes} onClose={() => setPreviewType(null)} />}
  </div>;
}
