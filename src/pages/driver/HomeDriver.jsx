import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Users, CheckCircle } from 'lucide-react';
import { driverUser } from '../../data/mockData';

export default function HomeDriver() {
  const navigate = useNavigate();

  return (
    <div className="page-transition">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Olá, Carlos</h1>
        <p>{driverUser.vehicle}</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Rota em Andamento</p>
            <h2 style={{ margin: 0 }}>{driverUser.todayRoute.name}</h2>
          </div>
          <div style={{ backgroundColor: 'var(--secondary)', color: 'white', padding: '0.5rem', borderRadius: '50%' }}>
            <Map size={24} />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--secondary)' }}>{driverUser.todayRoute.checkedIn}</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Embarcados</p>
          </div>
          <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--warning)' }}>
              {driverUser.todayRoute.passengersTotal - driverUser.todayRoute.checkedIn - driverUser.todayRoute.missing}
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Restantes</p>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--danger)' }}>{driverUser.todayRoute.missing}</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ausentes</p>
          </div>
        </div>

        <button 
          className="btn" 
          style={{ width: '100%', marginTop: '1.5rem', backgroundColor: 'var(--secondary)', color: 'white', display: 'flex', gap: '0.5rem' }}
          onClick={() => navigate('/driver/passengers')}
        >
          <Users size={20} /> Lista de Check-in
        </button>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Próxima Parada</h3>
      
      {driverUser.todayRoute.stops.filter(s => s.status !== 'done').map((stop, i) => (
        <div key={stop.id} className="card" style={{ marginBottom: '1rem', opacity: i === 0 ? 1 : 0.6, borderLeft: i === 0 ? '4px solid var(--secondary)' : '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>{stop.time} - {stop.address}</p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{stop.passengers.length} passageiro(s)</p>
            </div>
            {i === 0 && (
              <button onClick={() => navigate('/driver/map')} style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: 'none', padding: '0.5rem', borderRadius: '50%', display: 'flex', cursor: 'pointer' }}>
                <Map size={20} />
              </button>
            )}
          </div>
        </div>
      ))}
      <button className="btn btn-outline" style={{ marginTop: '1rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
        Finalizar Rota
      </button>
    </div>
  );
}
