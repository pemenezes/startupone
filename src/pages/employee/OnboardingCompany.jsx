import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Loader2 } from 'lucide-react';
import { useAuth } from '../../auth-context';
import { fetchCompanies, updateEmployeeOnboarding } from '../../lib/companies';

export default function OnboardingCompany() {
  const navigate = useNavigate();
  const { profile, setProfile } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState(profile?.company_id || '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleContinue = async (e) => {
    e.preventDefault();
    if (!companyId || !profile?.id) return;
    setSaving(true);
    setError('');
    try {
      const updated = await updateEmployeeOnboarding(profile.id, { companyId });
      setProfile(updated);
      navigate('/employee/onboarding/addresses', { replace: true });
    } catch (err) {
      setError(err.message || 'Não foi possível salvar a empresa.');
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
    <div className="page-transition" style={{ maxWidth: 420, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <Building2 size={40} color="var(--primary)" />
        <h1 style={{ fontSize: '1.4rem', margin: '0.75rem 0 0.35rem' }}>Vincular empresa</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Selecione a empresa em que você trabalha para ver as rotas disponíveis.
        </p>
      </div>

      <form onSubmit={handleContinue} style={{ display: 'grid', gap: '1rem' }}>
        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Empresa</span>
          <select
            required
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              fontSize: '1rem',
              background: 'white',
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

        {error && (
          <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <button className="btn btn-primary" type="submit" disabled={saving || !companyId}>
          {saving ? 'Salvando...' : 'Continuar'}
        </button>
      </form>
    </div>
  );
}
