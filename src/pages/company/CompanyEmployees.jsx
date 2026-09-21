import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Search, X } from 'lucide-react';
import { routeLabel } from '../../data/adminDemo';
import { useCompanyData } from './company-context';

function exportEmployees(rows, routes) {
  const headers = ['ID', 'Nome', 'Departamento', 'Rota', 'Saldo', 'Advertências'];
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const data = [headers, ...rows.map((employee) => [employee.id, employee.name, employee.department, routeLabel(routes.find((route) => route.id === employee.routeId) || { id: employee.routeId || '' }), employee.balance, employee.penalties])];
  const csv = '\ufeff' + data.map((row) => row.map(escape).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'comfy-funcionarios.csv';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function RouteAssignmentPreview({ employees, routes, onClose }) {
  const dialog = useRef(null);
  const [routeId, setRouteId] = useState(routes[0]?.id || '');
  const route = routes.find((item) => item.id === routeId);
  useEffect(() => { dialog.current.showModal(); }, []);
  return <dialog ref={dialog} className="admin-dialog" aria-labelledby="assignment-preview-title" onCancel={onClose}>
    <span className="admin-eyebrow">Planejamento de equipe</span>
    <h2 id="assignment-preview-title">Prévia de atribuição de rota</h2>
    <p>{employees.length} funcionário(s) selecionado(s) para análise.</p>
    <label className="admin-preview-field">Rota de destino<select value={routeId} onChange={(event) => setRouteId(event.target.value)}>{routes.map((item) => <option key={item.id} value={item.id}>{routeLabel(item)} · {item.name}</option>)}</select></label>
    <div className="admin-preview-note">{route ? `${employees.map((person) => person.name).join(', ')} → ${route.name}.` : 'Selecione uma rota para conferir a atribuição.'}</div>
    <p className="admin-muted">Esta prévia não altera o cadastro ou a viagem dos funcionários.</p>
    <button className="btn btn-primary" type="button" onClick={onClose}>Fechar prévia</button>
  </dialog>;
}

export default function CompanyEmployees() {
  const { employees, routes, creditTransactions } = useCompanyData();
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [routeId, setRouteId] = useState('');
  const [penalty, setPenalty] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [detailId, setDetailId] = useState(null);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const departments = [...new Set(employees.map((employee) => employee.department).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('pt-BR');
    return employees.filter((employee) =>
      (!term || [employee.id, employee.name].some((value) => String(value || '').toLocaleLowerCase('pt-BR').includes(term)))
      && (!department || employee.department === department)
      && (!routeId || employee.routeId === routeId)
      && (!penalty || (penalty === 'yes' ? employee.penalties > 0 : employee.penalties === 0))
    );
  }, [employees, query, department, routeId, penalty]);
  const employee = employees.find((item) => item.id === detailId);
  const employeeRoute = routes.find((route) => route.id === employee?.routeId);
  const transactions = creditTransactions.filter((transaction) => transaction.employeeId === detailId);
  const toggle = (id) => setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const visibleIds = filtered.map((item) => item.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  return <div className="page-transition admin-page"><header className="admin-page-heading"><div><span className="admin-eyebrow">{employees.length} cadastrados</span><h1>Funcionários</h1><p>Consulte colaboradores, rotas e advertências.</p></div><button className="btn btn-outline" type="button" onClick={() => exportEmployees(filtered, routes)}><Download size={17} />Exportar CSV</button></header>
    <section className="card admin-filters" aria-label="Filtros de funcionários"><label className="admin-search"><span>ID ou nome</span><div><Search size={18} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar funcionário" /></div></label><label><span>Departamento</span><select value={department} onChange={(event) => setDepartment(event.target.value)}><option value="">Todos</option>{departments.map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label><span>Rota</span><select value={routeId} onChange={(event) => setRouteId(event.target.value)}><option value="">Todas</option>{routes.map((route) => <option key={route.id} value={route.id}>{routeLabel(route)}</option>)}</select></label><label><span>Penalidades</span><select value={penalty} onChange={(event) => setPenalty(event.target.value)}><option value="">Todas</option><option value="yes">Com advertência</option><option value="no">Sem advertência</option></select></label></section>
    <div className="admin-selection-toolbar"><p className="admin-muted" role="status">{filtered.length} de {employees.length} funcionários · {selectedIds.length} selecionado(s)</p><div><button className="btn btn-outline" type="button" disabled={!selectedIds.length} onClick={() => setSelectedIds([])}>Limpar seleção</button><button className="btn btn-primary" type="button" disabled={!selectedIds.length || !routes.length} onClick={() => setAssignmentOpen(true)}>Planejar rota para selecionados</button></div></div>
    <div className="card table-scroll admin-employees-table"><table className="admin-table"><thead><tr><th><input type="checkbox" aria-label="Selecionar todos os funcionários visíveis" checked={allVisibleSelected} onChange={() => setSelectedIds((current) => allVisibleSelected ? current.filter((id) => !visibleIds.includes(id)) : [...new Set([...current, ...visibleIds])])} /></th><th>ID</th><th>Nome / departamento</th><th>Rota</th><th>Crédito</th><th>Advertências</th><th>Perfil</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><input type="checkbox" aria-label={`Selecionar ${item.name}`} checked={selectedIds.includes(item.id)} onChange={() => toggle(item.id)} /></td><td>{item.id.slice(0, 8)}</td><td><strong>{item.name}</strong><small>{item.department || 'Sem departamento'}</small></td><td>{item.routeId ? routeLabel(routes.find((route) => route.id === item.routeId) || { id: item.routeId }) : 'Sem rota'}</td><td>R$ {item.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td><td>{item.penalties ? `${item.penalties} advertência(s)` : 'Nenhuma'}</td><td><button type="button" className="admin-text-button" onClick={() => setDetailId(item.id)}>Ver detalhes</button></td></tr>)}{filtered.length === 0 && <tr><td colSpan="7" className="admin-empty">Nenhum funcionário encontrado.</td></tr>}</tbody></table></div>
    {employee && <section className="card admin-employee-detail" aria-label={`Perfil de ${employee.name}`}><div className="admin-card-heading"><div><span className="admin-eyebrow">Perfil · {employee.id.slice(0, 8)}</span><h2>{employee.name}</h2></div><button className="admin-icon-button" type="button" aria-label="Fechar perfil" onClick={() => setDetailId(null)}><X size={20} /></button></div><div className="admin-detail-grid"><div><span>Departamento</span><strong>{employee.department || 'Sem departamento'}</strong></div><div><span>Rota atribuída</span><strong>{employeeRoute?.name || 'Sem rota'}</strong></div><div><span>Saldo</span><strong>R$ {employee.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div><div><span>Advertências</span><strong>{employee.penalties}</strong></div></div><h3>Viagem de hoje</h3><p>{employeeRoute ? `${routeLabel(employeeRoute)} · ${employeeRoute.name} · ${employeeRoute.departure}` : 'Sem viagem atribuída.'}</p><h3>Movimentações</h3>{transactions.length ? <ul className="admin-detail-passengers">{transactions.map((transaction) => <li key={transaction.id}><span>{transaction.title} · {transaction.date}</span><strong>{transaction.amount > 0 ? '+' : ''} R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></li>)}</ul> : <p className="admin-muted">Nenhuma movimentação para este funcionário.</p>}</section>}
    {assignmentOpen && <RouteAssignmentPreview employees={employees.filter((person) => selectedIds.includes(person.id))} routes={routes} onClose={() => setAssignmentOpen(false)} />}
  </div>;
}
