import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Car, ChevronRight, Clock, MapPin, Navigation, Sparkles, Star, User, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../app-context';

const statusByRoute = {
  delayed: { label: 'Atraso previsto', className: 'status-badge status-badge--warning' },
  en_route: { label: 'Van a caminho', className: 'status-badge status-badge--success' },
  on_time: { label: 'No horário', className: 'status-badge status-badge--success' },
};

function penaltyStorageKey(employeeId, noShows) {
  return `movecorp:penalty-dismissed:${employeeId}:${noShows}`;
}

function getWarningCopy(penalties) {
  const { noShows, nextPenaltyAt, status } = penalties;
  const remaining = Math.max(nextPenaltyAt - noShows, 0);

  if (status === 'suspended') {
    return {
      title: 'Benefício temporariamente suspenso',
      body: `Sua conta está suspensa após ${noShows} ausência(s) sem cancelamento.`,
    };
  }

  const title =
    noShows === 1
      ? 'Você possui 1 advertência'
      : `Você possui ${noShows} advertências`;

  const body = `${noShows} ausência(s) sem cancelamento. A suspensão acontece ao atingir ${nextPenaltyAt} (faltam ${remaining}).`;

  return { title, body };
}

export default function HomeEmployee() {
  const navigate = useNavigate();
  const { currentEmployee } = useAppContext();
  const route = currentEmployee.activeRoute;
  const status = statusByRoute[route.status] || statusByRoute.on_time;
  const penalties = currentEmployee.penalties;
  const suspended = penalties.status === 'suspended';
  const copy = useMemo(() => getWarningCopy(penalties), [penalties]);
  const storageKey = penaltyStorageKey(currentEmployee.id, penalties.noShows);

  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (penalties.status === 'suspended') return false;
    return localStorage.getItem(storageKey) === '1';
  });

  useEffect(() => {
    if (penalties.status === 'suspended') {
      setDismissed(false);
      return;
    }
    setDismissed(localStorage.getItem(storageKey) === '1');
  }, [storageKey, penalties.status]);

  const showNotice = penalties.status !== 'stable' && !dismissed;

  const handleDismiss = () => {
    localStorage.setItem(storageKey, '1');
    setDismissed(true);
  };

  return (
    <div className="page-transition employee-home">
      <section className="employee-greeting">
        <div>
          <span className="eyebrow">Sua mobilidade hoje</span>
          <h1>Olá, {currentEmployee.name.split(' ')[0]}</h1>
          <p>{currentEmployee.company}</p>
        </div>
        <button className="wallet-pill" type="button" onClick={() => navigate('/employee/credits')}>
          <Wallet size={18} />
          <span>
            <small>Saldo</small>
            <strong>R$ {currentEmployee.wallet.balance.toFixed(2).replace('.', ',')}</strong>
          </span>
        </button>
      </section>

      {showNotice && (
        <div className={suspended ? 'notice-card notice-card--danger' : 'notice-card notice-card--warning'}>
          <AlertTriangle size={22} />
          <span>
            <strong>{copy.title}</strong>
            <small>{copy.body}</small>
          </span>
          <div className="notice-card__actions">
            <button type="button" onClick={() => navigate('/employee/profile')}>
              Ver perfil
            </button>
            {!suspended && (
              <button type="button" className="notice-card__dismiss" onClick={handleDismiss}>
                Dispensar
              </button>
            )}
          </div>
        </div>
      )}

      <div className="section-title">
        <Navigation size={20} />
        <h2>Sua viagem hoje</h2>
      </div>
      <article className="card journey-card">
        <header>
          <div>
            <small>Rota {route.id}</small>
            <h2>{route.name}</h2>
          </div>
          <span className={status.className}>{status.label}</span>
        </header>
        <div className="journey-time">
          <span>
            <small>Previsão de chegada</small>
            <strong>{route.estimatedArrival}</strong>
          </span>
          <span>
            <small>Van no ponto em</small>
            <strong>{route.etaMinutes} min</strong>
          </span>
        </div>
        <div className="journey-details">
          <span>
            <MapPin size={17} />
            <small>Ponto de embarque</small>
            <strong>{route.boardingStop}</strong>
          </span>
          <button type="button" onClick={() => navigate('/employee/driver-profile')}>
            <User size={17} />
            <span>
              <small>Motorista</small>
              <strong>
                {route.driver} <Star size={13} fill="var(--warning)" /> {route.driverRating}
              </strong>
            </span>
            <ChevronRight size={18} />
          </button>
          <span>
            <Car size={17} />
            <small>Veículo</small>
            <strong>{route.vehicle}</strong>
          </span>
          <span>
            <Clock size={17} />
            <small>Ocupação estimada</small>
            <strong>{route.occupancy}%</strong>
          </span>
        </div>
        <div className="journey-actions">
          <button className="btn btn-primary" type="button" onClick={() => navigate('/employee/track')}>
            <Navigation size={18} /> Acompanhar van
          </button>
          <button className="btn btn-outline" type="button" onClick={() => navigate('/employee/cancel')}>
            Cancelar viagem
          </button>
        </div>
      </article>

      <div className="quick-action-grid">
        <button className="quick-action" type="button" onClick={() => navigate('/employee/review')}>
          <Star size={20} />
          <span>
            <strong>Avaliar motorista</strong>
            <small>Conte como foi sua viagem</small>
          </span>
        </button>
        <button className="quick-action" type="button" onClick={() => navigate('/employee/alternative')}>
          <Car size={20} />
          <span>
            <strong>Outras opções</strong>
            <small>Compare transportes</small>
          </span>
        </button>
      </div>

      <div className="section-heading route-heading">
        <div>
          <span className="eyebrow">Recomendadas para você</span>
          <h2>Escolher nova rota</h2>
          <p>Alternativas calculadas a partir do seu endereço e horário.</p>
        </div>
        <Sparkles size={26} color="var(--primary)" />
      </div>
      <div className="route-suggestion-list">
        {currentEmployee.suggestedRoutes.map((suggestion) => (
          <article className="card route-suggestion" key={suggestion.id}>
            <div className="match-score">
              <strong>{suggestion.matchScore}%</strong>
              <small>compatível</small>
            </div>
            <div className="route-suggestion__content">
              <small>{suggestion.id}</small>
              <h3>{suggestion.name}</h3>
              <p>
                <MapPin size={14} /> {suggestion.boardingStop}
              </p>
              <p>
                <Clock size={14} /> {suggestion.estimatedArrival} · van em {suggestion.etaMinutes} min ·{' '}
                {suggestion.occupancy}% ocupado
              </p>
            </div>
            <button type="button" onClick={() => alert(`${suggestion.name} selecionada para simulação.`)}>
              <ChevronRight size={20} />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
