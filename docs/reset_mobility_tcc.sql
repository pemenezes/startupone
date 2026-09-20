-- Reset only the dedicated Comfy presentation journey for the current Brasília day.
-- Run in the development Supabase project after seed_mobility_tcc.sql.
begin;

do $$
declare
  v_journey uuid;
  v_route uuid;
  v_passenger uuid;
begin
  select j.id, j.route_id into v_journey, v_route
  from public.driver_journeys j
  join public.profiles p on p.id = j.driver_id
  join public.routes r on r.id = j.route_id
  join public.companies c on c.id = r.company_id
  where p.email = 'motorista@movecorp.test'
    and c.name = 'Campus Comfy'
    and r.name = 'Centro → Campus Comfy'
    and j.service_date = (now() at time zone 'America/Sao_Paulo')::date;
  if v_journey is null then
    raise exception 'Jornada de apresentação não encontrada. Execute primeiro seed_mobility_tcc.sql.';
  end if;
  select id into v_passenger from public.profiles where email = 'funcionario@movecorp.test';
  delete from public.attendance_exceptions where employee_id = v_passenger
    and route_id = v_route and exception_date = (now() at time zone 'America/Sao_Paulo')::date;
  delete from public.driver_journey_stops where journey_id = v_journey;
  delete from public.driver_passenger_attendance_events where journey_id = v_journey;
  update public.driver_journey_passengers set status = 'expected', recorded_at = null,
    recorded_by = null, updated_at = now()
    where journey_id = v_journey and passenger_id = v_passenger;
  update public.driver_journeys set status = 'in_progress', completed_at = null,
    cancelled_at = null, started_at = now() - interval '5 minutes',
    position_lat = -23.5408, position_lng = -46.6389,
    position_updated_at = now(), eta_minutes = 8, delay_minutes = 0, updated_at = now()
    where id = v_journey;
  update public.app_notifications set read_at = null, created_at = now()
    where code in ('trip-today', 'journey-today')
      and recipient_id in (v_passenger, (select driver_id from public.driver_journeys where id = v_journey));
end;
$$;

commit;
