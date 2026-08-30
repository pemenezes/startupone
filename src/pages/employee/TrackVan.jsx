import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Star, Navigation, MapPin, Car, Info } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { PointIcon, VanIcon } from '../../components/MapMarkers';
import { useTrip } from '../../TripContext';

// Static map anchors until live driver GPS is implemented
const BOARDING_CENTER = [-23.55052, -46.633308];
const VAN_PLACEHOLDER = [-23.5555, -46.6403];

export default function TrackVan() {
  const navigate = useNavigate();
  const { activeTrip, hasActiveTrip } = useTrip();

  if (!hasActiveTrip) {
    return <Navigate to="/employee/onboarding/route" replace />;
  }

  const route = activeTrip.route;
  const driver = route.driver;

  return (
    <div
      className="page-transition"
      style={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem' }}>
        <button
          type="button"
          onClick={() => navigate('/employee')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <ArrowLeft size={24} color="var(--text-primary)" />
        </button>
        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Rastreamento</h2>
      </div>

      <div
        style={{
          flex: 1,
          backgroundColor: '#e2e8f0',
          borderRadius: 'var(--radius-lg)',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}
      >
        <MapContainer
          center={BOARDING_CENTER}
          zoom={14}
          zoomControl={false}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={VAN_PLACEHOLDER} icon={VanIcon} />
          <Marker position={BOARDING_CENTER} icon={PointIcon} />
        </MapContainer>

        <div
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            right: '1rem',
            backgroundColor: 'var(--bg-secondary)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{route.eta_minutes} MINUTOS</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Chegada estimada: {route.estimated_arrival}
            </p>
          </div>
          <Navigation size={24} color="var(--primary)" />
        </div>
      </div>

      <div
        style={{
          marginTop: '0.75rem',
          padding: '0.65rem 0.85rem',
          borderRadius: 'var(--radius-md)',
          background: '#eff6ff',
          color: '#1e40af',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'flex-start',
          fontSize: '0.8rem',
        }}
      >
        <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
        <span>
          Localização ao vivo do motorista virá em uma próxima versão. O mapa mostra o ponto de embarque e uma
          posição ilustrativa da van.
        </span>
      </div>

      <div className="card" style={{ marginTop: '0.75rem' }}>
        <h3 style={{ marginBottom: '0.35rem' }}>{driver?.name || 'Motorista a definir'}</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <Car size={15} /> {driver?.vehicle?.label || 'Van da operação'}
          </p>
          {driver && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                backgroundColor: 'var(--bg-primary)',
                padding: '0.25rem 0.5rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Star size={14} color="var(--warning)" fill="var(--warning)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{driver.rating.average.toFixed(1)}</span>
            </div>
          )}
        </div>
        <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.35rem' }}>
          <MapPin size={15} color="var(--secondary)" /> {route.boarding_stop} · {route.name}
        </p>
        <button
          className="btn btn-outline"
          type="button"
          style={{ width: '100%', padding: '0.6rem' }}
          onClick={() => navigate('/employee/cancel')}
        >
          Cancelar viagem
        </button>
      </div>
    </div>
  );
}
