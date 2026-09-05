import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Tag,
  CheckCircle2,
  Map,
  Bell,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  Briefcase,
} from 'lucide-react';
import { useAppContext } from '../../app-context';
import { useAuth } from '../../auth-context';
import { fetchCompanyById } from '../../lib/companies';
import { supabase } from '../../lib/supabase';

function shortBadge(id) {
  if (!id) return '—';
  return String(id).replace(/-/g, '').slice(0, 8).toUpperCase();
}

async function fetchDepartment(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('department')
    .eq('id', userId)
    .maybeSingle();
  // Column may not exist until employee_profile_fields.sql is run
  if (error) return null;
  return data?.department ?? null;
}

export default function Profile() {
  const navigate = useNavigate();
  const { currentEmployee } = useAppContext();
  const { profile, signOut } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [department, setDepartment] = useState('Não informado');

  const displayName = profile?.full_name || currentEmployee?.name || 'Colaborador';
  const email = profile?.email || currentEmployee?.email || '—';
  const badgeId = shortBadge(profile?.id || currentEmployee?.id);

  useEffect(() => {
    let cancelled = false;
    const companyId = profile?.company_id;
    if (!companyId) {
      setCompanyName('');
      return undefined;
    }

    fetchCompanyById(companyId)
      .then((company) => {
        if (!cancelled) setCompanyName(company?.name || '');
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setCompanyName('');
      });

    return () => {
      cancelled = true;
    };
  }, [profile?.company_id]);

  useEffect(() => {
    let cancelled = false;
    fetchDepartment(profile?.id).then((value) => {
      if (cancelled) return;
      setDepartment(value?.trim() ? value.trim() : 'Não informado');
    });
    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  const configItems = [
    { label: 'Solicitar alteração de rota', icon: <Map size={18} color="var(--primary)" />, badge: 'Em breve' },
    { label: 'Preferências de notificação', icon: <Bell size={18} color="var(--primary)" />, badge: 'Em breve' },
    { label: 'Segurança da conta', icon: <Lock size={18} color="var(--primary)" />, badge: 'Em breve' },
    {
      label: 'Ajuda e suporte',
      icon: <HelpCircle size={18} color="var(--primary)" />,
      path: '/employee/help',
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div
      className="page-transition"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}
    >
      <div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Meu Perfil</h1>
        <p>Configurações e informações do colaborador.</p>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              backgroundColor: 'var(--primary-light)',
              padding: '1rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '60px',
              height: '60px',
            }}
          >
            <User size={32} color="var(--primary)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{displayName}</h2>
              <span
                style={{
                  backgroundColor: '#dcfce3',
                  color: 'var(--secondary)',
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '1rem',
                  fontWeight: 'bold',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <CheckCircle2 size={12} /> Ativo
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {companyName || (profile?.company_id ? 'Carregando empresa...' : 'Empresa não vinculada')}
            </p>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
            <Tag size={16} color="var(--text-secondary)" />
            <span style={{ color: 'var(--text-secondary)', width: '70px' }}>Chapa:</span>
            <span style={{ fontWeight: 'bold' }}>{badgeId}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
            <Mail size={16} color="var(--text-secondary)" />
            <span style={{ color: 'var(--text-secondary)', width: '70px' }}>E-mail:</span>
            <span style={{ wordBreak: 'break-all' }}>{email}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
            <Briefcase size={16} color="var(--text-secondary)" />
            <span style={{ color: 'var(--text-secondary)', width: '70px' }}>Setor:</span>
            <span>{department}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>Configurações</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {configItems.map((item) => {
            const clickable = Boolean(item.path);
            return (
              <button
                key={item.label}
                type="button"
                className="card"
                onClick={() => {
                  if (item.path) navigate(item.path);
                }}
                disabled={!clickable}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  opacity: clickable ? 1 : 0.8,
                  cursor: clickable ? 'pointer' : 'not-allowed',
                  width: '100%',
                  textAlign: 'left',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary, white)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {item.icon}
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {item.badge && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        backgroundColor: 'var(--bg-primary)',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight size={16} color="var(--text-secondary)" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        className="btn btn-danger"
        onClick={handleSignOut}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginTop: '1rem',
          backgroundColor: 'var(--danger-light)',
          color: 'var(--danger)',
          border: '1px solid #fecaca',
        }}
      >
        <LogOut size={18} /> Sair da conta
      </button>
    </div>
  );
}
