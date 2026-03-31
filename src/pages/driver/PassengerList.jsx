import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, UserX, UserMinus } from 'lucide-react';
import { driverUser } from '../../data/mockData';

export default function PassengerList() {
  const navigate = useNavigate();
  const [passengers, setPassengers] = useState([
    { id: 1, name: 'Ana Silva', address: 'Praça Matriz', status: 'pending' },
    { id: 2, name: 'João Souza', address: 'Praça Matriz', status: 'pending' },
    { id: 3, name: 'Maria Elena', address: 'Av. Brasil, 440', status: 'pending' },
    { id: 4, name: 'Lucas', address: 'Rua 7 de Setembro, 12', status: 'missing' }
  ]);

  const updateStatus = (id, newStatus) => {
    setPassengers(passengers.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  return (
    <div className="page-transition" style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem' }}>
        <button onClick={() => navigate('/driver')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={24} color="var(--text-primary)" />
        </button>
        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Check-in de Passageiros</h2>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <span style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-xl)', fontSize: '0.8rem', whiteSpace: 'nowrap', border: '1px solid var(--border)' }}>Todos (4)</span>
        <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-xl)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Pendentes (3)</span>
        <span style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-xl)', fontSize: '0.8rem', whiteSpace: 'nowrap', border: '1px solid var(--border)' }}>Embarcados (0)</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {passengers.map(p => (
          <div key={p.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderLeft: p.status === 'checked' ? '4px solid var(--secondary)' : p.status === 'missing' ? '4px solid var(--danger)' : '1px solid var(--border)' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>{p.name}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Parada: {p.address}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {p.status === 'pending' ? (
                <>
                  <button 
                    onClick={() => updateStatus(p.id, 'missing')}
                    style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <UserX size={20} />
                  </button>
                  <button 
                    onClick={() => updateStatus(p.id, 'checked')}
                    style={{ backgroundColor: '#ccfbf1', color: 'var(--secondary)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <UserCheck size={20} />
                  </button>
                </>
              ) : (
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: p.status === 'checked' ? 'var(--secondary)' : 'var(--danger)' }}>
                  {p.status === 'checked' ? 'Embarcou' : 'Faltou'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
