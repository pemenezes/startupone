import React from 'react';
import { Users, Truck, AlertTriangle, TrendingDown } from 'lucide-react';
import { useAppContext } from '../../app-context';

export default function Dashboard() {
  const { employees, driver, regions } = useAppContext();
  const activeVans = regions.reduce((total, region) => total + region.activeVans, 0);
  const occupancy = Math.round((driver.todayRoute.checkedIn / driver.todayRoute.passengersTotal) * 100);
  return (
    <div className="page-transition">
      <div className="company-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Dashboard Operacional</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Visão geral da operação em tempo real.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Status Geral:</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: 'bold' }}>Operação Normal</span>
        </div>
      </div>

      <div className="company-metric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            <span>Colaboradores Cadastrados</span>
            <Users size={20} />
          </div>
          <h2 style={{ fontSize: '2rem', margin: 0 }}>{employees.length}</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', margin: 0 }}>Base local atualizada</p>
        </div>
        
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            <span>Ocupação Média Total</span>
            <TrendingDown size={20} />
          </div>
          <h2 style={{ fontSize: '2rem', margin: 0 }}>{occupancy}%</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--warning)', margin: 0 }}>-2% em relação a ontém</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            <span>Veículos em Rota Hoje</span>
            <Truck size={20} />
          </div>
          <h2 style={{ fontSize: '2rem', margin: 0 }}>{activeVans}</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', margin: 0 }}>100% da frota ativa</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            <span>Ocorrências / Atrasos</span>
            <AlertTriangle size={20} />
          </div>
          <h2 style={{ fontSize: '2rem', margin: 0 }}>{driver.penalties.level}</h2>
          <p style={{ fontSize: '0.8rem', color: driver.penalties.level ? 'var(--danger)' : 'var(--secondary)', margin: 0 }}>{driver.penalties.level ? 'Ação recomendada' : 'Tudo sob controle'}</p>
        </div>
      </div>

      <div className="company-content-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '0' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0 }}>Rotas Críticas (Baixa Ocupação)</h3>
          </div>
          <div className="table-scroll" style={{ padding: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ paddingBottom: '1rem' }}>ID da Rota</th>
                  <th style={{ paddingBottom: '1rem' }}>Trajeto</th>
                  <th style={{ paddingBottom: '1rem' }}>Capacidade</th>
                  <th style={{ paddingBottom: '1rem' }}>Ocupação</th>
                  <th style={{ paddingBottom: '1rem' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0' }}>{driver.todayRoute.id}</td>
                  <td>{driver.todayRoute.name}</td>
                  <td>{driver.vehicle.capacity} LUGARES</td>
                  <td style={{ color: occupancy < 60 ? 'var(--danger)' : 'var(--warning)', fontWeight: 'bold' }}>{occupancy}% ({driver.todayRoute.checkedIn} Pessoas)</td>
                  <td><button className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Reotimizar</button></td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem 0' }}>RT-12</td>
                  <td>Terminal Leste {'->'} Matriz</td>
                  <td>20 LUGARES</td>
                  <td style={{ color: 'var(--warning)', fontWeight: 'bold' }}>60% (12 Pessoas)</td>
                  <td><button className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Unificar</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Economia vs. VT</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Custo evitado ao utilizar fretamento consolidado inteligente em vez do vale-transporte individual diário.
          </p>
          <div style={{ padding: '2rem', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Economia Mensal</p>
            <h1 style={{ fontSize: '2.5rem', color: 'var(--secondary)', margin: '0.5rem 0' }}>R$ 14.850</h1>
            <span style={{ fontSize: '0.8rem', backgroundColor: 'var(--secondary)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>+ 12% a/a</span>
          </div>
        </div>
      </div>
    </div>
  );
}

