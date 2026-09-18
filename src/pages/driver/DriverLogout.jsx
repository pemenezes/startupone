import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../auth-context';

export default function DriverLogout({ compact = false }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const logout = async () => {
    setBusy(true);
    setError('');
    try {
      await signOut();
      navigate('/login/driver', { replace: true });
    } catch {
      setError('Não foi possível sair. Tente novamente.');
      setBusy(false);
    }
  };
  return <div>
    <button type="button" className={compact ? 'header-action-button' : 'btn btn-danger'} disabled={busy} onClick={logout} aria-label={busy ? 'Saindo da conta' : 'Sair da conta'}>
      <LogOut size={21} aria-hidden="true" />{!compact && (busy ? 'Saindo...' : 'Sair da conta')}
    </button>
    {error && <p className="driver-logout-error" role="alert">{error}</p>}
  </div>;
}
