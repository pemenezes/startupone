import { createElement, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CarFront, CheckCircle2, ChevronRight, FileCheck2, Mail, Map, MapPin, Star, User } from 'lucide-react';
import { useAuth } from '../../auth-context';
import { supabase } from '../../lib/supabase';
import { useDriver } from './driver-context';
import { useDriverResource } from './useDriverResource';
import DriverLogout from './DriverLogout';

const vehicleFallback = { vehicle_model: 'Mercedes-Benz Sprinter', vehicle_plate: 'ABC-1D23', vehicle_color: 'Branca', vehicle_capacity: 15, rating_average: 4.9, rating_count: 48 };

function ProfileRow({ to, Icon, title, detail }) {
  return <Link className="card driver-profile-row" to={to}><span className="driver-profile-row-icon">{createElement(Icon, { size: 19 })}</span><span><strong>{title}</strong>{detail && <small>{detail}</small>}</span><ChevronRight size={19} /></Link>;
}

export default function Profile() {
  const { profile, user } = useAuth();
  const { assignment, journey } = useDriver();
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('drivers')
      .select('vehicle_model, vehicle_plate, vehicle_color, vehicle_capacity, rating_average, rating_count')
      .eq('id', profile.id).maybeSingle();
    if (error) throw error;
    return data;
  }, [profile.id]);
  const resource = useDriverResource(load);
  const driver = resource.data || vehicleFallback;
  const routeName = !journey.error && assignment?.route?.name || 'Centro → Campus Comfy';

  return <div className="page-transition driver-stack driver-profile-page">
    <div><h1>Meu perfil</h1><p>Informações e configurações do motorista.</p></div>
    <section className="card driver-profile-hero">
      <div className="driver-profile-identity"><span className="driver-profile-avatar"><User size={29} /></span><span><h2>{profile.full_name?.trim() || 'Motorista Comfy'}</h2><small>Motorista</small></span><span className="driver-profile-active"><CheckCircle2 size={14} />Ativo</span></div>
      <div className="driver-profile-account"><div><Mail size={17} /><span>{user?.email || profile.email || 'E-mail não informado'}</span></div><div><Map size={17} /><span>{routeName}</span></div></div>
    </section>
    <section className="card driver-profile-vehicle"><div className="driver-profile-vehicle-top"><span className="driver-profile-row-icon"><CarFront size={23} /></span><span><small>Seu veículo</small><h2>{driver.vehicle_model || vehicleFallback.vehicle_model}</h2></span><span className="driver-badge">{driver.vehicle_plate && driver.vehicle_plate !== 'A definir' ? driver.vehicle_plate : vehicleFallback.vehicle_plate}</span></div>
      <div className="driver-profile-vehicle-facts"><span><strong>{driver.vehicle_capacity || vehicleFallback.vehicle_capacity}</strong><small>lugares</small></span><span><strong>{driver.vehicle_color || vehicleFallback.vehicle_color}</strong><small>cor</small></span><span><strong><Star size={15} fill="currentColor" />{Number(driver.rating_average || vehicleFallback.rating_average).toFixed(1)}</strong><small>{driver.rating_count || vehicleFallback.rating_count} avaliações</small></span></div>
    </section>
    <section className="driver-profile-options"><h2>Configurações</h2>
      <ProfileRow to="/driver/claim-route" Icon={Map} title="Minha rota" detail="Consultar ou alterar rota assumida" />
      <ProfileRow to="/driver/status" Icon={FileCheck2} title="Documentação e situação" detail="Veículo, documentos e ocorrências" />
      <ProfileRow to="/driver/region-request" Icon={MapPin} title="Solicitação de região" detail="Escolher área de atuação" />
      <ProfileRow to="/driver/notifications" Icon={Bell} title="Notificações" detail="Preferências de avisos" />
    </section>
    <DriverLogout />
  </div>;
}
