import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import { driverUser } from '../../data/mockData';
import { VanIcon, PointIcon } from '../../components/MapMarkers';

export default function MapNavigation() {
  const navigate = useNavigate();

  // Coordenadas mockadas para a Rota (São Paulo)
  const routeStops = [
    [-23.55052, -46.633308], // P1
    [-23.55550, -46.640308], // P2
    [-23.56152, -46.650308], // P3
    [-23.56852, -46.660308]  // Destino
  ];
  
  const vanLocation = [-23.55250, -46.635308]; // Atual

  return (
    <div className="page-transition" style={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem' }}>
        <button onClick={() => navigate('/driver')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={24} color="var(--text-primary)" />
        </button>
        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Navegação GPS</h2>
      </div>

      <div style={{ 
        flex: 1, 
        backgroundColor: '#e2e8f0', 
        borderRadius: 'var(--radius-lg)', 
        position: 'relative', 
        overflow: 'hidden',
        border: '1px solid var(--border)',
        marginBottom: '1rem'
      }}>
        
        <MapContainer 
          center={[-23.55550, -46.640308]} 
          zoom={14} 
          zoomControl={false}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
          <TileLayer
            attribution='&copy; OSM'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          <Polyline positions={routeStops} color="var(--primary)" weight={6} opacity={0.6} />

          {/* Posicao da Van */}
          <Marker position={vanLocation} icon={VanIcon} />

          {/* Paradas */}
          {routeStops.map((stop, idx) => (
            <Marker key={idx} position={stop} icon={PointIcon} />
          ))}

        </MapContainer>

        {/* Floating Instruction */}
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', right: '1rem', backgroundColor: 'var(--secondary)', color: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 10 }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Siga na Av. Brasil
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>Próxima parada: {driverUser.todayRoute.stops[1].address}</p>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Chegada na prox. parada</p>
          <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--primary)' }}>5 min</h2>
        </div>
        <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto' }}>
           Confirmar Chegada
        </button>
      </div>

    </div>
  );
}

