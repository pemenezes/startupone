import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightLeft, Wallet, Ticket, Plus } from 'lucide-react';
import { useAppContext } from '../../app-context';
import { useAuth } from '../../auth-context';

export default function Credits() {
  const navigate = useNavigate();
  const { currentEmployee, updateWalletBalance } = useAppContext();
  const { profile } = useAuth();
  const employeeId = profile?.id || currentEmployee.id;
  const balance = currentEmployee.wallet.balance;
  const [exchangeAmount, setExchangeAmount] = useState(0);
  const [addAmount, setAddAmount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleExchange = async () => {
    if (exchangeAmount <= 0 || exchangeAmount > balance) {
      alert('Valor inválido ou saldo insuficiente.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await updateWalletBalance(employeeId, -exchangeAmount, 'Troca VT');
      setExchangeAmount(0);
    } catch (err) {
      setError(err.message || 'Falha ao converter créditos.');
    } finally {
      setBusy(false);
    }
  };

  const handleAddBalance = async () => {
    if (addAmount <= 0) {
      alert('Valor inválido.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await updateWalletBalance(employeeId, addAmount, 'Adição de saldo');
      setAddAmount(0);
    } catch (err) {
      setError(err.message || 'Falha ao adicionar saldo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-transition">
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Meus Créditos</h1>

      <div
        className="card"
        style={{
          backgroundColor: 'var(--primary)',
          color: 'white',
          border: 'none',
          marginBottom: '1.5rem',
          backgroundImage: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <Wallet size={28} />
          <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Saldo disponível</span>
        </div>
        <div>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }}>
            R$ {balance.toFixed(2).replace('.', ',')}
          </h2>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>
            Conta de {profile?.full_name || currentEmployee.name}
            {currentEmployee.wallet.lastTopUp
              ? ` · última recarga ${currentEmployee.wallet.lastTopUp}`
              : ''}
          </p>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: '#fef2f2',
            color: '#b91c1c',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.85rem',
          }}
        >
          {error}
        </div>
      )}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} color="var(--primary)" /> Adicionar saldo
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          O valor é gravado na sua conta MoveCorp e permanece após atualizar a página.
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button className="btn btn-outline" type="button" style={{ padding: '0.5rem' }} onClick={() => setAddAmount(20)}>
            R$ 20
          </button>
          <button className="btn btn-outline" type="button" style={{ padding: '0.5rem' }} onClick={() => setAddAmount(50)}>
            R$ 50
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)',
              }}
            >
              R$
            </span>
            <input
              type="number"
              value={addAmount === 0 ? '' : addAmount}
              onChange={(e) => setAddAmount(Number(e.target.value))}
              placeholder="0,00"
              style={{
                width: '100%',
                padding: '0.75rem',
                paddingLeft: '2.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            className="btn btn-primary"
            type="button"
            style={{ width: 'auto', padding: '0.75rem 1rem' }}
            onClick={handleAddBalance}
            disabled={busy}
          >
            {busy ? '...' : 'Adicionar'}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Ticket size={18} color="var(--primary)" /> Converter para VT
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Transfere créditos MoveCorp para Vale-Transporte (débito persistente no saldo).
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button className="btn btn-outline" type="button" style={{ padding: '0.5rem' }} onClick={() => setExchangeAmount(50)}>
            R$ 50
          </button>
          <button className="btn btn-outline" type="button" style={{ padding: '0.5rem' }} onClick={() => setExchangeAmount(100)}>
            R$ 100
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)',
              }}
            >
              R$
            </span>
            <input
              type="number"
              value={exchangeAmount === 0 ? '' : exchangeAmount}
              onChange={(e) => setExchangeAmount(Number(e.target.value))}
              placeholder="0,00"
              style={{
                width: '100%',
                padding: '0.75rem',
                paddingLeft: '2.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            className="btn btn-primary"
            type="button"
            style={{ width: 'auto', padding: '0.75rem 1rem' }}
            onClick={handleExchange}
            disabled={busy}
          >
            <ArrowRightLeft size={18} />
          </button>
        </div>
      </div>

      <button
        type="button"
        className="btn btn-outline"
        onClick={() => navigate('/employee/credits/history')}
        style={{ width: '100%', marginTop: '0.5rem' }}
      >
        Ver histórico de uso
      </button>
    </div>
  );
}
