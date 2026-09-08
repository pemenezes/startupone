import { useState } from 'react';
import { useAuth } from '../../auth-context';
import DriverLogout from './DriverLogout';

export default function DriverProfileRecovery() {
  const { refreshProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Não foi possível carregar seu perfil de motorista.');
  const retry = async () => {
    setBusy(true);
    try {
      const result = await refreshProfile();
      if (!result) setMessage('Seu perfil não foi encontrado. Consulte a operação ou entre novamente.');
    } catch {
      setMessage('Não foi possível consultar seu perfil. Verifique a conexão e tente novamente.');
    } finally {
      setBusy(false);
    }
  };
  return <main className="container" style={{ padding: '2rem', display: 'grid', alignContent: 'start', gap: '1rem' }}>
    <h1>Perfil indisponível</h1><p role="alert">{message}</p>
    <button type="button" className="btn btn-primary" disabled={busy} onClick={retry}>{busy ? 'Consultando...' : 'Tentar novamente'}</button>
    <DriverLogout />
  </main>;
}
