import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, UserRound } from 'lucide-react';
import { useAuth } from '../../auth-context';

const fieldStyle = {
  padding: '0.75rem 1rem',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)',
  fontSize: '1rem',
  backgroundColor: 'white',
  width: '100%',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
  fontSize: '0.85rem',
  fontWeight: 600,
};

function Message({ tone, children }) {
  if (!children) return null;
  const styles =
    tone === 'error'
      ? { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }
      : { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' };
  return (
    <div
      style={{
        ...styles,
        borderRadius: 'var(--radius-md)',
        padding: '0.75rem 1rem',
        fontSize: '0.85rem',
      }}
    >
      {children}
    </div>
  );
}

export default function AccountSecurity() {
  const navigate = useNavigate();
  const { profile, changePassword, changeEmail, updateDisplayName } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ tone: '', text: '' });
  const [passwordBusy, setPasswordBusy] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState({ tone: '', text: '' });
  const [emailBusy, setEmailBusy] = useState(false);

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [nameMsg, setNameMsg] = useState({ tone: '', text: '' });
  const [nameBusy, setNameBusy] = useState(false);

  const handlePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ tone: '', text: '' });

    if (newPassword.length < 6) {
      setPasswordMsg({ tone: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ tone: 'error', text: 'A confirmação não coincide com a nova senha.' });
      return;
    }

    setPasswordBusy(true);
    const result = await changePassword(currentPassword, newPassword);
    setPasswordBusy(false);

    if (result.error) {
      setPasswordMsg({ tone: 'error', text: result.error });
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMsg({ tone: 'ok', text: 'Senha atualizada com sucesso.' });
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setEmailMsg({ tone: '', text: '' });

    if (!newEmail.trim()) {
      setEmailMsg({ tone: 'error', text: 'Informe o novo e-mail.' });
      return;
    }
    if (newEmail.trim().toLowerCase() === (profile?.email || '').toLowerCase()) {
      setEmailMsg({ tone: 'error', text: 'O novo e-mail é igual ao atual.' });
      return;
    }

    setEmailBusy(true);
    const result = await changeEmail(newEmail);
    setEmailBusy(false);

    if (result.error) {
      setEmailMsg({ tone: 'error', text: result.error });
      return;
    }

    setNewEmail('');
    setEmailMsg({ tone: 'ok', text: result.message || 'Solicitação de troca de e-mail enviada.' });
  };

  const handleName = async (e) => {
    e.preventDefault();
    setNameMsg({ tone: '', text: '' });
    setNameBusy(true);
    const result = await updateDisplayName(fullName);
    setNameBusy(false);

    if (result.error) {
      setNameMsg({ tone: 'error', text: result.error });
      return;
    }

    setNameMsg({ tone: 'ok', text: 'Nome atualizado.' });
  };

  return (
    <div
      className="page-transition"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}
    >
      <button
        type="button"
        className="btn btn-outline"
        onClick={() => navigate('/employee/profile')}
        style={{
          width: 'auto',
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <ArrowLeft size={18} /> Voltar ao perfil
      </button>

      <div>
        <h1
          style={{
            fontSize: '1.5rem',
            marginBottom: '0.35rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Lock size={24} color="var(--primary)" /> Segurança da conta
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Altere senha, e-mail e dados básicos da sua conta.
        </p>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
          <Mail size={18} color="var(--primary)" /> E-mail atual
        </h3>
        <p style={{ margin: 0, fontSize: '0.95rem', wordBreak: 'break-all' }}>
          {profile?.email || '—'}
        </p>
      </div>

      <form className="card" onSubmit={handlePassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
          <Lock size={18} color="var(--primary)" /> Trocar senha
        </h3>
        <label style={labelStyle}>
          Senha atual
          <input
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={fieldStyle}
          />
        </label>
        <label style={labelStyle}>
          Nova senha
          <input
            type="password"
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={fieldStyle}
          />
        </label>
        <label style={labelStyle}>
          Confirmar nova senha
          <input
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={fieldStyle}
          />
        </label>
        <Message tone={passwordMsg.tone === 'error' ? 'error' : 'ok'}>{passwordMsg.text}</Message>
        <button type="submit" className="btn btn-primary" disabled={passwordBusy}>
          {passwordBusy ? 'Salvando...' : 'Atualizar senha'}
        </button>
      </form>

      <form className="card" onSubmit={handleEmail} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
          <Mail size={18} color="var(--primary)" /> Trocar e-mail
        </h3>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Pode ser necessário confirmar o novo endereço pelo link enviado no e-mail.
        </p>
        <label style={labelStyle}>
          Novo e-mail
          <input
            type="email"
            autoComplete="email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            style={fieldStyle}
          />
        </label>
        <Message tone={emailMsg.tone === 'error' ? 'error' : 'ok'}>{emailMsg.text}</Message>
        <button type="submit" className="btn btn-primary" disabled={emailBusy}>
          {emailBusy ? 'Enviando...' : 'Solicitar troca de e-mail'}
        </button>
      </form>

      <form className="card" onSubmit={handleName} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
          <UserRound size={18} color="var(--primary)" /> Nome de exibição
        </h3>
        <label style={labelStyle}>
          Nome completo
          <input
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={fieldStyle}
          />
        </label>
        <Message tone={nameMsg.tone === 'error' ? 'error' : 'ok'}>{nameMsg.text}</Message>
        <button type="submit" className="btn btn-primary" disabled={nameBusy}>
          {nameBusy ? 'Salvando...' : 'Atualizar nome'}
        </button>
      </form>
    </div>
  );
}
