import React, { useState } from 'react';
import { Map, Zap, RefreshCw, Navigation, Truck, Settings } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import { PointIcon, VanIcon, AlertVanIcon } from '../../components/MapMarkers';

export default function CompanyRoutes() {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      alert('Roteirização concluída! 2 rotas foram consolidadas com economia de 18% no trajeto estimado.');
    }, 2500);
  };

  return (
    <div className="page-transition">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Rotas e Frota (Tempo Real)</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Rastreie as operações atuais ou reotimize a malha de trajetos.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto' }}>
            <Settings size={18} /> Configurar Parâmetros
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleGenerate}
            disabled={generating}
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)' }}
          >
            {generating ? <RefreshCw size={18} className="spin-anim" /> : <Zap size={18} fill="currentColor" />}
            {generating ? 'Processando Algoritmo...' : 'Gerar Novas Rotas (A.I.)'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1.5rem', height: 'calc(100vh - 180px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
          <div className="card" style={{ borderLeft: '4px solid var(--secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>RT-14</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Centro - Zona Sul</p>
              </div>
              <span style={{ backgroundColor: '#dcfce3', color: 'var(--secondary)', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 'bold' }}>Em Rota</span>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <Truck size={14} /> Carlos (Van ABC-1234)
            </div>
            <div style={{ marginTop: '0.5rem', width: '100%', backgroundColor: 'var(--bg-primary)', height: '6px', borderRadius: '3px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '65%', backgroundColor: 'var(--secondary)', borderRadius: '3px' }}></div>
            </div>
            <p style={{ margin: 0, marginTop: '0.25rem', fontSize: '0.75rem', textAlign: 'right', color: 'var(--text-secondary)' }}>65% Concluído (10/15 Emb.)</p>
          </div>

          <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>RT-42</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Zona Norte - Fábrica</p>
              </div>
              <span style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 'bold' }}>Atrasada</span>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <Truck size={14} /> Marcos (Micro DEF-999)
            </div>
            <div style={{ marginTop: '0.5rem', width: '100%', backgroundColor: 'var(--bg-primary)', height: '6px', borderRadius: '3px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '15%', backgroundColor: 'var(--danger)', borderRadius: '3px' }}></div>
            </div>
            <p style={{ margin: 0, marginTop: '0.25rem', fontSize: '0.75rem', textAlign: 'right', color: 'var(--text-secondary)' }}>Ociosa (6/15 Emb.)</p>
          </div>
        </div>

        <div className="card" style={{ padding: 0, position: 'relative', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
          
          <MapContainer 
            center={[-23.55550, -46.640308]} 
            zoom={13} 
            zoomControl={false}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
          >
            <TileLayer
              attribution='&copy; OSM'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            
            {/* Rota 14 (Boa Ocupação) */}
            <Polyline positions={[[-23.55550, -46.640308], [-23.56152, -46.650308], [-23.56852, -46.660308]]} color="var(--primary)" weight={4} opacity={0.6} />
            <Marker position={[-23.56152, -46.650308]} icon={VanIcon} />
            
            {/* Rota 42 (Atrasada/Ociosa) */}
            <Polyline positions={[[-23.53550, -46.620308], [-23.54152, -46.630308]]} color="var(--danger)" weight={4} opacity={0.6} strokeDasharray="5,5" />
            <Marker position={[-23.54152, -46.630308]} icon={AlertVanIcon} />

          </MapContainer>

          <div style={{ position: 'absolute', top: '2rem', left: '2rem', backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', zIndex: 10 }}>
             <h3 style={{ margin: 0, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Map size={18} /> Visão Satélite</h3>
             <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>2 Rotas ativas / 1 Atrasada na malha viária.</p>
          </div>
        </div>
      </div>
      <style>{`
        .spin-anim { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
