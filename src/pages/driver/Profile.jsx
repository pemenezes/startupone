import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth-context';
import { supabase } from '../../lib/supabase';
import { useDriverResource } from './useDriverResource';
import { DriverEmpty, DriverError, DriverLoading } from './DriverUI';
import DriverLogout from './DriverLogout';

export default function Profile() {
  const { profile, user } = useAuth();
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('drivers')
      .select('vehicle_model, vehicle_plate, vehicle_color, vehicle_capacity, rating_average, rating_count')
      .eq('id', profile.id).maybeSingle();
    if (error) throw error;
    return data;
  }, [profile.id]);
  const resource = useDriverResource(load);
  const driver = resource.data;
  return <div className="page-transition driver-stack">
    <h1>Meu perfil</h1><p>Dados da sua conta e do veículo cadastrado.</p>
    <section className="card driver-stack"><h2>{profile.full_name?.trim() || 'Nome não informado'}</h2>
      <dl className="driver-details"><div><dt>E-mail da conta</dt><dd>{user?.email || profile.email || 'Não informado'}</dd></div><div><dt>Perfil de acesso</dt><dd>Motorista</dd></div></dl>
    </section>
    {resource.loading ? <DriverLoading>Carregando cadastro do motorista...</DriverLoading> :
      resource.error ? <DriverError error={resource.error} onRetry={resource.refresh} /> :
      !driver ? <DriverEmpty title="Cadastro operacional pendente"><p>Seu cadastro complementar de motorista não foi encontrado. Consulte a operação.</p></DriverEmpty> :
      <section className="card driver-stack"><h2>Veículo e avaliações</h2>
        <dl className="driver-details">
          <div><dt>Modelo cadastrado</dt><dd>{driver.vehicle_model || 'Não informado'}</dd></div>
          <div><dt>Placa</dt><dd>{!driver.vehicle_plate || driver.vehicle_plate === 'A definir' ? 'Cadastro pendente' : driver.vehicle_plate}</dd></div>
          <div><dt>Cor</dt><dd>{driver.vehicle_color || 'Não informado'}</dd></div>
          <div><dt>Capacidade cadastrada</dt><dd>{driver.vehicle_capacity > 0 ? `${driver.vehicle_capacity} passageiros` : 'Não informado'}</dd></div>
          <div><dt>Avaliação</dt><dd>{driver.rating_count > 0 && driver.rating_average != null ? `${Number(driver.rating_average).toFixed(1)} · ${driver.rating_count} avaliações` : 'Sem avaliações'}</dd></div>
        </dl>
        <p>Dados cadastrados não representam aprovação documental. A edição pelo aplicativo ainda não está disponível.</p>
      </section>}
    <section className="card driver-stack"><h2>Informações operacionais</h2>
      <Link className="btn btn-outline" to="/driver/status">Documentação e situação operacional</Link>
      <Link className="btn btn-outline" to="/driver/region-request">Solicitação de região</Link>
    </section>
    <DriverEmpty title="Preferências de notificação"><p>A configuração de preferências ainda não está disponível.</p></DriverEmpty>
    <DriverLogout />
  </div>;
}
