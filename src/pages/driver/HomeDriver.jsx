import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Map, 
  Users, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  UserCheck, 
  UserX, 
  Play, 
  Check, 
  Navigation, 
  AlertTriangle 
} from 'lucide-react';
import { driverUser } from '../../data/mockData';

export default function HomeDriver() {
  const navigate = useNavigate();

  // Local state initialized with dynamic data matching mock numbers (15 total, 10 checked, 1 missing, 4 remaining)
  const [routeStatus, setRouteStatus] = useState('Agendada'); // 'Agendada', 'Em andamento', 'Finalizada'
  const [activeStopIndex, setActiveStopIndex] = useState(1); // Stop 1 (index 0) is concluded, Stop 2 (index 1) is active next.
  const [isArrived, setIsArrived] = useState(false);
  const [showStopSummary, setShowStopSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  
  // Confirmation state overlays
  const [showConfirmMissing, setShowConfirmMissing] = useState(null); // passenger object to confirm lack of presence
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);

  const [stops, setStops] = useState([
    {
      id: 1,
      address: 'Praça Matriz',
      time: '18:15',
      status: 'done', // Concluída
      passengers: [
        { id: 101, name: 'Ana Silva', status: 'checked' },
        { id: 102, name: 'João Souza', status: 'checked' },
        { id: 103, name: 'José Alencar', status: 'checked' },
        { id: 104, name: 'Carla Dias', status: 'checked' },
        { id: 105, name: 'Pedro Santos', status: 'checked' },
        { id: 106, name: 'Mariana Lima', status: 'checked' },
        { id: 107, name: 'Fernanda Souza', status: 'checked' },
        { id: 108, name: 'Roberto Carlos', status: 'checked' },
        { id: 109, name: 'Patrícia Rocha', status: 'checked' },
        { id: 110, name: 'Ricardo Oliveira', status: 'checked' },
        { id: 111, name: 'Lucas Pinheiro', status: 'missing' }
      ]
    },
    {
      id: 2,
      address: 'Av. Brasil, 440',
      time: '18:25',
      status: 'pending', // Will become 'active' once route is started
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
      status: 'pending',
      passengers: [
        { id: 301, name: 'Lucas Silva', status: 'pending' }
      ]
    }
  ]);

  // Compute counters dynamically from state
  const getAllPassengers = () => stops.flatMap(s => s.passengers);
  const checkedIn = getAllPassengers().filter(p => p.status === 'checked').length;
  const missing = getAllPassengers().filter(p => p.status === 'missing').length;
  const remaining = getAllPassengers().filter(p => p.status === 'pending').length;

  const countConcludedStops = stops.filter(s => s.status === 'done').length;

  // Actions
  const handleStartRoute = () => {
    setRouteStatus('Em andamento');
    setStops(prev => prev.map((s, idx) => idx === activeStopIndex ? { ...s, status: 'active' } : s));
  };

  const handlePassengerStatus = (stopId, passengerId, newStatus) => {
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

  const handleOpenNavigation = (address) => {
    const query = encodeURIComponent(`${address}, São Paulo`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleConcludeStop = (stop) => {
    // Collect summary data for this stop
    const boarded = stop.passengers.filter(p => p.status === 'checked').map(p => p.name);
    const absent = stop.passengers.filter(p => p.status === 'missing').map(p => p.name);
    const nextStop = activeStopIndex < stops.length - 1 ? stops[activeStopIndex + 1] : null;

    setSummaryData({
      address: stop.address,
      boarded,
      absent,
      nextStopAddress: nextStop ? nextStop.address : 'Nenhuma (Fim da Rota)'
    });
    setShowStopSummary(true);
  };

  const handleProceedToNextStop = () => {
    setShowStopSummary(false);
    
    // Set current active stop to 'done' and next to 'active'
    setStops(prev => prev.map((s, idx) => {
      if (idx === activeStopIndex) return { ...s, status: 'done' };
      if (idx === activeStopIndex + 1) return { ...s, status: 'active' };
      return s;
    }));

    setIsArrived(false);
    setActiveStopIndex(prev => prev + 1);
  };

  const handleFinishRoute = () => {
    setRouteStatus('Finalizada');
    setShowConfirmFinish(false);
  };

  const activeStop = stops[activeStopIndex];
  // Determine if all active stop passengers are marked as checked or missing
  const isActiveStopComplete = activeStop && activeStop.passengers.every(p => p.status !== 'pending');

  return (
    <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
      
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Olá, Carlos</h1>
          <p style={{ margin: 0 }}>Veículo: {driverUser.vehicle.label}</p>
        </div>
        <span style={{
          backgroundColor: routeStatus === 'Em andamento' ? '#dcfce3' : routeStatus === 'Finalizada' ? 'var(--primary-light)' : 'var(--bg-secondary)',
          color: routeStatus === 'Em andamento' ? 'var(--secondary)' : routeStatus === 'Finalizada' ? 'var(--primary)' : 'var(--text-secondary)',
          padding: '0.25rem 0.75rem',
          borderRadius: '1rem',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          border: '1px solid var(--border)'
        }}>
          {routeStatus === 'Agendada' ? 'Agendada' : routeStatus === 'Em andamento' ? 'Em Andamento' : 'Finalizada'}
        </span>
      </div>

      <div className="quick-action-grid">
        <button type="button" className="quick-action" onClick={() => navigate('/driver/status')}>
          <AlertTriangle size={20} /><span><strong>Status de conformidade</strong><small>Conta regular e histórico</small></span>
        </button>
        <button type="button" className="quick-action" onClick={() => navigate('/driver/region-request')}>
          <MapPin size={20} /><span><strong>Alterar região</strong><small>Enviar solicitação</small></span>
        </button>
      </div>

      {/* Main Route Card */}
      <div className="card" style={{ backgroundColor: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Código da Rota: {driverUser.todayRoute.id}</p>
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{driverUser.todayRoute.name}</h2>
          </div>
          <div style={{ backgroundColor: 'var(--secondary)', color: 'white', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
            <Map size={20} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <div>Início: <strong>18:00</strong> • Previsão: <strong>19:10</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Progresso da Rota:</span>
            <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{countConcludedStops} de {stops.length} paradas</span>
          </div>
        </div>
        
        {/* Dynamic Counters */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--secondary)' }}>{checkedIn}</h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Embarcados</p>
          </div>
          <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--warning)' }}>{remaining}</h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Restantes</p>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--danger)' }}>{missing}</h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ausentes</p>
          </div>
        </div>

        <button 
          className="btn btn-outline" 
          style={{ width: '100%', marginTop: '1rem', display: 'flex', gap: '0.5rem', fontSize: '0.9rem', padding: '0.5rem' }}
          onClick={() => navigate('/driver/passengers')}
        >
          <Users size={16} /> Lista Completa de Check-in
        </button>
      </div>

      {/* OPERATIONAL INTERACTION AREA */}
      {routeStatus === 'Agendada' && (
        <div className="card" style={{ textAlign: 'center', borderStyle: 'dashed', borderColor: 'var(--secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
          <Play size={48} color="var(--secondary)" style={{ opacity: 0.8 }} />
          <div>
            <h3 style={{ margin: 0 }}>Iniciar Jornada de Trabalho</h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Clique para dar início às viagens e monitorar os passageiros.</p>
          </div>
          <button className="btn" style={{ backgroundColor: 'var(--secondary)', color: 'white' }} onClick={handleStartRoute}>
            Iniciar Rota
          </button>
        </div>
      )}

      {routeStatus === 'Em andamento' && activeStop && (
        <div className="card" style={{ borderLeft: '4px solid var(--secondary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ 
                backgroundColor: 'var(--secondary)', 
                color: 'white', 
                padding: '0.15rem 0.5rem', 
                borderRadius: '4px', 
                fontSize: '0.7rem', 
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                Parada Ativa
              </span>
              <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.1rem' }}>{activeStop.address}</h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Previsão</span>
              <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}>
                <Clock size={14} color="var(--secondary)" /> {activeStop.time}
              </div>
            </div>
          </div>

          {/* Sub-status badge */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Status da Parada:</span>
            <strong style={{ color: isArrived ? 'var(--secondary)' : 'var(--warning)' }}>
              {isArrived ? 'Em andamento (Van na parada)' : 'A caminho'}
            </strong>
          </div>

          {/* Navigation and arrival actions */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn btn-outline" 
              style={{ flex: 1, display: 'flex', gap: '0.25rem', fontSize: '0.85rem', padding: '0.5rem' }}
              onClick={() => handleOpenNavigation(activeStop.address)}
            >
              <Navigation size={16} /> Abrir GPS
            </button>
            
            {!isArrived ? (
              <button 
                className="btn" 
                style={{ flex: 1, backgroundColor: 'var(--secondary)', color: 'white', fontSize: '0.85rem', padding: '0.5rem' }}
                onClick={() => setIsArrived(true)}
              >
                Cheguei na parada
              </button>
            ) : (
              <button 
                className="btn" 
                disabled={!isActiveStopComplete}
                style={{ 
                  flex: 1, 
                  backgroundColor: isActiveStopComplete ? 'var(--secondary)' : 'var(--border)', 
                  color: isActiveStopComplete ? 'white' : 'var(--text-secondary)',
                  cursor: isActiveStopComplete ? 'pointer' : 'not-allowed',
                  fontSize: '0.85rem',
                  padding: '0.5rem'
                }}
                onClick={() => handleConcludeStop(activeStop)}
              >
                Concluir parada
              </button>
            )}
          </div>

          {/* Quick Check-in Passenger List for this stop */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem' }}>Passageiros nesta Parada ({activeStop.passengers.length})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {activeStop.passengers.map(p => (
                <div 
                  key={p.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '0.5rem 0.75rem', 
                    backgroundColor: 'var(--bg-primary)', 
                    borderRadius: 'var(--radius-md)',
                    border: p.status === 'checked' ? '1px solid #a7f3d0' : p.status === 'missing' ? '1px solid #fecaca' : '1px solid transparent'
                  }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{p.name}</span>
                  
                  {p.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handlePassengerStatus(activeStop.id, p.id, 'checked')}
                        style={{
                          backgroundColor: '#dcfce3',
                          border: 'none',
                          cursor: 'pointer',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <UserCheck size={14} color="var(--secondary)" />
                      </button>
                      <button 
                        onClick={() => setShowConfirmMissing({ stopId: activeStop.id, passenger: p })}
                        style={{
                          backgroundColor: '#fee2e2',
                          border: 'none',
                          cursor: 'pointer',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <UserX size={14} color="var(--danger)" />
                      </button>
                    </div>
                  ) : (
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold', 
                      color: p.status === 'checked' ? 'var(--secondary)' : 'var(--danger)',
                      backgroundColor: p.status === 'checked' ? '#dcfce3' : '#fee2e2',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px'
                    }}>
                      {p.status === 'checked' ? 'Embarcou' : 'Faltou'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {routeStatus === 'Finalizada' && (
        <div className="card" style={{ borderLeft: '4px solid var(--primary)', backgroundColor: 'var(--primary-light)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ color: 'var(--primary)', margin: 0 }}>Rota Finalizada</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Obrigado! A viagem foi encerrada com sucesso. Os dados operacionais e de checklist de faltas foram devidamente sincronizados com a MoveCorp.
          </p>
          <button className="btn btn-primary" style={{ backgroundColor: 'var(--primary)', marginTop: '0.5rem' }} onClick={() => navigate('/login')}>
            Voltar ao Login
          </button>
        </div>
      )}

      {/* MODAL 1: STOP SUMMARY REPORT */}
      {showStopSummary && summaryData && (
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
            <h3 style={{ margin: 0, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={22} /> {activeStopIndex === stops.length - 1 ? 'Última parada concluída!' : 'Parada Concluída!'}
            </h3>
            
            <div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Endereço:</p>
              <strong style={{ fontSize: '0.9rem' }}>{summaryData.address}</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
              <div>Embarcaram: <strong>{summaryData.boarded.length} passageiro(s)</strong></div>
              {summaryData.boarded.length > 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '0.5rem' }}>
                  {summaryData.boarded.join(', ')}
                </div>
              )}

              <div style={{ marginTop: '0.25rem' }}>Ausentes: <strong style={{ color: summaryData.absent.length > 0 ? 'var(--danger)' : 'inherit' }}>{summaryData.absent.length} passageiro(s)</strong></div>
              {summaryData.absent.length > 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '0.5rem' }}>
                  {summaryData.absent.join(', ')}
                </div>
              )}
            </div>

            {activeStopIndex === stops.length - 1 && (
              <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#dcfce3', color: 'var(--secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'center' }}>
                Todas as paradas foram atendidas!
              </div>
            )}

            {activeStopIndex < stops.length - 1 && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>A seguir:</p>
                <strong style={{ fontSize: '0.9rem' }}>{summaryData.nextStopAddress}</strong>
              </div>
            )}

            {activeStopIndex < stops.length - 1 ? (
              <button 
                className="btn" 
                style={{ backgroundColor: 'var(--secondary)', color: 'white' }}
                onClick={handleProceedToNextStop}
              >
                Seguir para próxima parada
              </button>
            ) : (
              <button 
                className="btn" 
                style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                onClick={() => {
                  setShowStopSummary(false);
                  // Conclude the last stop
                  setStops(prev => prev.map((s, idx) => idx === activeStopIndex ? { ...s, status: 'done' } : s));
                  setShowConfirmFinish(true);
                }}
              >
                Finalizar rota
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM LACK OF PRESENCE */}
      {showConfirmMissing && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 210,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '340px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'white' }}>
            <h3 style={{ margin: 0, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <AlertTriangle size={20} /> Confirmar Ausência?
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Marcar falta para <strong>{showConfirmMissing.passenger.name}</strong> registrará uma ausência e poderá aplicar penalidade de advertência na conta do colaborador caso não haja justificativa antecipada.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn btn-outline" 
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }} 
                onClick={() => setShowConfirmMissing(null)}
              >
                Cancelar
              </button>
              <button 
                className="btn" 
                style={{ flex: 1, backgroundColor: 'var(--danger)', color: 'white', padding: '0.5rem', fontSize: '0.85rem' }}
                onClick={() => {
                  handlePassengerStatus(showConfirmMissing.stopId, showConfirmMissing.passenger.id, 'missing');
                  setShowConfirmMissing(null);
                }}
              >
                Confirmar Falta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRM FINISH ROUTE */}
      {showConfirmFinish && (
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
          <div className="card" style={{ width: '100%', maxWidth: '340px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'white' }}>
            <h3 style={{ margin: 0, color: remaining > 0 || stops.some(s => s.status !== 'done') ? 'var(--warning)' : 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <AlertTriangle size={20} /> Finalizar Rota?
            </h3>
            
            {remaining > 0 || stops.some(s => s.status !== 'done') ? (
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <strong style={{ color: 'var(--danger)' }}>Atenção:</strong> Ainda restam paradas pendentes ou passageiros que não foram marcados nesta viagem. Tem certeza que deseja encerrar a rota agora?
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Todas as paradas foram concluídas e todos os passageiros foram catalogados. Deseja encerrar a rota do dia e salvar o relatório?
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn btn-outline" 
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }} 
                onClick={() => setShowConfirmFinish(false)}
              >
                Voltar
              </button>
              <button 
                className="btn" 
                style={{ 
                  flex: 1, 
                  backgroundColor: remaining > 0 || stops.some(s => s.status !== 'done') ? 'var(--warning)' : 'var(--primary)', 
                  color: 'white', 
                  padding: '0.5rem', 
                  fontSize: '0.85rem' 
                }}
                onClick={handleFinishRoute}
              >
                Sim, Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

