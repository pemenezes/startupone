import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Map, Calculator, LogOut, CreditCard, Menu, X } from 'lucide-react';
import Dashboard from './Dashboard';
import Simulator from './Simulator';
import CompanyEmployees from './CompanyEmployees';
import CompanyRoutes from './CompanyRoutes';
import CompanyCredits from './CompanyCredits';
import { useAuth } from '../../auth-context';
import ComfyBrand from '../../components/ComfyBrand';
import CompanyProvider from './CompanyProvider';
import { useCompanyData } from './company-context';
import './admin.css';

function CompanyShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { company } = useCompanyData();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { label: 'Visão Geral', path: '/company', icon: <LayoutDashboard size={20} /> },
    { label: 'Rotas Operacionais', path: '/company/routes', icon: <Map size={20} /> },
    { label: 'Funcionários', path: '/company/employees', icon: <Users size={20} /> },
    { label: 'Créditos Corporativos', path: '/company/credits', icon: <CreditCard size={20} /> },
    { label: 'Simulador', path: '/company/simulator', icon: <Calculator size={20} /> },
  ];

  return (
    <div className="desktop-container company-shell">
      <div className="company-mobile-header"><button type="button" aria-label="Abrir menu do painel" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu size={22} /></button><ComfyBrand compact /><strong>Painel</strong></div>
      {menuOpen && <button className="company-sidebar-backdrop" type="button" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} />}
      {/* Sidebar Desktop */}
      <aside className={`company-sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <button className="company-sidebar-close" type="button" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}><X size={21} /></button>
          <ComfyBrand inverse compact />
          <p style={{ margin: 0, color: 'var(--brand-support)', fontSize: '0.9rem' }}>Painel Corporativo</p>
          <div className="admin-company-identity"><strong>{company.name}</strong><small>Plano {company.plan}</small></div>
        </div>

        <nav className="company-navigation" style={{ flex: 1, padding: '1.5rem 1rem' }}>
          {menuItems.map((item, idx) => {
            const isRootActive = location.pathname === '/company';
            const finalActive = (item.path === '/company' && isRootActive) || (item.path !== '/company' && location.pathname.startsWith(item.path));
            
            return (
              <button
                key={idx}
                onClick={() => { navigate(item.path); setMenuOpen(false); }}
                aria-current={finalActive ? 'page' : undefined}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: finalActive ? 'var(--brand-highlight)' : 'transparent',
                  color: finalActive ? 'var(--brand-ink)' : 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '0.5rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'var(--transition-fast)'
                }}
              >
                {item.icon}
                <span style={{ fontWeight: finalActive ? 'bold' : 'normal' }}>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button 
            onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', textAlign: 'left' }}
          >
            <LogOut size={20} />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="company-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/employees" element={<CompanyEmployees />} />
          <Route path="/routes" element={<CompanyRoutes />} />
          <Route path="/credits" element={<CompanyCredits />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default function CompanyLayout() {
  return <CompanyProvider><CompanyShell /></CompanyProvider>;
}
