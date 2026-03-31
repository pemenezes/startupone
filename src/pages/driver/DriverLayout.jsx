import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import HomeDriver from './HomeDriver';
import PassengerList from './PassengerList';
import MapNavigation from './MapNavigation';

export default function DriverLayout() {
  const navigate = useNavigate();
  return (
    <div className="container" style={{ paddingBottom: '80px', backgroundColor: '#f0fdf4', minHeight: '100vh' }}>
      <header style={{ 
        padding: '1rem', 
        backgroundColor: 'var(--secondary)', 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 'var(--radius-lg)',
        borderBottomRightRadius: 'var(--radius-lg)'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Driver Panel</h2>
        <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>Sair</button>
      </header>

      <div style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<HomeDriver />} />
          <Route path="/passengers" element={<PassengerList />} />
          <Route path="/map" element={<MapNavigation />} />
          <Route path="*" element={<HomeDriver />} />
        </Routes>
      </div>

      <BottomNav role="driver" />
    </div>
  );
}
