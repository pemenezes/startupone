import React, { useState } from 'react';
import { DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Users, Download } from 'lucide-react';
import { useAppContext } from '../../app-context';

export default function CompanyCredits() {
  const { employees, distributeCredits } = useAppContext();
  const [depositAmount, setDepositAmount] = useState(350);

  const handleDeposit = (e) => {
    e.preventDefault();
    distributeCredits(depositAmount);
    alert(`Distribuição concluída: R$ ${depositAmount.toFixed(2).replace('.', ',')} foram adicionados para ${employees.length} colaborador(es).`);
  };

  return (
    <div className="page-transition">
      <div className="company-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Gestão de Créditos</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Controle de orçamento do benefício de mobilidade intermodal.</p>
        </div>
        <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto' }}>
          <Download size={18} /> Exportar Relatório TXT
        </button>
      </div>

      <div className="company-credit-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', backgroundImage: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Fundos Depositados (Mês)</span>
            <Wallet size={20} opacity={0.8} />
          </div>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }}>R$ 436.800</h2>
          <p style={{ fontSize: '0.85rem', margin: 0, opacity: 0.8 }}>Demonstração com {employees.length} colaborador(es) ativo(s)</p>
        </div>
        
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Uso no Fretado (MoveCorp)</span>
            <ArrowUpRight size={20} color="var(--secondary)" />
          </div>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }}>65%</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Dos créditos retornam na Plataforma.</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Saques de VT (Vale Transporte)</span>
            <ArrowDownRight size={20} color="var(--warning)" />
          </div>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }}>35%</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Restante convertido por funcionários.</p>
        </div>
      </div>

      <div className="company-content-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <DollarSign size={20} color="var(--primary)" /> Nova Distruibuição em Massa
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Distribua créditos corporativos de mobilidade para os colaboradores carregados nesta demonstração.
          </p>
          <form onSubmit={handleDeposit} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontWeight: 'bold' }}>R$</span>
              <input 
                type="number" 
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                style={{ width: '100%', padding: '1rem', paddingLeft: '3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '1.2rem', fontWeight: 'bold', boxSizing: 'border-box' }}
              />
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: 'auto', padding: '1rem 2rem' }}>
              Processar Lote
            </button>
          </form>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Users size={20} /> Extrato Recente (Colaboradores)</h3>
          </div>
          <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--bg-primary)', paddingBottom: '0.5rem' }}>
               <div>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>Ana Silva</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fretamento Diário • 31/03/2026</p>
               </div>
               <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>- R$ 15,00</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--bg-primary)', paddingBottom: '0.5rem' }}>
               <div>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>Marcos Antônio</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Conversão VT SPTrans • 30/03/2026</p>
               </div>
               <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>- R$ 50,00</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>Recarga Empresa Lote 14</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Para todos elegíveis • 01/03/2026</p>
               </div>
               <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>+ R$ 350,00</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

