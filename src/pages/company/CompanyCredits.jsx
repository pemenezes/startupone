import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Wallet, Users, ReceiptText, Plus, Minus } from 'lucide-react';
import { useCompanyData } from './company-context';

function money(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function exportTransactions(rows, employees) {
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const data = [['Data', 'Funcionário', 'Tipo', 'Valor'], ...rows.map((entry) => [entry.date, employees.find((employee) => employee.id === entry.employeeId)?.name || entry.employeeId, entry.title, entry.amount])];
  const csv = '\ufeff' + data.map((row) => row.map(escape).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'comfy-extrato-corporativo.csv';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function DistributionPreview({ amount, employees, onClose }) {
  const dialog = useRef(null);
  useEffect(() => { dialog.current.showModal(); }, []);
  return <dialog ref={dialog} className="admin-dialog" aria-labelledby="distribution-title" onCancel={onClose}><span className="admin-eyebrow">Prévia de distribuição</span><h2 id="distribution-title">Revise antes de processar</h2><div className="admin-detail-grid"><div><span>Colaboradores afetados</span><strong>{employees.length}</strong></div><div><span>Crédito por pessoa</span><strong>{money(amount)}</strong></div><div><span>Valor total</span><strong>{money(amount * employees.length)}</strong></div></div><p className="admin-muted">Esta prévia não movimenta saldo. O processamento real exigirá uma operação segura e auditável no Supabase.</p><button type="button" className="btn btn-primary" onClick={onClose}>Fechar prévia</button></dialog>;
}

export default function CompanyCredits() {
  const { company, employees, creditTransactions } = useCompanyData();
  const [amount, setAmount] = useState(350);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [period, setPeriod] = useState('');
  const [showAll, setShowAll] = useState(false);
  const balances = employees.reduce((total, employee) => total + employee.balance, 0);
  const filtered = useMemo(() => creditTransactions.filter((entry) => (!employeeId || entry.employeeId === employeeId) && (!period || entry.date.startsWith(period))), [creditTransactions, employeeId, period]);
  const visible = showAll ? filtered : filtered.slice(0, 3);

  return <div className="page-transition admin-page"><header className="admin-page-heading"><div><span className="admin-eyebrow">{company.name} · Plano {company.plan}</span><h1>Créditos corporativos</h1><p>Contrato e movimentações do benefício.</p></div><button className="btn btn-outline" type="button" onClick={() => exportTransactions(filtered, employees)}><Download size={17} />Exportar CSV</button></header>
    <section className="admin-metric-grid admin-credit-metrics" aria-label="Indicadores de créditos"><article className="card admin-metric"><div><span>Valor mensal do contrato</span><Wallet size={21} /></div><strong>{money(Number(company.monthlyContract || 0))}</strong><small>Valor cadastrado no contrato</small></article><article className="card admin-metric"><div><span>Colaboradores cobertos</span><Users size={21} /></div><strong>{employees.length}</strong><small>Mesmo cadastro exibido em Funcionários</small></article><article className="card admin-metric"><div><span>Saldos disponíveis</span><ReceiptText size={21} /></div><strong>{money(balances)}</strong><small>Soma dos saldos dos colaboradores</small></article></section>
    <div className="admin-credit-grid"><section className="card admin-credit-distribution"><span className="admin-eyebrow">Planejamento</span><h2>Nova distribuição em massa</h2><p>Confira o número de colaboradores e o total antes de qualquer processamento.</p><form onSubmit={(event) => { event.preventDefault(); if (Number.isFinite(amount) && amount > 0) setPreviewOpen(true); }}><label>Crédito por colaborador (R$)<input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(Number(event.target.value))} /></label><div className="admin-preview-totals"><span>{employees.length} colaboradores</span><strong>Total: {money(Number.isFinite(amount) ? amount * employees.length : 0)}</strong></div><button className="btn btn-primary" type="submit" disabled={!Number.isFinite(amount) || amount <= 0 || employees.length === 0}>Ver prévia da distribuição</button></form><p className="admin-muted">A prévia não altera saldos.</p></section>
      <section className="card admin-credit-ledger"><div className="admin-card-heading"><div><span className="admin-eyebrow">Movimentações</span><h2>Extrato recente</h2></div><ReceiptText size={23} /></div><div className="admin-ledger-filters"><label>Período<input type="month" value={period} onChange={(event) => setPeriod(event.target.value)} /></label><label>Colaborador<select value={employeeId} onChange={(event) => setEmployeeId(event.target.value)}><option value="">Todos</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}</select></label></div><ul className="admin-ledger-list">{visible.map((entry) => { const employee = employees.find((item) => item.id === entry.employeeId); return <li key={entry.id}><span className={`admin-ledger-icon ${entry.amount < 0 ? 'is-debit' : ''}`}>{entry.amount < 0 ? <Minus size={17} /> : <Plus size={17} />}</span><span><strong>{employee?.name || entry.employeeId}</strong><small>{entry.title} · {entry.date}</small></span><strong className={entry.amount < 0 ? 'is-debit' : ''}>{entry.amount > 0 ? '+' : ''}{money(entry.amount)}</strong></li>; })}{visible.length === 0 && <li className="admin-muted">Nenhuma movimentação para os filtros selecionados.</li>}</ul>{filtered.length > 3 && <button className="admin-text-button" type="button" onClick={() => setShowAll((current) => !current)}>{showAll ? 'Mostrar menos' : `Ver todos (${filtered.length})`}</button>}</section></div>
    <p className="admin-footnote">O percentual consumido do contrato e a regra de uso mínimo de 80% serão definidos com a fórmula comercial antes de entrar nos cálculos.</p>
    {previewOpen && <DistributionPreview amount={amount} employees={employees} onClose={() => setPreviewOpen(false)} />}
  </div>;
}
