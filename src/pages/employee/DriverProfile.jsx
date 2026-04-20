import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShieldCheck, Car, ArrowLeft, MapPin } from 'lucide-react';
import { driverUser } from '../../data/mockData';
 
export default function DriverProfile() {
  const navigate = useNavigate();
 
  return (
    <div className="page-transition">
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-outline" 
        style={{ width: 'auto', marginBottom: '1.5rem', padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
      >
        <ArrowLeft size={18} /> Voltar
      </button>
 
      <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
        <img 
          src={driverUser.photo} 
          alt={driverUser.name} 
          style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--primary)', marginBottom: '1rem' }} 
        />
        <h2 style={{ margin: '0 0 0.5rem 0' }}>{driverUser.name}</h2>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.25rem', color: 'var(--warning)', marginBottom: '1.5rem' }}>
          <Star size={18} fill="var(--warning)" />
          <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{driverUser.rating.average}</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>({driverUser.rating.totalReviews} avaliações)</span>
        </div>
 
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'left' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
              <Car size={18} />
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Veículo</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>{driverUser.vehicle.model}</p>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>Placa: {driverUser.vehicle.plate}</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
              <ShieldCheck size={18} />
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Segurança</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>Verificado: Sim</p>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>Desde: {driverUser.securityInfo.verifiedSince}</p>
          </div>
        </div>
 
        <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Fotos do Veículo</h3>
          <img 
            src={driverUser.vehicle.photo} 
            alt="Veículo" 
            style={{ width: '100%', borderRadius: 'var(--radius-md)', objectFit: 'cover', maxHeight: '200px' }} 
          />
        </div>
 
        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', marginBottom: '0.5rem' }}>
            <ShieldCheck size={18} />
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Perfil Verificado</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#166534' }}>
            Este motorista passou por todas as verificações de antecedentes e documentação exigidas pela MoveCorp.
          </p>
        </div>
      </div>
    </div>
  );
}
