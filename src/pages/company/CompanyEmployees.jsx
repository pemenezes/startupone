import React, { useState } from 'react';
import { UploadCloud, Search, MoreVertical, ShieldAlert } from 'lucide-react';
import { useAppContext } from '../../AppContext';
 
export default function CompanyEmployees() {
  const { employees, importEmployees } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [uploaded, setUploaded] = useState(false);
 
  const filtered = employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));
 
  const handleUpload = () => {
    setUploaded(true);
    setTimeout(() => {
      const newEmployees = [
        { id: 'E101', name: 'Ricardo Lima', department: 'TI', route: 'Linha Centro', penalty: 0, credits: '350.00', wallet: { balance: 350, lastTopUp: '2026-04-20' }, penalties: { noShows: 0, status: 'stable', nextPenaltyAt: 3 } },
        { id: 'E102', name: 'Beatriz Costa', department: 'Vendas', route: 'Zona Sul', penalty: 0, credits: '350.00', wallet: { balance: 350, lastTopUp: '2026-04-20' }, penalties: { noShows: 0, status: 'stable', nextPenaltyAt: 3 } },
      ];
      importEmployees(newEmployees);
      alert("Planilha Excel: Novos colaboradores importados com sucesso!");
      setUploaded(false);
    }, 1500);
  };
 
  return (
    <div className="page-transition">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Gestão de Funcionários</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Adicione colaboradores e gerencie o benefício integral.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleUpload}
          style={{ width: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
        >
          {uploaded ? <span className="loader" style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <UploadCloud size={18} />}
          {uploaded ? 'Processando...' : 'Importar Planilha (XLSX / CSV)'}
        </button>
      </div>
 
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
        <Search size={20} color="var(--text-secondary)" />
        <input 
          type="text" 
          placeholder="Buscar funcionário por nome ou chapa..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem', color: 'var(--text-primary)' }}
        />
      </div>
 
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
            <tr style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <th style={{ padding: '1rem 1.5rem' }}>Chapa</th>
              <th style={{ padding: '1rem 1.5rem' }}>Nome (Depto)</th>
              <th style={{ padding: '1rem 1.5rem' }}>Rota Atual</th>
              <th style={{ padding: '1rem 1.5rem' }}>Crédito MoveCorp</th>
              <th style={{ padding: '1rem 1.5rem' }}>Penalidades</th>
              <th style={{ padding: '1rem 1.5rem' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(emp => (
              <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem' }}>{emp.id}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{emp.name}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{emp.department || 'N/A'}</p>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {emp.activeRoute?.name || 'Não alocado'}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>R$ {emp.wallet?.balance.toFixed(2) || '0.00'}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  {emp.penalties?.noShows > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      <ShieldAlert size={16} />
                      {emp.penalties.noShows} Advertência(s)
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Ok</span>
                  )}
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <MoreVertical size={20} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Nenhum funcionário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
