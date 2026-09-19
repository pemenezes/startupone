import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Car,
  ChevronRight,
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
import { employeeAttendanceCopy } from '../../lib/driverAttendanceState';
import { EXAMPLE_ROUTE, EXAMPLE_PASSENGER_ID, examplePassengerStatus } from '../../lib/exampleJourney';
import { useExampleJourney } from '../../lib/useExampleJourney';

function penaltyStorageKey(employeeId, noShows) {
  return `comfy:penalty-dismissed:${employeeId}:${noShows}`;
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
  const example = useExampleJourney();
  const exampleStatus = examplePassengerStatus(example, EXAMPLE_PASSENGER_ID);
  const { hasActiveTrip, hasSubscription, onboardingComplete, expectedToday, todayRides, journeyStatuses, journeyStatusError, refreshTrip } = useTrip();

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
  const cancelledToday = todayRides.filter((ride) => ride.cancelledToday);

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

      <section className="card example-employee-home-card" aria-label="Viagem de exemplo"><div><span className="eyebrow">Exemplo interativo</span><h2>{EXAMPLE_ROUTE.name}</h2><p>{exampleStatus === 'boarded' ? 'Embarque de Ana confirmado pelo motorista.' : exampleStatus === 'absent' ? 'Ausência de Ana registrada pelo motorista.' : example.startedAt ? 'Jornada em andamento; Ana aguarda o embarque.' : 'Veja como o passageiro acompanha a jornada.'}</p></div><button className="btn btn-outline" type="button" onClick={() => navigate('/employee/example')}>Ver viagem de exemplo</button></section>

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

      {!hasSubscription ? (
        <div className="card" style={{ textAlign: 'center', padding: '1.75rem 1.25rem', display: 'grid', gap: '0.75rem' }}>
          <RouteIcon size={36} color="var(--primary)" style={{ margin: '0 auto' }} />
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Defina sua rota fixa</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {onboardingComplete
              ? 'Escolha ida e/ou volta e os dias presenciais. O app assume esses dias toda semana.'
              : 'Conclua o cadastro (empresa, endereços e região) e escolha sua rota.'}
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
      ) : !hasActiveTrip ? (
        <div className="card" style={{ textAlign: 'center', padding: '1.75rem 1.25rem', display: 'grid', gap: '0.75rem' }}>
          <RouteIcon size={36} color="var(--primary)" style={{ margin: '0 auto' }} />
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{cancelledToday.length ? 'Viagem cancelada hoje' : 'Sem fretado hoje'}</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {cancelledToday.length ? 'Seu cancelamento foi registrado. Seu plano semanal continua ativo.' : 'Hoje não está nos seus dias presenciais. Seu plano semanal continua ativo.'}
          </p>
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => navigate('/employee/onboarding/route')}
          >
            Ajustar plano de rotas
          </button>
        </div>
      ) : (
        <>
          <div className="section-title">
            <Navigation size={20} />
            <h2>Sua viagem hoje</h2>
          </div>
          {expectedToday.map((ride) => {
            const r = ride.route;
            const d = r?.driver;
            const attendance = journeyStatuses.find((item) => item.journey?.route_id === ride.route_id);
            const liveStatus = employeeAttendanceCopy(attendance);
            return (
              <article key={ride.id} className="card journey-card" style={{ marginBottom: '0.75rem' }}>
                <header>
                  <div>
                    <small>{r?.direction === 'return' ? 'Volta' : 'Ida'}</small>
                    <h2>{r?.name}</h2>
                  </div>
                  <span className={liveStatus.className}>{liveStatus.label}</span>
                </header>
                <div className="journey-time">
                  <span>
                    <small>Saída prevista</small>
                    <strong>{r?.typical_start_time || r?.estimated_arrival}</strong>
                  </span>
                  <span>
                    <small>ETA estimado</small>
                    <strong>{r?.eta_minutes ?? '—'} min</strong>
                  </span>
                </div>
                <div className="journey-details">
                  <span>
                    <MapPin size={17} />
                    <small>Embarque / destino</small>
                    <strong>{profile?.home_address || r?.boarding_stop}</strong>
                  </span>
                  <span>
                    <MapPin size={17} />
                    <small>Destino comum</small>
                    <strong>{r?.destination_label || r?.boarding_stop}</strong>
                  </span>
                  <button type="button" onClick={() => navigate('/employee/driver-profile')}>
                    <User size={17} />
                    <span>
                      <small>Motorista</small>
                      <strong>
                        {d?.name || 'A definir'}{' '}
                        {d ? (
                          <>
                            <Star size={13} fill="var(--warning)" /> {d.rating?.average?.toFixed?.(1)}
                          </>
                        ) : null}
                      </strong>
                    </span>
                    <ChevronRight size={18} />
                  </button>
                  <span>
                    <Car size={17} />
                    <small>Veículo</small>
                    <strong>{d?.vehicle?.label || 'Van da operação'}</strong>
                  </span>
                </div>
              </article>
            );
          })}
          {cancelledToday.map((ride) => <div key={ride.id} className="notice-card notice-card--warning"><Navigation size={20} /><span><strong>{ride.route?.name}</strong><small>Viagem cancelada hoje</small></span></div>)}
          {journeyStatusError && <div className="notice-card notice-card--warning"><AlertTriangle size={20} /><span><strong>Situação temporariamente indisponível</strong><small>{journeyStatusError.message}</small></span><button type="button" onClick={refreshTrip}>Tentar novamente</button></div>}
          <div className="journey-actions" style={{ display: 'grid', gap: '0.5rem' }}>
            <button className="btn btn-primary" type="button" onClick={() => navigate('/employee/track')}>
              <Navigation size={18} /> Acompanhar van
            </button>
            <button className="btn btn-outline" type="button" onClick={() => navigate('/employee/cancel')}>
              Cancelar só hoje
            </button>
          </div>

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
                <strong>Ajustar plano</strong>
                <small>Trocar rota ou dias da semana</small>
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
