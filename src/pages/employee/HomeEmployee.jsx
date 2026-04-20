import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, ShieldAlert, Navigation, Wallet } from 'lucide-react';
import { useAppContext } from '../../AppContext';

export default function HomeEmployee() {
  const navigate = useNavigate();
  const { currentEmployee } = useAppContext();
 
  return (
    <div className="page-transition">
       <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Olá, {currentEmployee.name.split(' ')[0]}</h1>
            <p>{currentEmployee.company}</p>
          </div>
          <button 
            onClick={() => navigate('/employee/wallet')} 
            className="btn btn-outline" 
            style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Wallet size={16} /> {currentEmployee.wallet.balance.toFixed(2)} SC
          </button>
        </div>
 
 
        {currentEmployee.penalties.status !== 'stable' && (
          <div style={{ backgroundColor: currentEmployee.penalties.status === 'suspended' ? 'var(--danger)' : 'var(--warning)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', opacity: 0.9 }}>
            <ShieldAlert size={20} />
            <span style={{ fontSize: '0.85rem' }}>
              {currentEmployee.penalties.status === 'suspended' 
                ? `Sua conta está suspensa devido a ${currentEmployee.penalties.noShows} faltas.` 
                : `Aviso: Você possui ${currentEmployee.penalties.noShows} advertência(s) por ausência. Próxima suspensão em ${currentEmployee.penalties.nextPenaltyAt - currentEmployee.penalties.noShows} falta(s).`}
            </span>
          </div>
        )}
 
 
       <h3 style={{ marginBottom: '1rem' }}>Sua Viagem Hoje</h3>
       
       <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
         {currentEmployee.activeRoute.status === 'delayed' && (
           <div style={{ position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'var(--warning)', color: 'white', padding: '0.25rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
             ATRASO PREVISTO
           </div>
         )}
         
         <div style={{ padding: '1.5rem', paddingTop: currentEmployee.activeRoute.status === 'delayed' ? '2.5rem' : '1.5rem' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
             <div>
               <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rota {currentEmployee.activeRoute.id}</p>
               <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{currentEmployee.activeRoute.name}</h2>
               <button 
                 onClick={() => navigate('/employee/driver-profile')} 
                 style={{ background: 'none', border: 'none', color: 'var(--primary)', padding: 0, fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', marginTop: '0.2rem' }}
               >
                 Motorista: {currentEmployee.activeRoute.driver} ({currentEmployee.activeRoute.driverRating} ★)
               </button>
             </div>
             <div style={{ textAlign: 'right' }}>
               <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Previsão</p>
               <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary)' }}>{currentEmployee.activeRoute.estimatedArrival}</h2>
             </div>
           </div>
 
           <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <MapPin size={16} color="var(--secondary)" />
               <span style={{ fontSize: '0.9rem' }}>{currentEmployee.activeRoute.boardingStop}</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Clock size={16} color="var(--primary)" />
               <span style={{ fontSize: '0.9rem' }}>ETA: {currentEmployee.activeRoute.etaMinutes} min</span>
             </div>
           </div>
 
           <button 
             className="btn btn-primary" 
             style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
             onClick={() => navigate('/employee/track')}
           >
             <Navigation size={18} /> Acompanhar Van
           </button>
         </div>
       </div>
 
       <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <h3>Escolher Nova Rota</h3>
         <button className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', width: 'auto' }}>Alterar</button>
       </div>
       <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>A inteligência artificial sugeriu as melhores rotas com base no seu endereço.</p>
     </div>
   );
}


