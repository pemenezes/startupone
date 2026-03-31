import React, { useState } from 'react';
import { Calculator, Send, CheckCircle2 } from 'lucide-react';

export default function Simulator() {
  const [employees, setEmployees] = useState(50);
  const [vtCost, setVtCost] = useState(480);
  const [simulated, setSimulated] = useState(false);

  const simulate = (e) => {
    e.preventDefault();
    setSimulated(true);
  };

  return (
    <div className="page-transition">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>Simulador de Demanda e Custo</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Estime a quantidade de frotas necessárias e compare o custo com o Vale-Transporte tradicional.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
        <form onSubmit={simulate} className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={20} color="var(--primary)" /> Parâmetros
          </h3>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Qtd. de Funcionários Elegíveis</label>
            <input 
              type="number" 
              value={employees} 
              onChange={(e) => setEmployees(Number(e.target.value))}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '1rem' }} 
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Custo Médio Mensal do VT por Func. (R$)</label>
            <input 
              type="number" 
              value={vtCost} 
              onChange={(e) => setVtCost(Number(e.target.value))}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '1rem' }} 
            />
          </div>

          <button className="btn btn-primary" type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Send size={18} /> Simular Cenário
          </button>
        </form>

        {simulated ? (
          <div className="card page-transition" style={{ backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <CheckCircle2 size={32} color="var(--primary)" />
              <div>
                <h2 style={{ margin: 0, color: 'var(--primary)' }}>Cenário Projetado</h2>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Algoritmo de Roteirização Base</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ margin: 0, fontSize: '2rem' }}>{Math.ceil(employees / 15)}</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Vans Recomendadas<br/>(15 lugares)</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ margin: 0, fontSize: '2rem' }}>{Math.ceil(employees / 15)}</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rotas Inteligentes<br/>(Tempo médio: 45m)</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ margin: 0, fontSize: '2rem' }}>92%</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Eficiência e<br/>Ocupação Prevista</p>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Custo Atual Vale-Transporte</p>
                <h2 style={{ margin: 0, color: 'var(--danger)', fontSize: '1.5rem' }}>R$ {(employees * vtCost).toLocaleString('pt-BR')} <span style={{fontSize: '0.8rem', fontWeight: 'normal'}}>/mês</span></h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Custo Estimado MoveCorp</p>
                <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.5rem' }}>R$ {((employees * vtCost) * 0.75).toLocaleString('pt-BR')} <span style={{fontSize: '0.8rem', fontWeight: 'normal'}}>/mês</span></h2>
                <div style={{ marginTop: '0.5rem', display: 'inline-block', backgroundColor: '#dcfce3', color: 'var(--secondary)', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  Economia de ~25%
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-secondary)', borderStyle: 'dashed' }}>
            <Calculator size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>Preencha os parâmetros e clique em simular para visualizar os resultados operacionais.</p>
          </div>
        )}
      </div>
    </div>
  );
}
