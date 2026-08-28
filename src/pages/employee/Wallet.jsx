import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, PlusCircle, History, ArrowLeft, CreditCard } from 'lucide-react';
import { useAppContext } from '../../app-context';
 
export default function WalletPage() {
  const navigate = useNavigate();
  const { currentEmployee, updateWalletBalance } = useAppContext();
  const [amount, setAmount] = useState('');
 
  const handleTopUp = (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    
    updateWalletBalance(currentEmployee.id, val);
    alert(`Top-up of ${val} StartupCoins successful!`);
    setAmount('');
  };
 
  return (
    <div className="page-transition">
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-outline" 
        style={{ width: 'auto', marginBottom: '1.5rem', padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
      >
        <ArrowLeft size={18} /> Voltar
      </button>
 
      <div className="card" style={{ backgroundColor: 'var(--primary)', color: 'white', textAlign: 'center', padding: '2rem 1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <Wallet size={48} />
        </div>
        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Saldo Atual</p>
        <h1 style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>{currentEmployee.wallet.balance.toFixed(2)} <span style={{ fontSize: '1.2rem' }}>SC</span></h1>
        <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Última recarga: {currentEmployee.wallet.lastTopUp}</p>
      </div>
 
      <h3 style={{ marginBottom: '1rem' }}>Recarregar Saldo</h3>
      <form onSubmit={handleTopUp} className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              placeholder="Valor em R$" 
              required 
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', fontSize: '1rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
            <PlusCircle size={18} /> Recarregar
          </button>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
          1 Real = 1 StartupCoin. O crédito cai instantaneamente na sua conta.
        </p>
      </form>
 
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <History size={20} color="var(--text-secondary)" />
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Histórico de Movimentações</h3>
      </div>
 
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[
          { date: '2026-04-15', type: 'Viagem - Linha Centro', amount: -15.00, status: 'Concluída' },
          { date: '2026-04-10', type: 'Recarga de Saldo', amount: 100.00, status: 'Sucesso' },
          { date: '2026-04-02', type: 'Viagem - Linha Centro', amount: -15.00, status: 'Concluída' },
        ].map((tx, i) => (
          <div key={i} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ backgroundColor: tx.amount > 0 ? '#f0fdf4' : '#fef2f2', padding: '0.5rem', borderRadius: '50%', color: tx.amount > 0 ? 'var(--secondary)' : 'var(--danger)' }}>
                <CreditCard size={18} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>{tx.type}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{tx.date}</p>
              </div>
            </div>
            <span style={{ fontWeight: 'bold', color: tx.amount > 0 ? 'var(--secondary)' : 'var(--danger)' }}>
              {tx.amount > 0 ? `+${tx.amount}` : tx.amount} SC
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

