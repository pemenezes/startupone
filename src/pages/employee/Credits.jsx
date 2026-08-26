import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ArrowRightLeft, Wallet, Ticket, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../../AppContext';

export default function Credits() {
  const navigate = useNavigate();
  const { currentEmployee } = useAppContext();
  const credits = currentEmployee.credits ?? 0;
  const [exchangeAmount, setExchangeAmount] = useState(0);

  const handleExchange = () => {
    if (exchangeAmount > 0 && exchangeAmount <= credits) {
      alert(`Você trocou R$ ${exchangeAmount} de créditos MoveCorp por Vale-Transporte.`);
      setExchangeAmount(0);
    } else {
      alert('Valor inválido.');
    }
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

      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Meus Créditos</h1>

      <div className="card" style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', marginBottom: '1.5rem', backgroundImage: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <Wallet size={28} />
          <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Saldo Mensal Disponível</span>
        </div>
        <div>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }}>R$ {credits.toFixed(2)}</h2>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>Válido até 31/03/2026</p>
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
              value={exchangeAmount}
              onChange={(e) => setExchangeAmount(Number(e.target.value))}
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
        {/* Mock Histórico */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>Fretado Diário</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>28/03/2026</p>
          </div>
          <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--danger)' }}>- R$ 15,00</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>Troca VT</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>20/03/2026</p>
          </div>
          <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--danger)' }}>- R$ 50,00</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>Recarga Empresa</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>01/03/2026</p>
          </div>
          <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--secondary)' }}>+ R$ 415,00</p>
        </div>
      </div>
    </div>
  );
}
