import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import { employeeUser } from '../../data/mockData';
import { VanIcon, PointIcon } from '../../components/MapMarkers';

export default function TrackVan() {
  const navigate = useNavigate();

  // Coordenadas mockadas (São Paulo)
  const userLocation = [-23.55052, -46.633308];
  const vanLocation = [-23.56152, -46.650308];
  const routePath = [
    [-23.56152, -46.650308],
    [-23.55850, -46.645308],
    [-23.55550, -46.640308],
    [-23.55052, -46.633308]
  ];

  return (
    <div className="page-transition" style={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem' }}>
        <button onClick={() => navigate('/employee')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={24} color="var(--text-primary)" />
        </button>
        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Rastreamento ao Vivo</h2>
      </div>

      <div style={{ 
        flex: 1, 
        backgroundColor: '#e2e8f0', 
        borderRadius: 'var(--radius-lg)', 
        position: 'relative', 
        overflow: 'hidden',
        border: '1px solid var(--border)'
      }}>
        
        <MapContainer 
          center={[-23.55550, -46.640308]} 
          zoom={14} 
          zoomControl={false}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          {/* Rota Desenhada */}
          <Polyline positions={routePath} color="var(--primary)" weight={5} opacity={0.8} />

          {/* Posicao da Van */}
          <Marker position={vanLocation} icon={VanIcon} />

          {/* Posicao do Funcionario (Parada) */}
          <Marker position={userLocation} icon={PointIcon} />
        </MapContainer>

        {/* Banner Tempo Estimado */}
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', right: '1rem', backgroundColor: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{employeeUser.activeRoute.etaMinutes} MINUTOS</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Chegada estimada: {employeeUser.activeRoute.estimatedArrival}</p>
          </div>
          <Navigation size={24} color="var(--primary)" />
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>{employeeUser.activeRoute.driver}</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{employeeUser.activeRoute.vehicle}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--bg-primary)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)' }}>
            <Star size={14} color="var(--warning)" fill="var(--warning)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{employeeUser.activeRoute.driverRating}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" style={{ flex: 1, padding: '0.6rem' }} onClick={() => navigate('/employee/cancel')}>Cancelar (Multa Aplicável)</button>
        </div>
      </div>
    </div>
  );
}

