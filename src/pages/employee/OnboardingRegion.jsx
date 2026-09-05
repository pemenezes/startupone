import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, MapPinned } from 'lucide-react';
import { useAuth } from '../../auth-context';
import { updateEmployeeOnboarding } from '../../lib/companies';
import { fetchRegions } from '../../lib/regions';

export default function OnboardingRegion() {
  const navigate = useNavigate();
  const { profile, setProfile } = useAuth();
  const [regions, setRegions] = useState([]);
  const [regionId, setRegionId] = useState(profile?.region_id || '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!profile?.company_id) {
      navigate('/employee/onboarding/company', { replace: true });
      return undefined;
    }

    fetchRegions()
      .then((list) => {
        if (!cancelled) setRegions(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Falha ao carregar regiões.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [profile?.company_id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!regionId || !profile?.id) return;
    setSaving(true);
    setError('');
    try {
      const updated = await updateEmployeeOnboarding(profile.id, { regionId });
      setProfile(updated);
      navigate('/employee/onboarding/route');
    } catch (err) {
      setError(err.message || 'Não foi possível salvar a região.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-transition" style={{ textAlign: 'center', padding: '3rem' }}>
        <Loader2 className="spin" size={28} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="page-transition">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <MapPinned size={40} color="var(--primary)" />
        <h1 style={{ fontSize: '1.4rem', margin: '0.75rem 0 0.35rem' }}>Sua região</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Escolha a região onde você mora. As rotas disponíveis dependem disso.
        </p>
      </div>

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

      <form onSubmit={handleSubmit} className="card" style={{ display: 'grid', gap: '1rem' }}>
        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Região</span>
          <select
            required
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              fontSize: '1rem',
            }}
          >
            <option value="">Selecione...</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
                {r.city ? ` · ${r.city}` : ''}
              </option>
            ))}
          </select>
        </label>

        <button className="btn btn-primary" type="submit" disabled={saving || !regionId}>
          {saving ? 'Salvando...' : 'Continuar'}
        </button>
        <button
          className="btn btn-outline"
          type="button"
          onClick={() => navigate('/employee/onboarding/addresses')}
        >
          Voltar
        </button>
      </form>
    </div>
  );
}
