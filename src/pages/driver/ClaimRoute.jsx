import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Clock, Loader2, MapPin } from 'lucide-react';
import { useAuth } from '../../auth-context';
import { fetchCompanies } from '../../lib/companies';
import { fetchClaimableRoutes } from '../../lib/routes';
import { claimDriverRoute } from '../../lib/assignments';
import { directionLabel } from '../../lib/schedule';

export default function ClaimRoute() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState('');
  const [routes, setRoutes] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchCompanies()
      .then((list) => {
        if (!cancelled) setCompanies(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Falha ao carregar empresas.');
      })
      .finally(() => {
        if (!cancelled) setLoadingCompanies(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!companyId) {
      setRoutes([]);
      return undefined;
    }
    let cancelled = false;
    setLoadingRoutes(true);
    fetchClaimableRoutes(companyId)
      .then((list) => {
        if (!cancelled) setRoutes(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Falha ao carregar rotas.');
      })
      .finally(() => {
        if (!cancelled) setLoadingRoutes(false);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const handleClaim = async (routeId) => {
    if (!profile?.id) return;
    setSavingId(routeId);
    setError('');
    try {
      await claimDriverRoute(profile.id, routeId);
      navigate('/driver', { replace: true });
    } catch (err) {
      setError(err.message || 'Não foi possível assumir a rota. Pode já ter motorista ativo.');
    } finally {
      setSavingId('');
    }
  };

  if (loadingCompanies) {
    return (
      <div className="page-transition" style={{ textAlign: 'center', padding: '3rem' }}>
        <Loader2 className="spin" size={28} color="var(--secondary)" />
      </div>
    );
  }

  return (
    <div className="page-transition">
      <h1 style={{ fontSize: '1.4rem', marginBottom: '0.35rem' }}>Assumir rota</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>
        Escolha a empresa e a rota. Você fica responsável por ela de segunda a sexta.
      </p>

      {error && (
        <div
          style={{
            background: '#fef2f2',
            color: '#b91c1c',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.85rem',
          }}
        >
          {error}
        </div>
      )}

      <label className="card" style={{ display: 'grid', gap: '0.35rem', marginBottom: '1rem' }}>
        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Empresa</span>
        <select
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            fontSize: '1rem',
          }}
        >
          <option value="">Selecione...</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      {loadingRoutes && <p style={{ color: 'var(--text-secondary)' }}>Carregando rotas...</p>}

      {!loadingRoutes && companyId && !routes.length && (
        <div className="card">
          <p style={{ margin: 0 }}>Nenhuma rota ativa para esta empresa.</p>
        </div>
      )}

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {routes.map((route) => (
          <article key={route.id} className="card" style={{ display: 'grid', gap: '0.5rem' }}>
            <div>
              <small style={{ color: 'var(--text-secondary)' }}>
                {directionLabel(route.direction)} · {route.id.slice(0, 8)}
              </small>
              <h3 style={{ margin: '0.15rem 0' }}>{route.name}</h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              <MapPin size={15} /> {route.destination_label || route.boarding_stop}
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              <Clock size={15} /> {route.typical_start_time || route.estimated_arrival}
            </p>
            {route.driver && route.driver.id !== profile?.id && (
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--warning)' }}>
                <Bus size={14} style={{ verticalAlign: 'middle' }} /> Já há motorista nesta rota
              </p>
            )}
            <button
              type="button"
              className="btn btn-primary"
              disabled={Boolean(savingId)}
              onClick={() => handleClaim(route.id)}
              style={{ background: 'var(--secondary)', borderColor: 'var(--secondary)' }}
            >
              {savingId === route.id ? 'Salvando...' : 'Assumir esta rota'}
            </button>
          </article>
        ))}
      </div>

      <button className="btn btn-outline" type="button" style={{ marginTop: '1rem' }} onClick={() => navigate('/driver')}>
        Voltar
      </button>
    </div>
  );
}
