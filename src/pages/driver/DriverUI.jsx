import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';

export function DriverBack({ to = '/driver', children = 'Voltar à jornada' }) {
  return <Link className="back-link" to={to}><ArrowLeft size={18} aria-hidden="true" />{children}</Link>;
}

export function DriverLoading({ children = 'Carregando...' }) {
  return <div className="card driver-loading" role="status"><Loader2 size={24} className="spin" aria-hidden="true" />{children}</div>;
}

export function DriverError({ error, onRetry }) {
  return <div className="card driver-error" role="alert"><p>{error?.message || 'Não foi possível carregar os dados.'}</p>{onRetry && <button type="button" className="btn btn-outline" onClick={onRetry}>Tentar novamente</button>}</div>;
}

export function DriverEmpty({ title, children }) {
  return <section className="card driver-stack"><h2>{title}</h2><div>{children}</div></section>;
}
