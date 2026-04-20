import React, { Suspense, lazy } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';

// Lazy Load components to isolate module evaluation
const HomeEmployee = lazy(() => import('./HomeEmployee'));
const TrackVan = lazy(() => import('./TrackVan'));
const Credits = lazy(() => import('./Credits'));
const CancelTrip = lazy(() => import('./CancelTrip'));
const ReviewDriver = lazy(() => import('./ReviewDriver'));
const DriverProfile = lazy(() => import('./DriverProfile'));
const WalletPage = lazy(() => import('./Wallet'));
const AlternativeTransport = lazy(() => import('./AlternativeTransport'));

export default function EmployeeLayout() {
  const navigate = useNavigate();
  
  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      <header style={{ 
        padding: '1rem', 
        backgroundColor: 'var(--primary)', 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 'var(--radius-lg)',
        borderBottomRightRadius: 'var(--radius-lg)'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>MoveCorp</h2>
        <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>Sair</button>
      </header>
 
      <div style={{ padding: '1rem' }}>
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</div>}>
          <Routes>
            <Route path="/" element={<HomeEmployee />} />
            <Route path="/track" element={<TrackVan />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/cancel" element={<CancelTrip />} />
            <Route path="/review" element={<ReviewDriver />} />
            <Route path="/driver-profile" element={<DriverProfile />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/alternative" element={<AlternativeTransport />} />
            <Route path="*" element={<HomeEmployee />} />
          </Routes>
        </Suspense>
      </div>
 
      <BottomNav role="employee" />
    </div>
  );
}
