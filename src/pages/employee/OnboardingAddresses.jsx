import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useAuth } from '../../auth-context';
import { updateEmployeeOnboarding } from '../../lib/companies';

export default function OnboardingAddresses() {
  const navigate = useNavigate();
  const { profile, setProfile } = useAuth();
  const [homeAddress, setHomeAddress] = useState(profile?.home_address || '');
  const [workAddress, setWorkAddress] = useState(profile?.work_address || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async (e) => {
    e.preventDefault();
    if (!profile?.id) return;
    setSaving(true);
    setError('');
    try {
      const updated = await updateEmployeeOnboarding(profile.id, {
        homeAddress: homeAddress.trim(),
        workAddress: workAddress.trim(),
      });
      setProfile(updated);
      navigate('/employee/onboarding/route', { replace: true });
    } catch (err) {
      setError(err.message || 'Não foi possível salvar os endereços.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-transition" style={{ maxWidth: 420, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <MapPin size={40} color="var(--primary)" />
        <h1 style={{ fontSize: '1.4rem', margin: '0.75rem 0 0.35rem' }}>Seus endereços</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Informe onde você mora e onde trabalha para sugerirmos rotas adequadas.
        </p>
      </div>

      <form onSubmit={handleContinue} style={{ display: 'grid', gap: '1rem' }}>
        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Endereço de casa</span>
          <input
            required
            value={homeAddress}
            onChange={(e) => setHomeAddress(e.target.value)}
            placeholder="Rua, número, bairro"
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              fontSize: '1rem',
            }}
          />
        </label>

        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Endereço do trabalho</span>
          <input
            required
            value={workAddress}
            onChange={(e) => setWorkAddress(e.target.value)}
            placeholder="Empresa / rua do trabalho"
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              fontSize: '1rem',
            }}
          />
        </label>

        {error && (
          <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <button className="btn btn-outline" type="button" onClick={() => navigate('/employee/onboarding/company')}>
          Voltar
        </button>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Salvando...' : 'Continuar'}
        </button>
      </form>
    </div>
  );
}
