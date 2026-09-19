import { useMemo, useState } from 'react';
import { Download, Search, Users, X } from 'lucide-react';
import { adminCreditTransactions, adminEmployees, adminRoutes } from '../../data/adminDemo';

function exportEmployees(rows) {
  const headers = ['ID', 'Nome', 'Departamento', 'Rota', 'Saldo ilustrativo', 'Advertências'];
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const data = [headers, ...rows.map((employee) => [employee.id, employee.name, employee.department, employee.routeId, employee.balance, employee.penalties])];
  const csv = '\ufeff' + data.map((row) => row.map(escape).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'comfy-funcionarios-exemplo.csv';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function CompanyEmployees() {
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [routeId, setRouteId] = useState('');
  const [penalty, setPenalty] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [detailId, setDetailId] = useState(null);
  const departments = [...new Set(adminEmployees.map((employee) => employee.department))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('pt-BR');
    return adminEmployees.filter((employee) =>
      (!term || [employee.id, employee.name].some((value) => value.toLocaleLowerCase('pt-BR').includes(term)))
      && (!department || employee.department === department)
      && (!routeId || employee.routeId === routeId)
      && (!penalty || (penalty === 'yes' ? employee.penalties > 0 : employee.penalties === 0))
    );
  }, [query, department, routeId, penalty]);
  const employee = adminEmployees.find((item) => item.id === detailId);
  const employeeRoute = adminRoutes.find((route) => route.id === employee?.routeId);
  const transactions = adminCreditTransactions.filter((transaction) => transaction.employeeId === detailId);
  const toggle = (id) => setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const visibleIds = filtered.map((item) => item.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  return <div className="page-transition admin-page"><header className="admin-page-heading"><div><span className="admin-eyebrow">{adminEmployees.length} cadastrados no cenário</span><h1>Funcionários</h1><p>Consulte colaboradores, rotas e advertências do exemplo administrativo.</p></div><button className="btn btn-outline" type="button" onClick={() => exportEmployees(filtered)}><Download size={17} />Exportar CSV</button></header>
    <section className="card admin-filters" aria-label="Filtros de funcionários"><label className="admin-search"><span>ID ou nome</span><div><Search size={18} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar funcionário" /></div></label><label><span>Departamento</span><select value={department} onChange={(event) => setDepartment(event.target.value)}><option value="">Todos</option>{departments.map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label><span>Rota</span><select value={routeId} onChange={(event) => setRouteId(event.target.value)}><option value="">Todas</option>{adminRoutes.map((route) => <option key={route.id} value={route.id}>{route.id}</option>)}</select></label><label><span>Penalidades</span><select value={penalty} onChange={(event) => setPenalty(event.target.value)}><option value="">Todas</option><option value="yes">Com advertência</option><option value="no">Sem advertência</option></select></label></section>
    <p className="admin-muted" role="status">{filtered.length} de {adminEmployees.length} funcionários · {selectedIds.length} selecionado(s)</p>
    <div className="card table-scroll admin-employees-table"><table className="admin-table"><thead><tr><th><input type="checkbox" aria-label="Selecionar todos os funcionários visíveis" checked={allVisibleSelected} onChange={() => setSelectedIds((current) => allVisibleSelected ? current.filter((id) => !visibleIds.includes(id)) : [...new Set([...current, ...visibleIds])])} /></th><th>ID</th><th>Nome / departamento</th><th>Rota</th><th>Crédito</th><th>Advertências</th><th>Perfil</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><input type="checkbox" aria-label={`Selecionar ${item.name}`} checked={selectedIds.includes(item.id)} onChange={() => toggle(item.id)} /></td><td>{item.id}</td><td><strong>{item.name}</strong><small>{item.department}</small></td><td>{item.routeId}</td><td>R$ {item.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td><td>{item.penalties ? `${item.penalties} advertência(s)` : 'Nenhuma'}</td><td><button type="button" className="admin-text-button" onClick={() => setDetailId(item.id)}>Ver detalhes</button></td></tr>)}{filtered.length === 0 && <tr><td colSpan="7" className="admin-empty">Nenhum funcionário encontrado.</td></tr>}</tbody></table></div>
    {employee && <section className="card admin-employee-detail" aria-label={`Perfil de ${employee.name}`}><div className="admin-card-heading"><div><span className="admin-eyebrow">Perfil ilustrativo · {employee.id}</span><h2>{employee.name}</h2></div><button className="admin-icon-button" type="button" aria-label="Fechar perfil" onClick={() => setDetailId(null)}><X size={20} /></button></div><div className="admin-detail-grid"><div><span>Departamento</span><strong>{employee.department}</strong></div><div><span>Rota atribuída</span><strong>{employeeRoute?.name || 'Sem rota'}</strong></div><div><span>Saldo ilustrativo</span><strong>R$ {employee.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div><div><span>Advertências</span><strong>{employee.penalties}</strong></div></div><h3>Viagem de hoje</h3><p>{employeeRoute?.id} · {employeeRoute?.name} · {employeeRoute?.departure}</p><h3>Movimentações de exemplo</h3>{transactions.length ? <ul className="admin-detail-passengers">{transactions.map((transaction) => <li key={transaction.id}><span>{transaction.title} · {transaction.date}</span><strong>{transaction.amount > 0 ? '+' : ''} R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></li>)}</ul> : <p className="admin-muted">Nenhuma movimentação ilustrativa para este funcionário.</p>}</section>}
    <div className="admin-footnote"><Users size={16} /><span>Cadastro, edição, suspensão e ações em massa dependerão de permissões administrativas no Supabase. Esta lista usa somente dados de exemplo.</span></div>
  </div>;
}
