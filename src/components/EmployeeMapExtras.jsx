import { AlertTriangle, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../app-context';

export default function EmployeeMapExtras({ canReview = false }) {
  const navigate = useNavigate();
  const { currentEmployee } = useAppContext();
  const noShows = Number(currentEmployee?.penalties?.noShows || 0);
  const suspended = currentEmployee?.penalties?.status === 'suspended';

  return <>
    {noShows > 0 && <div className={`notice-card ${suspended ? 'notice-card--danger' : 'notice-card--warning'}`}>
      <AlertTriangle size={20} />
      <span><strong>{suspended ? 'Benefício temporariamente suspenso' : `${noShows} advertência(s)`}</strong><small>{noShows} ausência(s) sem cancelamento.</small></span>
      <button type="button" onClick={() => navigate('/employee/profile')}>Ver perfil</button>
    </div>}
    {canReview && <button className="btn btn-outline mobility-full-action" type="button" onClick={() => navigate('/employee/review')}><Star size={18} />Avaliar motorista</button>}
  </>;
}
