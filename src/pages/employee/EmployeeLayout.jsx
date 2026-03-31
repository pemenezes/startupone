import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import HomeEmployee from './HomeEmployee';
import TrackVan from './TrackVan';
import Credits from './Credits';
import CancelTrip from './CancelTrip';
import ReviewDriver from './ReviewDriver';

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
        <Routes>
          <Route path="/" element={<HomeEmployee />} />
          <Route path="/track" element={<TrackVan />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/cancel" element={<CancelTrip />} />
          <Route path="/review" element={<ReviewDriver />} />
          <Route path="*" element={<HomeEmployee />} />
        </Routes>
      </div>

      <BottomNav role="employee" />
    </div>
  );
}
