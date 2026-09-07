import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Map, Calculator, LogOut, CreditCard } from 'lucide-react';
import Dashboard from './Dashboard';
import Simulator from './Simulator';
import CompanyEmployees from './CompanyEmployees';
import CompanyRoutes from './CompanyRoutes';
import CompanyCredits from './CompanyCredits';
import { useAuth } from '../../auth-context';

export default function CompanyLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

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
    <div className="desktop-container company-shell" style={{ display: 'flex' }}>
      {/* Sidebar Desktop */}
      <aside className="company-sidebar" style={{
        width: '280px', 
        backgroundColor: 'var(--bg-dark)', 
        color: 'white', 
        height: '100vh', 
        position: 'fixed',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: 0, color: 'white' }}>MoveCorp</h2>
          <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>Painel Corporativo</p>
        </div>

        <nav className="company-navigation" style={{ flex: 1, padding: '1.5rem 1rem' }}>
          {menuItems.map((item, idx) => {
            const isRootActive = location.pathname === '/company';
            const finalActive = (item.path === '/company' && isRootActive) || (item.path !== '/company' && location.pathname.startsWith(item.path));
            
            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: finalActive ? 'var(--primary)' : 'transparent',
                  color: 'white',
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
      <main className="company-content" style={{ marginLeft: '280px', padding: '2rem', width: 'calc(100% - 280px)', backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
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
