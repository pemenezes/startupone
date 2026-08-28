import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Users 
} from 'lucide-react';

export default function PassengerList() {
  const navigate = useNavigate();
  
  // State containing stops and passengers
  const [stops, setStops] = useState([
    {
      id: 1,
      address: 'Praça Matriz',
      time: '18:15',
      status: 'Concluída', // Concluída, Em andamento, Pendente, Atrasada
      passengers: [
        { id: 101, name: 'Ana Silva', status: 'checked' },
        { id: 102, name: 'João Souza', status: 'checked' },
        { id: 111, name: 'Lucas Pinheiro', status: 'missing' }
      ]
    },
    {
      id: 2,
      address: 'Av. Brasil, 440',
      time: '18:25',
      status: 'Em andamento',
      passengers: [
        { id: 201, name: 'Maria Elena', status: 'pending' },
        { id: 202, name: 'Juliana Mendes', status: 'pending' },
        { id: 203, name: 'Bruno Alves', status: 'pending' }
      ]
    },
    {
      id: 3,
      address: 'Rua 7 de Setembro, 12',
      time: '18:40',
      status: 'Pendente',
      passengers: [
        { id: 301, name: 'Lucas Silva', status: 'pending' }
      ]
    }
  ]);

  // Expansion state: active next stop (ID 2) starts expanded by default
  const [expandedStops, setExpandedStops] = useState({
    1: false,
    2: true,
    3: false
  });

  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'pending', 'checked', 'missing'

  const toggleStopExpand = (stopId) => {
    setExpandedStops(prev => ({
      ...prev,
      [stopId]: !prev[stopId]
    }));
  };

  const handleStatusChange = (stopId, passengerId, currentStatus, newStatus) => {
    if (currentStatus === 'missing' && newStatus !== 'missing') {
      const confirm = window.confirm("Deseja alterar o status de 'Faltou' para outro? Isso removerá a advertência gerada para o colaborador.");
      if (!confirm) return;
    }
    
    if (newStatus === 'missing' && currentStatus !== 'missing') {
      const confirm = window.confirm("Confirmar Ausência? Registrar falta poderá aplicar penalidade de advertência na conta do colaborador.");
      if (!confirm) return;
    }

    setStops(prev => prev.map(s => {
      if (s.id === stopId) {
        return {
          ...s,
          passengers: s.passengers.map(p => p.id === passengerId ? { ...p, status: newStatus } : p)
        };
      }
      return s;
    }));
  };

  // Stats Calculations
  const allPassengers = stops.flatMap(s => s.passengers);
  const totalCount = allPassengers.length;
  const checkedCount = allPassengers.filter(p => p.status === 'checked').length;
  const missingCount = allPassengers.filter(p => p.status === 'missing').length;
  const pendingCount = allPassengers.filter(p => p.status === 'pending').length;

  const getStopStatusColor = (status) => {
    switch (status) {
      case 'Concluída': return { color: 'var(--text-secondary)', bg: 'var(--border)' };
      case 'Em andamento': return { color: 'var(--secondary)', bg: '#dcfce3' };
      case 'Atrasada': return { color: 'var(--warning)', bg: '#fef3c7' };
      case 'Pendente':
      default:
        return { color: 'var(--text-secondary)', bg: 'var(--bg-primary)' };
    }
  };

  return (
    <div className="page-transition" style={{ paddingBottom: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem' }}>
        <button onClick={() => navigate('/driver')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={24} color="var(--text-primary)" />
        </button>
        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Passageiros e Itinerário</h2>
      </div>

      {/* Stats Summary Row */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        padding: '0.75rem', 
        backgroundColor: 'var(--bg-secondary)', 
        borderRadius: 'var(--radius-lg)', 
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '1rem',
        border: '1px solid var(--border)'
      }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Total</span>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{totalCount}</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>Embarcados</span>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--secondary)' }}>{checkedCount}</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>Pendentes</span>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary)' }}>{pendingCount}</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--danger)' }}>Ausentes</span>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--danger)' }}>{missingCount}</div>
        </div>
      </div>

      {/* Filters Selection Row */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        <button 
          onClick={() => setActiveFilter('all')}
          style={{ 
            backgroundColor: activeFilter === 'all' ? 'var(--secondary)' : 'var(--bg-secondary)', 
            color: activeFilter === 'all' ? 'white' : 'var(--text-secondary)',
            padding: '0.3rem 0.8rem', 
            borderRadius: 'var(--radius-xl)', 
            fontSize: '0.8rem', 
            border: activeFilter === 'all' ? 'none' : '1px solid var(--border)',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          Todos ({totalCount})
        </button>
        <button 
          onClick={() => setActiveFilter('pending')}
          style={{ 
            backgroundColor: activeFilter === 'pending' ? 'var(--secondary)' : 'var(--bg-secondary)', 
            color: activeFilter === 'pending' ? 'white' : 'var(--text-secondary)',
            padding: '0.3rem 0.8rem', 
            borderRadius: 'var(--radius-xl)', 
            fontSize: '0.8rem', 
            border: activeFilter === 'pending' ? 'none' : '1px solid var(--border)',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          Pendentes ({pendingCount})
        </button>
        <button 
          onClick={() => setActiveFilter('checked')}
          style={{ 
            backgroundColor: activeFilter === 'checked' ? 'var(--secondary)' : 'var(--bg-secondary)', 
            color: activeFilter === 'checked' ? 'white' : 'var(--text-secondary)',
            padding: '0.3rem 0.8rem', 
            borderRadius: 'var(--radius-xl)', 
            fontSize: '0.8rem', 
            border: activeFilter === 'checked' ? 'none' : '1px solid var(--border)',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          Embarcados ({checkedCount})
        </button>
        <button 
          onClick={() => setActiveFilter('missing')}
          style={{ 
            backgroundColor: activeFilter === 'missing' ? 'var(--secondary)' : 'var(--bg-secondary)', 
            color: activeFilter === 'missing' ? 'white' : 'var(--text-secondary)',
            padding: '0.3rem 0.8rem', 
            borderRadius: 'var(--radius-xl)', 
            fontSize: '0.8rem', 
            border: activeFilter === 'missing' ? 'none' : '1px solid var(--border)',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          Ausentes ({missingCount})
        </button>
      </div>

      {/* Grouped Stops Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {stops.map(stop => {
          // Filter passengers based on selection
          const filteredPassengers = stop.passengers.filter(p => {
            if (activeFilter === 'all') return true;
            return p.status === activeFilter;
          });

          // Omit rendering this stop card if no passengers match the current active filter
          if (filteredPassengers.length === 0) return null;

          const isExpanded = !!expandedStops[stop.id];
          const badgeStyle = getStopStatusColor(stop.status);

          return (
            <div 
              key={stop.id} 
              className="card" 
              style={{ 
                padding: 0, 
                overflow: 'hidden', 
                backgroundColor: 'white',
                borderLeft: stop.status === 'Em andamento' ? '4px solid var(--secondary)' : '1px solid var(--border)'
              }}
            >
              {/* Card Header (Click to Toggle expansion) */}
              <div 
                onClick={() => toggleStopExpand(stop.id)}
                style={{ 
                  padding: '1rem', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-secondary)'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stop.time}</span>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      color: badgeStyle.color, 
                      backgroundColor: badgeStyle.bg, 
                      padding: '0.15rem 0.4rem', 
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>{stop.status}</span>
                  </div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600' }}>{stop.address}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {stop.passengers.length} passageiro(s) cadastrados
                  </span>
                </div>
                <div>
                  {isExpanded ? <ChevronUp size={20} color="var(--text-secondary)" /> : <ChevronDown size={20} color="var(--text-secondary)" />}
                </div>
              </div>

              {/* Card Content (Passengers lists) */}
              {isExpanded && (
                <div style={{ 
                  padding: '1rem', 
                  borderTop: '1px solid var(--border)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.75rem',
                  backgroundColor: 'var(--bg-primary)'
                }}>
                  {filteredPassengers.map(p => (
                    <div 
                      key={p.id} 
                      style={{ 
                        backgroundColor: 'white',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderLeft: p.status === 'checked' ? '3px solid var(--secondary)' : p.status === 'missing' ? '3px solid var(--danger)' : '3px solid var(--border)'
                      }}
                    >
                      <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{p.name}</span>
                      
                      {/* Dropdown status selector */}
                      <select 
                        value={p.status}
                        onChange={(e) => handleStatusChange(stop.id, p.id, p.status, e.target.value)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          backgroundColor: p.status === 'checked' ? '#dcfce3' : p.status === 'missing' ? '#fee2e2' : 'var(--bg-primary)',
                          color: p.status === 'checked' ? 'var(--secondary)' : p.status === 'missing' ? 'var(--danger)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="pending">Pendente</option>
                        <option value="checked">Embarcou</option>
                        <option value="missing">Faltou</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state if all cards are filtered out */}
        {stops.every(s => s.passengers.filter(p => activeFilter === 'all' ? true : p.status === activeFilter).length === 0) && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
            <Users size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Nenhum passageiro encontrado com este filtro.</p>
          </div>
        )}
      </div>

    </div>
  );
}

