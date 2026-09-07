import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppContext } from '../../app-context';
import { useAuth } from '../../auth-context';
import { fetchCreditTransactions } from '../../lib/credits';

export default function CreditHistory() {
  const navigate = useNavigate();
  const { currentEmployee } = useAppContext();
  const { profile } = useAuth();
  const employeeId = profile?.id || currentEmployee.id;
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!employeeId || !String(employeeId).includes('-')) {
        setLoading(false);
        return;
      }
      try {
        const rows = await fetchCreditTransactions(employeeId);
        if (cancelled) return;
        setHistory(
          rows.map((row) => ({
            id: row.id,
            title: row.title,
            date: new Date(row.created_at).toLocaleDateString('pt-BR'),
            amount: Number(row.amount),
            type: Number(row.amount) >= 0 ? 'secondary' : 'danger',
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  return (
    <div className="page-transition">
      <button
        type="button"
        className="btn btn-outline"
        onClick={() => navigate('/employee/credits')}
        style={{
          width: 'auto',
          marginBottom: '1rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <ArrowLeft size={18} /> Voltar
      </button>

      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Histórico de uso</h1>

      {loading && <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>}
      {!loading && !history.length && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nenhuma movimentação ainda.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {history.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '1rem',
              borderBottom: '1px solid var(--border)',
            }}
          >
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
