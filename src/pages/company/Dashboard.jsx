import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, CircleDashed, Clock3, Route as RouteIcon, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  adminCompany, adminRoutes, adminSummary, criticalRoutes,
  routeBoarded, routeOccupancy, ADMIN_ROUTE_STATUS,
} from '../../data/adminDemo';

function AnalysisPreview({ type, routes, onClose }) {
  const dialog = useRef(null);
  useEffect(() => { dialog.current.showModal(); }, []);
  const boarded = routes.reduce((total, route) => total + routeBoarded(route), 0);
  const capacity = routes.reduce((total, route) => total + route.capacity, 0);
  return <dialog ref={dialog} className="admin-dialog" aria-labelledby="admin-preview-title" onCancel={onClose}>
    <span className="admin-eyebrow">Prévia ilustrativa</span>
    <h2 id="admin-preview-title">{type === 'merge' ? 'Unificar rotas selecionadas' : 'Reotimizar rotas selecionadas'}</h2>
    <p>{routes.map((route) => route.id).join(' + ')} · {boarded} embarcados em {capacity} lugares disponíveis.</p>
    <div className="admin-preview-note">{type === 'merge' ? 'A ocupação conjunta seria de ' + Math.round((boarded / capacity) * 100) + '%. A viabilidade do trajeto, horários e capacidade de cada veículo ainda precisa de um algoritmo de roteirização.' : 'Estas rotas estão abaixo de 60% de ocupação. A análise operacional pode sugerir ajustes de percurso, horários ou capacidade após a integração de dados reais.'}</div>
    <p className="admin-muted">Nenhuma rota será alterada por esta prévia.</p>
    <button className="btn btn-primary" type="button" onClick={onClose}>Entendi</button>
  </dialog>;
}

export default function Dashboard() {
  const summary = adminSummary();
  const critical = criticalRoutes();
  const [selectedIds, setSelectedIds] = useState([]);
  const [previewType, setPreviewType] = useState(null);
  const selectedRoutes = critical.filter((route) => selectedIds.includes(route.id));
  const toggle = (id) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const noShows = adminRoutes.reduce((total, route) => total + route.noShows30Days, 0);

  return <div className="page-transition admin-page">
    <header className="admin-page-heading"><div><span className="admin-eyebrow">{adminCompany.name} · Plano {adminCompany.plan}</span><h1>Visão geral</h1><p>Operação de exemplo para acompanhar o funcionamento da Comfy.</p></div><span className="admin-sample-badge">Dados ilustrativos</span></header>

    <section className="admin-metric-grid" aria-label="Indicadores da operação">
      <article className="card admin-metric"><div><span>Colaboradores cadastrados</span><Users size={21} /></div><strong>{summary.employees}</strong><small>Distribuídos em {summary.routes.total} rotas</small></article>
      <article className="card admin-metric"><div><span>Ocupação média total</span><TrendingUp size={21} /></div><strong>{summary.occupancy}%</strong><small>Em rotas iniciadas ou concluídas</small></article>
      <article className="card admin-metric admin-metric-routes"><div><span>Rotas de hoje</span><RouteIcon size={21} /></div><strong>{summary.routes.total}</strong><div className="admin-route-breakdown"><span><Clock3 size={14} />{summary.routes.inProgress} em andamento</span><span><CheckCircle2 size={14} />{summary.routes.completed} concluída</span><span><CircleDashed size={14} />{summary.routes.planned} aguardando</span></div></article>
      <article className="card admin-metric"><div><span>Ocorrências e atrasos</span><AlertTriangle size={21} /></div><strong>{summary.occurrences}</strong><small>Registrados no cenário ilustrativo</small></article>
    </section>

    <div className="admin-dashboard-grid">
      <section className="card admin-critical-card"><div className="admin-card-heading"><div><span className="admin-eyebrow">Atenção operacional</span><h2>Rotas críticas</h2><p>Rotas iniciadas ou concluídas com ocupação abaixo de 60%.</p></div><div className="admin-heading-actions"><button className="btn btn-outline" type="button" disabled={selectedIds.length === 0} onClick={() => setPreviewType('optimize')}>Prévia de reotimização</button><button className="btn btn-outline" type="button" disabled={selectedIds.length < 2} onClick={() => setPreviewType('merge')}>Prévia de unificação</button></div></div>
        <div className="table-scroll"><table className="admin-table"><thead><tr><th><span className="sr-only">Selecionar</span></th><th>Rota</th><th>Motorista / horário</th><th>Situação</th><th>Ocupação</th><th>Detalhes</th></tr></thead><tbody>{critical.map((route) => <tr key={route.id}><td><input type="checkbox" aria-label={`Selecionar rota ${route.id}`} checked={selectedIds.includes(route.id)} onChange={() => toggle(route.id)} /></td><td><strong>{route.id}</strong><small>{route.name}</small></td><td>{route.driver}<small>Saída {route.departure}</small></td><td><span className={`admin-status is-${route.status}`}>{ADMIN_ROUTE_STATUS[route.status]}</span></td><td><strong>{routeOccupancy(route)}%</strong><small>{routeBoarded(route)}/{route.capacity} lugares</small></td><td><Link to={`/company/routes?route=${route.id}`}>Ver detalhes</Link></td></tr>)}</tbody></table></div>
      </section>
      <aside className="card admin-insights"><span className="admin-eyebrow">Resumo do cenário</span><h2>O que merece atenção</h2><div><strong>{critical.length}</strong><span>rotas com baixa ocupação</span></div><div><strong>{noShows}</strong><span>ausências nas rotas nos últimos 30 dias</span></div><p>Selecione rotas críticas para comparar uma possível reotimização ou unificação. A prévia não altera a operação.</p><Link className="btn btn-primary" to="/company/routes">Explorar todas as rotas</Link></aside>
    </div>
    {previewType && <AnalysisPreview type={previewType} routes={selectedRoutes} onClose={() => setPreviewType(null)} />}
  </div>;
}
