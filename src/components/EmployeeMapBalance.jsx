import { Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../app-context';

export default function EmployeeMapBalance() {
  const navigate = useNavigate();
  const { currentEmployee } = useAppContext();
  const balance = Number(currentEmployee?.wallet?.balance || 0);

  return <button className="wallet-pill mobility-balance" type="button" onClick={() => navigate('/employee/credits')}>
    <Wallet size={18} />
    <span><small>Saldo</small><strong>R$ {balance.toFixed(2).replace('.', ',')}</strong></span>
  </button>;
}
