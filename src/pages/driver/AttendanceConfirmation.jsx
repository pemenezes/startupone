import { useEffect, useRef } from 'react';
import { Users, X } from 'lucide-react';

export default function AttendanceConfirmation({ pending, loading, onClose, onConfirm }) {
  const dialog = useRef(null);
  const cancel = useRef(null);
  useEffect(() => {
    dialog.current.showModal();
    cancel.current.focus();
  }, []);
  const boarding = pending.status === 'boarded';
  return <dialog ref={dialog} className="driver-confirm-dialog" aria-labelledby="attendance-title" aria-describedby="attendance-description" onCancel={onClose}>
    <span className={`driver-confirm-icon ${boarding ? '' : 'is-absence'}`}>{boarding ? <Users size={26} /> : <X size={26} />}</span>
    <h2 id="attendance-title">{boarding ? 'Confirmar embarque?' : 'Confirmar ausência?'}</h2>
    <p id="attendance-description">{boarding ? 'Confirmar que' : 'Confirmar a ausência de'} <strong>{pending.passengerName}</strong>{boarding ? ' embarcou nesta parada?' : ' nesta parada?'}</p>
    {pending.currentStatus && pending.currentStatus !== 'expected' && <p className="driver-correction-note">Esta ação corrigirá a situação registrada anteriormente e ficará no histórico.</p>}
    <div className="driver-confirm-actions">
      <button ref={cancel} type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Voltar</button>
      <button type="button" className={`btn ${boarding ? 'btn-primary' : 'driver-btn-absence'}`} onClick={onConfirm} disabled={loading}>{loading ? 'Registrando...' : boarding ? 'Confirmar embarque' : 'Confirmar ausência'}</button>
    </div>
  </dialog>;
}
