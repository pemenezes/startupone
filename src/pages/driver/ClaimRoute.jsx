import { useCallback, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth-context';
import { fetchCompanies } from '../../lib/companies';
import { fetchClaimableRoutes } from '../../lib/routes';
import { claimDriverRoute } from '../../lib/assignments';
import { directionLabel } from '../../lib/schedule';
import { useDriver } from './driver-context';
import { useDriverResource } from './useDriverResource';
import { DriverBack, DriverEmpty, DriverError, DriverLoading } from './DriverUI';

function CompanyRoutes({ companyId, onBusy }) {
  const { profile } = useAuth();
  const { journey } = useDriver();
  const navigate = useNavigate();
  const load = useCallback(() => fetchClaimableRoutes(companyId), [companyId]);
  const resource = useDriverResource(load);
  const lock = useRef(false);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState(null);
  const handleClaim = async (routeId) => {
    if (lock.current) return;
    lock.current = true;
    setSaving(routeId);
    setError(null);
    onBusy(true);
    try {
      await claimDriverRoute(profile.id, routeId);
      journey.refresh();
      navigate('/driver', { replace: true });
    } catch (err) {
      setError(err);
      resource.refresh();
      journey.refresh();
    } finally {
      lock.current = false;
      setSaving('');
      onBusy(false);
    }
  };
  return <div className="driver-stack">
    {error && <><DriverError error={error} /><Link to="/driver">Conferir minha jornada</Link></>}
    {resource.loading ? <DriverLoading>Consultando disponibilidade...</DriverLoading> :
      resource.error ? <DriverError error={resource.error} onRetry={resource.refresh} /> :
      !resource.data.length ? <DriverEmpty title="Nenhuma rota disponível"><p>Não há rotas ativas para esta empresa.</p></DriverEmpty> :
      resource.data.map((route) => {
        const current = route.activeDriverId === profile.id;
        const occupied = Boolean(route.activeDriverId && !current);
        return <article className="card driver-stack" key={route.id}>
          <span className="driver-badge">{current ? 'Sua rota atual' : occupied ? 'Rota ocupada' : 'Disponível'}</span>
          <h2>{route.name}</h2>
          <p>{directionLabel(route.direction)} · Saída {route.typical_start_time || route.estimated_arrival || 'não informada'}</p>
          <p>Destino: {route.destination_label || 'Não informado'}</p>
          <button className="btn btn-primary" type="button" disabled={Boolean(saving) || occupied || current} onClick={() => handleClaim(route.id)}>
            {saving === route.id ? 'Confirmando...' : current ? 'Rota atual' : occupied ? 'Indisponível' : 'Assumir esta rota'}
          </button>
        </article>;
      })}
  </div>;
}

export default function ClaimRoute() {
  const { operation, operationState } = useDriver();
  const companies = useDriverResource(fetchCompanies);
  const [companyId, setCompanyId] = useState('');
  const [busy, setBusy] = useState(false);
  if (operation.loading) return <div className="driver-stack"><DriverBack /><DriverLoading>Verificando jornada em andamento...</DriverLoading></div>;
  if (operationState === 'in_progress') return <div className="driver-stack"><DriverBack /><DriverEmpty title="Conclua a jornada atual"><p>A rota não pode ser trocada enquanto uma jornada estiver em andamento.</p><Link className="btn btn-primary" to="/driver">Retomar jornada</Link></DriverEmpty></div>;
  return <div className="page-transition driver-stack">
    <DriverBack /><h1>Assumir rota</h1>
    <p>Escolha a empresa e a rota de segunda a sexta. Ao concluir a troca, a nova rota substitui a anterior.</p>
    {companies.loading ? <DriverLoading>Carregando empresas...</DriverLoading> :
      companies.error ? <DriverError error={companies.error} onRetry={companies.refresh} /> :
      !companies.data.length ? <DriverEmpty title="Nenhuma empresa disponível"><p>Consulte a operação para obter uma atribuição.</p></DriverEmpty> :
      <label className="card driver-stack">Empresa<select value={companyId} disabled={busy} onChange={(e) => setCompanyId(e.target.value)}><option value="">Selecione uma empresa</option>{companies.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>}
    {companyId && <CompanyRoutes key={companyId} companyId={companyId} onBusy={setBusy} />}
  </div>;
}
