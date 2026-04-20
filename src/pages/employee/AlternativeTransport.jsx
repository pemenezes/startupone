import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AlternativeTransport() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Transporte Alternativo Teste</h1>
      <button className="btn" onClick={() => navigate('/employee')}>Voltar</button>
    </div>
  );
}
