import React from 'react';
import { ArrowLeft, Car, ShieldCheck, Star } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAppContext } from '../../app-context';
import { useTrip } from '../../TripContext';

export default function DriverProfile() {
  const navigate = useNavigate();
  const { driver: mockDriver } = useAppContext();
  const { activeTrip, hasActiveTrip } = useTrip();

  if (!hasActiveTrip) {
    return <Navigate to="/employee/onboarding/route" replace />;
  }

  const tripDriver = activeTrip.route?.driver;
  const driver = tripDriver
    ? {
        name: tripDriver.name,
        photo: tripDriver.photo,
        rating: tripDriver.rating,
        vehicle: tripDriver.vehicle,
        securityInfo: {
          verifiedSince: tripDriver.verifiedSince
            ? new Date(tripDriver.verifiedSince).toLocaleDateString('pt-BR')
            : '—',
        },
      }
    : mockDriver;

  return (
    <div className="page-transition">
      <button className="back-link" type="button" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Voltar
      </button>
      <article className="card profile-hero">
        <img className="profile-hero__avatar" src={driver.photo} alt={driver.name} />
        <span className="eyebrow">Seu motorista hoje</span>
        <h1>{driver.name}</h1>
        <div className="rating-line">
          <Star size={18} fill="var(--warning)" /> <strong>{Number(driver.rating.average).toFixed(1)}</strong>
          <span>({driver.rating.totalReviews} avaliações)</span>
        </div>
        <div className="profile-detail-grid">
          <div>
            <Car size={20} />
            <span>
              <small>Veículo</small>
              <strong>{driver.vehicle.model}</strong>
              <small>{driver.vehicle.plate}</small>
            </span>
          </div>
          <div>
            <ShieldCheck size={20} />
            <span>
              <small>Verificação</small>
              <strong>Perfil aprovado</strong>
              <small>Desde {driver.securityInfo.verifiedSince}</small>
            </span>
          </div>
        </div>
        {driver.vehicle.photo && (
          <img className="vehicle-photo" src={driver.vehicle.photo} alt={`Veículo de ${driver.name}`} />
        )}
        <div className="success-note">
          <ShieldCheck size={20} />
          <span>
            <strong>Perfil verificado</strong>
            <small>Documentação e antecedentes validados pela MoveCorp.</small>
          </span>
        </div>
      </article>
    </div>
  );
}
