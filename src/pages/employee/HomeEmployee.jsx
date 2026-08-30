import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Car,
  ChevronRight,
  Clock,
  MapPin,
  Navigation,
  Route as RouteIcon,
  Star,
  User,
  Wallet,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../app-context';
import { useTrip } from '../../TripContext';
import { useAuth } from '../../auth-context';

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
    noShows === 1 ? 'Você possui 1 advertência' : `Você possui ${noShows} advertências`;

  const body = `${noShows} ausência(s) sem cancelamento. A suspensão acontece ao atingir ${nextPenaltyAt} (faltam ${remaining}).`;

  return { title, body };
}

export default function HomeEmployee() {
  const navigate = useNavigate();
  const { currentEmployee } = useAppContext();
  const { profile } = useAuth();
  const { activeTrip, hasActiveTrip, onboardingComplete } = useTrip();

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
  const route = activeTrip?.route;
  const driver = route?.driver;
  const status = statusByRoute.on_time;

  const handleDismiss = () => {
    localStorage.setItem(storageKey, '1');
    setDismissed(true);
  };

  return (
    <div className="page-transition employee-home">
      <section className="employee-greeting">
        <div>
          <span className="eyebrow">Sua mobilidade hoje</span>
          <h1>Olá, {(profile?.full_name || currentEmployee.name).split(' ')[0]}</h1>
          <p>{profile?.home_address ? `Casa: ${profile.home_address}` : currentEmployee.company}</p>
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

      {!hasActiveTrip ? (
        <div className="card" style={{ textAlign: 'center', padding: '1.75rem 1.25rem', display: 'grid', gap: '0.75rem' }}>
          <RouteIcon size={36} color="var(--primary)" style={{ margin: '0 auto' }} />
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Nenhuma viagem ativa</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {onboardingComplete
              ? 'Escolha uma rota da sua empresa para liberar Acompanhar van e Cancelar viagem.'
              : 'Conclua o cadastro (empresa e endereços) e escolha uma rota.'}
          </p>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() =>
              navigate(
                onboardingComplete ? '/employee/onboarding/route' : '/employee/onboarding/company'
              )
            }
          >
            {onboardingComplete ? 'Escolher rota' : 'Continuar cadastro'}
          </button>
        </div>
      ) : (
        <>
          <div className="section-title">
            <Navigation size={20} />
            <h2>Sua viagem hoje</h2>
          </div>
          <article className="card journey-card">
            <header>
              <div>
                <small>Rota</small>
                <h2>{route.name}</h2>
              </div>
              <span className={status.className}>{status.label}</span>
            </header>
            <div className="journey-time">
              <span>
                <small>Previsão de chegada</small>
                <strong>{route.estimated_arrival}</strong>
              </span>
              <span>
                <small>Van no ponto em</small>
                <strong>{route.eta_minutes} min</strong>
              </span>
            </div>
            <div className="journey-details">
              <span>
                <MapPin size={17} />
                <small>Ponto de embarque</small>
                <strong>{route.boarding_stop}</strong>
              </span>
              <button type="button" onClick={() => navigate('/employee/driver-profile')}>
                <User size={17} />
                <span>
                  <small>Motorista</small>
                  <strong>
                    {driver?.name || 'A definir'}{' '}
                    {driver ? (
                      <>
                        <Star size={13} fill="var(--warning)" /> {driver.rating.average.toFixed(1)}
                      </>
                    ) : null}
                  </strong>
                </span>
                <ChevronRight size={18} />
              </button>
              <span>
                <Car size={17} />
                <small>Veículo</small>
                <strong>{driver?.vehicle?.label || 'Van da operação'}</strong>
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
            <button
              className="quick-action"
              type="button"
              onClick={() => navigate('/employee/onboarding/route')}
            >
              <RouteIcon size={20} />
              <span>
                <strong>Trocar rota</strong>
                <small>Escolher outra linha hoje</small>
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
