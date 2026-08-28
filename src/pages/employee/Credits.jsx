import React, { useState } from 'react';
import { CreditCard, ArrowRightLeft, Wallet, Ticket, Plus } from 'lucide-react';
import { useAppContext } from '../../app-context';

export default function Credits() {
  const { currentEmployee, updateWalletBalance } = useAppContext();
  const balance = currentEmployee.wallet.balance;
  const [exchangeAmount, setExchangeAmount] = useState(0);
  const [addAmount, setAddAmount] = useState(0);
  
  const [history, setHistory] = useState([
    { id: 1, title: 'Fretado Diário', date: '28/03/2026', amount: -15, type: 'danger' },
    { id: 2, title: 'Troca VT', date: '20/03/2026', amount: -50, type: 'danger' },
    { id: 3, title: 'Recarga Empresa', date: '01/03/2026', amount: 415, type: 'secondary' }
  ]);

  const handleExchange = () => {
    if (exchangeAmount > 0 && exchangeAmount <= balance) {
      alert(`Você trocou R$ ${exchangeAmount} de créditos MoveCorp por Vale-Transporte.`);
      updateWalletBalance(currentEmployee.id, -exchangeAmount);
      setHistory(prev => [{
        id: Date.now(),
        title: 'Troca VT',
        date: new Date().toLocaleDateString('pt-BR'),
        amount: -exchangeAmount,
        type: 'danger'
      }, ...prev]);
      setExchangeAmount(0);
    } else {
      alert('Valor inválido ou saldo insuficiente.');
    }
  };

  const handleAddBalance = () => {
    if (addAmount > 0) {
      alert(`Você adicionou R$ ${addAmount} de saldo.`);
      updateWalletBalance(currentEmployee.id, addAmount);
      setHistory(prev => [{
        id: Date.now(),
        title: 'Adição de Saldo',
        date: new Date().toLocaleDateString('pt-BR'),
        amount: addAmount,
        type: 'secondary'
      }, ...prev]);
      setAddAmount(0);
    } else {
      alert('Valor inválido.');
    }
  };

  return (
    <div className="page-transition">
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Meus Créditos</h1>

      <div className="card" style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', marginBottom: '1.5rem', backgroundImage: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <Wallet size={28} />
          <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Saldo Mensal Disponível</span>
        </div>
        <div>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }}>R$ {balance.toFixed(2)}</h2>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>Válido até 31/03/2026</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} color="var(--primary)" /> Adicionar Saldo
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Adicione saldo extra à sua carteira usando seu método de pagamento preferido.
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={() => setAddAmount(20)}>R$ 20</button>
          <button className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={() => setAddAmount(50)}>R$ 50</button>
          <button className="btn btn-outline" style={{ padding: '0.5rem', backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
            Personalizado
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>R$</span>
            <input 
              type="number" 
              value={addAmount === 0 ? '' : addAmount}
              onChange={(e) => setAddAmount(Number(e.target.value))}
              placeholder="0,00"
              style={{ width: '100%', padding: '0.75rem', paddingLeft: '2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>
          <button 
            className="btn btn-primary" 
            style={{ width: 'auto', padding: '0.75rem 1rem' }}
            onClick={handleAddBalance}
          >
            Adicionar
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Ticket size={18} color="var(--primary)" /> Converter para VT
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Você pode transferir parte dos seus créditos MoveCorp para o seu cartão Vale-Transporte padrão.
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={() => setExchangeAmount(50)}>R$ 50</button>
          <button className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={() => setExchangeAmount(100)}>R$ 100</button>
          <button className="btn btn-outline" style={{ padding: '0.5rem', backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
            Personalizado
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>R$</span>
            <input 
              type="number" 
              value={exchangeAmount === 0 ? '' : exchangeAmount}
              onChange={(e) => setExchangeAmount(Number(e.target.value))}
              placeholder="0,00"
              style={{ width: '100%', padding: '0.75rem', paddingLeft: '2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>
          <button 
            className="btn btn-primary" 
            style={{ width: 'auto', padding: '0.75rem 1rem' }}
            onClick={handleExchange}
          >
            <ArrowRightLeft size={18} />
          </button>
        </div>
      </div>

      <h3>Histórico de Uso</h3>
      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {history.map((item) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border)' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>{item.title}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.date}</p>
            </div>
            <p style={{ margin: 0, fontWeight: 'bold', color: `var(--${item.type})` }}>
              {item.amount > 0 ? '+' : '-'} R$ {Math.abs(item.amount).toFixed(2).replace('.', ',')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

