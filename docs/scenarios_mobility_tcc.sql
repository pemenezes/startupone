-- Run once after seed_mobility_tcc.sql in the development Supabase project.
-- Call only from SQL Editor, for example: select public.set_tcc_mobility_scenario('delayed');
-- Scenarios: planned, in_progress, at_stop, boarded, absent, delayed, completed, cancelled.
create or replace function public.set_tcc_mobility_scenario(p_scenario text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_driver uuid;
  v_passenger uuid;
  v_route uuid;
  v_assignment uuid;
  v_journey uuid;
  v_first public.route_stops%rowtype;
  v_last public.route_stops%rowtype;
  v_date date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  if p_scenario not in ('planned', 'in_progress', 'at_stop', 'boarded', 'absent', 'delayed', 'completed', 'cancelled') then
    raise exception 'Cenário inválido.';
  end if;
  select id into v_driver from public.profiles where email = 'motorista@movecorp.test' and role = 'driver';
  select id into v_passenger from public.profiles where email = 'funcionario@movecorp.test' and role = 'employee';
  select r.id into v_route from public.routes r join public.companies c on c.id = r.company_id
    where c.name = 'Campus Comfy' and r.name = 'Centro → Campus Comfy';
  if v_driver is null or v_passenger is null or v_route is null then
    raise exception 'Execute seed_mobility_tcc.sql antes de trocar o cenário.';
  end if;
  select id into v_assignment from public.driver_route_assignments
    where driver_id = v_driver and route_id = v_route and active;
  select * into v_first from public.route_stops where route_id = v_route order by stop_order limit 1;
  select * into v_last from public.route_stops where route_id = v_route order by stop_order desc limit 1;
  if v_assignment is null or v_first.id is null or v_last.id is null then
    raise exception 'A rota de apresentação precisa de atribuição e paradas.';
  end if;

  select id into v_journey from public.driver_journeys
    where driver_id = v_driver and route_id = v_route and service_date = v_date;
  if p_scenario = 'planned' then
    if v_journey is not null then delete from public.driver_journeys where id = v_journey; end if;
    return;
  end if;
  if v_journey is null then
    insert into public.driver_journeys (driver_id, route_id, assignment_id, service_date,
      direction, status, vehicle_model, vehicle_plate, started_at,
      position_lat, position_lng, position_updated_at, eta_minutes)
    values (v_driver, v_route, v_assignment, v_date, 'outbound', 'in_progress',
      'Van Sprinter', 'ABC-1D23', now() - interval '5 minutes',
      -23.5408, -46.6389, now(), 8)
    returning id into v_journey;
  end if;
  perform public.seed_driver_journey_passengers(v_journey);

  delete from public.attendance_exceptions where employee_id = v_passenger
    and route_id = v_route and exception_date = v_date;
  delete from public.driver_journey_stops where journey_id = v_journey;
  delete from public.driver_passenger_attendance_events where journey_id = v_journey;
  update public.driver_journey_passengers set status = 'expected', recorded_at = null,
    recorded_by = null, updated_at = now() where journey_id = v_journey;
  update public.driver_journeys set status = 'in_progress', completed_at = null,
    cancelled_at = null, started_at = now() - interval '5 minutes',
    position_lat = -23.5408, position_lng = -46.6389,
    position_updated_at = now(), eta_minutes = 8, delay_minutes = 0,
    updated_at = now() where id = v_journey;

  if p_scenario in ('at_stop', 'boarded', 'absent', 'completed') then
    insert into public.driver_journey_stops (journey_id, route_stop_id)
      values (v_journey, v_first.id) on conflict do nothing;
    update public.driver_journeys set position_lat = v_first.latitude,
      position_lng = v_first.longitude, position_updated_at = now(),
      eta_minutes = v_first.minutes_to_next where id = v_journey;
  end if;
  if p_scenario in ('boarded', 'absent', 'completed') then
    update public.driver_journey_passengers set status = case when p_scenario = 'absent' then 'absent' else 'boarded' end,
      recorded_by = v_driver, recorded_at = now(), updated_at = now()
      where journey_id = v_journey;
  end if;
  if p_scenario = 'delayed' then
    update public.driver_journeys set delay_minutes = 12, eta_minutes = 20 where id = v_journey;
  end if;
  if p_scenario = 'completed' then
    insert into public.driver_journey_stops (journey_id, route_stop_id)
      select v_journey, id from public.route_stops where route_id = v_route on conflict do nothing;
    update public.driver_journeys set status = 'completed', completed_at = now(),
      position_lat = v_last.latitude, position_lng = v_last.longitude,
      position_updated_at = now(), eta_minutes = 0 where id = v_journey;
  end if;
  if p_scenario = 'cancelled' then
    update public.driver_journeys set status = 'cancelled', cancelled_at = now(),
      eta_minutes = null where id = v_journey;
  end if;
end;
$$;

revoke all on function public.set_tcc_mobility_scenario(text) from public, anon, authenticated;
