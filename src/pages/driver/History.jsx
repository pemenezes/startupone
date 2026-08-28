import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Star, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  FileText, 
  BarChart3,
  Car
} from 'lucide-react';

export default function History() {
  const navigate = useNavigate();

  // Mock list of completed journeys
  const [journeys] = useState([
    {
      id: 1,
      routeId: 'RT-14',
      name: 'Linha Centro -> Zona Sul',
      date: '21/06/2026',
      timeStart: '18:00',
      timeEnd: '19:08',
      status: 'Concluída',
      boarded: 10,
      absent: 1,
      stopsCount: 3,
      vehicle: 'Van ABC-1234',
      rating: 4.8,
      period: 'Hoje', // Filter tag matches
      hasOccurrence: false,
      occurrencesText: '1 ausência registrada'
    },
    {
      id: 2,
      routeId: 'RT-42',
      name: 'Linha Norte -> Centro',
      date: '20/06/2026',
      timeStart: '17:50',
      timeEnd: '19:15',
      status: 'Concluída com ocorrência',
      boarded: 8,
      absent: 2,
      stopsCount: 3,
      vehicle: 'Van ABC-1234',
      rating: 4.5,
      period: 'Semana',
      hasOccurrence: true,
      occurrencesText: 'Atraso de 8 min, 2 ausências'
    },
    {
      id: 3,
      routeId: 'RT-12',
      name: 'Linha Leste -> Matriz',
      date: '18/06/2026',
      timeStart: '07:00',
      timeEnd: '08:05',
      status: 'Concluída',
      boarded: 12,
      absent: 0,
      stopsCount: 4,
      vehicle: 'Van ABC-1234',
      rating: 4.9,
      period: 'Semana',
      hasOccurrence: false,
      occurrencesText: 'Sem ocorrências'
    },
    {
      id: 4,
      routeId: 'RT-08',
      name: 'Zona Sul -> Fábrica',
      date: '12/06/2026',
      timeStart: '06:15',
      timeEnd: '07:45',
      status: 'Cancelada',
      boarded: 0,
      absent: 0,
      stopsCount: 0,
      vehicle: 'Microônibus XYZ-9876',
      rating: null,
      period: 'Mês',
      hasOccurrence: true,
      occurrencesText: 'Rota cancelada pelo cliente'
    }
  ]);

  const [activeFilter, setActiveFilter] = useState('Semana'); // 'Hoje', 'Semana', 'Mês', 'Ocorrências'
  const [selectedJourney, setSelectedJourney] = useState(null);

  // Filter Logic
  const filteredJourneys = journeys.filter(j => {
    if (activeFilter === 'Hoje') {
      return j.period === 'Hoje';
    }
    if (activeFilter === 'Semana') {
      return j.period === 'Hoje' || j.period === 'Semana';
    }
    if (activeFilter === 'Mês') {
      return true; // All
    }
    if (activeFilter === 'Ocorrências') {
      return j.hasOccurrence;
    }
    return true;
  });

  const getStatusColor = (journey) => {
    if (journey.status === 'Cancelada') {
      return { text: 'var(--danger)', bg: 'var(--danger-light)' };
    }
    if (journey.hasOccurrence) {
      return { text: 'var(--warning)', bg: '#fef3c7' };
    }
    return { text: 'var(--secondary)', bg: '#dcfce3' };
  };

  return (
    <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '0.5rem' }}>
        <button onClick={() => navigate('/driver')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={24} color="var(--text-primary)" />
        </button>
        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Histórico de Viagens</h2>
      </div>

      {/* 2. Resumo Rápido de Desempenho */}
      <div className="card" style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
          <BarChart3 size={18} /> Desempenho da Semana
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: '0.25rem' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Viagens Concluídas</span>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>12</div>
          </div>
          <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Passageiros</span>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>142</div>
          </div>
          <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Ausências</span>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--danger)' }}>8</div>
          </div>
          <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Pontualidade</span>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--secondary)' }}>96%</div>
          </div>
        </div>
      </div>

      {/* 3. Filtros */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {['Hoje', 'Semana', 'Mês', 'Ocorrências'].map((filter) => (
          <button 
            key={filter}
            onClick={() => setActiveFilter(filter)}
            style={{ 
              backgroundColor: activeFilter === filter ? 'var(--secondary)' : 'var(--bg-secondary)', 
              color: activeFilter === filter ? 'white' : 'var(--text-secondary)',
              padding: '0.3rem 0.8rem', 
              borderRadius: 'var(--radius-xl)', 
              fontSize: '0.8rem', 
              border: activeFilter === filter ? 'none' : '1px solid var(--border)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* 4. Lista de Jornadas Anteriores */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredJourneys.map((journey) => {
          const statusStyle = getStatusColor(journey);
          
          return (
            <div 
              key={journey.id} 
              onClick={() => setSelectedJourney(journey)}
              className="card" 
              style={{ 
                backgroundColor: 'white', 
                cursor: 'pointer',
                borderLeft: journey.hasOccurrence ? '4px solid var(--warning)' : journey.status === 'Cancelada' ? '4px solid var(--danger)' : '4px solid var(--secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{journey.date}</span>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold' }}>{journey.routeId} · {journey.name}</h4>
                </div>
                <span style={{ 
                  fontSize: '0.7rem', 
                  color: statusStyle.text, 
                  backgroundColor: statusStyle.bg, 
                  padding: '0.15rem 0.4rem', 
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap'
                }}>
                  {journey.status}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={12} /> {journey.timeStart} - {journey.timeEnd}
                </span>
                <span>{journey.stopsCount} paradas · {journey.boarded} emb.</span>
              </div>

              {/* 5. Tags de Ocorrência */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                {journey.status === 'Cancelada' ? (
                  <span style={{ fontSize: '0.7rem', backgroundColor: '#fee2e2', color: 'var(--danger)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>
                    Rota Cancelada
                  </span>
                ) : journey.hasOccurrence ? (
                  <>
                    <span style={{ fontSize: '0.7rem', backgroundColor: '#fee2e2', color: 'var(--danger)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>
                      {journey.absent} ausências
                    </span>
                    <span style={{ fontSize: '0.7rem', backgroundColor: '#fef3c7', color: 'var(--warning)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>
                      Atraso de 8 min
                    </span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '0.7rem', backgroundColor: '#dcfce3', color: 'var(--secondary)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>
                      Sem ocorrências
                    </span>
                    {journey.absent > 0 && (
                      <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>
                        {journey.absent} ausência
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}

        {filteredJourneys.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
            <Calendar size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Nenhuma viagem registrada neste período.</p>
          </div>
        )}
      </div>

      {/* 6. Detalhe da Jornada ao clicar (Modal) */}
      {selectedJourney && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '360px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Detalhes da Jornada</h3>
              <button onClick={() => setSelectedJourney(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '0.25rem', color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Rota</span>
                <div style={{ fontWeight: 'bold' }}>{selectedJourney.routeId} · {selectedJourney.name}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Data</span>
                  <div style={{ fontWeight: '500' }}>{selectedJourney.date}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Veículo</span>
                  <div style={{ fontWeight: '500' }}>{selectedJourney.vehicle}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Início</span>
                  <div style={{ fontWeight: '500' }}>{selectedJourney.timeStart}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Encerramento</span>
                  <div style={{ fontWeight: '500' }}>{selectedJourney.timeEnd}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '0.5rem 0' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Paradas</span>
                  <div style={{ fontWeight: 'bold' }}>{selectedJourney.stopsCount}</div>
                </div>
                <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>Embarcados</span>
                  <div style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>{selectedJourney.boarded}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--danger)' }}>Ausentes</span>
                  <div style={{ fontWeight: 'bold', color: 'var(--danger)' }}>{selectedJourney.absent}</div>
                </div>
              </div>
              
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ocorrências</span>
                <div style={{ 
                  fontSize: '0.85rem', 
                  color: selectedJourney.status === 'Cancelada' || selectedJourney.hasOccurrence ? 'var(--danger)' : 'var(--text-primary)',
                  fontWeight: selectedJourney.hasOccurrence ? 'bold' : 'normal' 
                }}>{selectedJourney.occurrencesText}</div>
              </div>

              {selectedJourney.rating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avaliação Média:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'bold', color: 'var(--warning)', fontSize: '0.9rem' }}>
                    <Star size={14} fill="var(--warning)" color="var(--warning)" /> {selectedJourney.rating}
                  </div>
                </div>
              )}
            </div>

            {/* 7. Ação Futura */}
            <button 
              className="btn btn-primary" 
              onClick={() => alert("Relatório de Rota: funcionalidade de exportação de PDF está sendo preparada para homologação.")}
              style={{ 
                backgroundColor: 'var(--secondary)', 
                color: 'white', 
                display: 'flex', 
                gap: '0.5rem', 
                fontSize: '0.85rem', 
                padding: '0.5rem',
                marginTop: '0.5rem'
              }}
            >
              <FileText size={16} /> Ver relatório da rota
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

