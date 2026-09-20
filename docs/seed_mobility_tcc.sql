-- Run only in a development Supabase project, after mobility_map_first.sql and company_operations_tcc.sql.
-- Requires two existing Auth accounts: motorista@movecorp.test and funcionario@movecorp.test.
-- Does not create, delete or change authentication credentials.
begin;

do $$
declare
  v_driver uuid;
  v_passenger uuid;
  v_company uuid;
  v_region uuid;
  v_route uuid;
  v_assignment uuid;
  v_stop uuid;
  v_journey uuid;
  v_date date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  select id into v_driver from public.profiles where email = 'motorista@movecorp.test' and role = 'driver';
  select id into v_passenger from public.profiles where email = 'funcionario@movecorp.test' and role = 'employee';
  if v_driver is null or v_passenger is null then
    raise exception 'Crie primeiro as contas de apresentação no Supabase Auth.';
  end if;

  insert into public.companies (name, active) values ('Campus Comfy', true)
    on conflict (name) do update set active = true returning id into v_company;
  update public.companies set plan = 'Business', monthly_contract = 48000 where id = v_company;
  insert into public.regions (name, city, active) values ('Centro Comfy', 'São Paulo', true)
    on conflict (name) do update set active = true returning id into v_region;

  update public.profiles set company_id = v_company, region_id = v_region,
    home_address = 'Praça da República, São Paulo',
    work_address = 'Campus Comfy, São Paulo', no_show_count = 0, credit_balance = 350,
    department = 'Tecnologia'
    where id = v_passenger;
  update public.profiles set company_id = v_company, region_id = v_region where id = v_driver;
  update public.profiles set company_id = v_company
    where email = 'admin@movecorp.test' and role = 'admin';
  insert into public.drivers (id, vehicle_model, vehicle_plate, vehicle_color, vehicle_capacity)
    values (v_driver, 'Van Sprinter', 'ABC-1D23', 'Branca', 15)
    on conflict (id) do update set vehicle_model = excluded.vehicle_model,
      vehicle_plate = excluded.vehicle_plate, vehicle_color = excluded.vehicle_color;

  select id into v_route from public.routes
    where company_id = v_company and name = 'Centro → Campus Comfy' limit 1;
  if v_route is null then
    insert into public.routes (company_id, region_id, name, boarding_stop, destination_label,
      direction, typical_start_time, estimated_arrival, eta_minutes, occupancy, active, driver_id)
    values (v_company, v_region, 'Centro → Campus Comfy', 'Praça da República',
      'Campus Comfy', 'outbound', '07:30', '07:30', 8, 35, true, v_driver)
    returning id into v_route;
  else
    update public.routes set region_id = v_region, active = true, driver_id = v_driver,
      boarding_stop = 'Praça da República', destination_label = 'Campus Comfy',
      eta_minutes = 8 where id = v_route;
  end if;
  update public.routes set display_code = 'CF-01' where id = v_route;

  insert into public.route_stops (route_id, stop_order, name, kind, latitude, longitude, minutes_to_next)
  values
    (v_route, 1, 'Praça da República', 'boarding', -23.5431, -46.6427, 6),
    (v_route, 2, 'Praça Roosevelt', 'boarding', -23.5482, -46.6478, 7),
    (v_route, 3, 'Avenida Paulista', 'boarding', -23.5613, -46.6552, 5),
    (v_route, 4, 'Campus Comfy', 'destination', -23.5695, -46.6601, 0)
  on conflict (route_id, stop_order) do update set name = excluded.name, kind = excluded.kind,
    latitude = excluded.latitude, longitude = excluded.longitude,
    minutes_to_next = excluded.minutes_to_next;

  -- These are dedicated presentation accounts. Keep just the presentation route active.
  update public.driver_route_assignments set active = false
    where driver_id = v_driver and route_id <> v_route and active;
  insert into public.driver_route_assignments (driver_id, route_id, active, starts_on)
    values (v_driver, v_route, true, v_date - 1)
    on conflict (driver_id, route_id) do update set active = true, starts_on = excluded.starts_on
    returning id into v_assignment;
  update public.employee_route_subscriptions set active = false
    where employee_id = v_passenger and route_id <> v_route and active;
  select id into v_stop from public.route_stops where route_id = v_route and stop_order = 1;
  insert into public.employee_route_subscriptions (employee_id, route_id, weekdays, active, boarding_stop_id)
    values (v_passenger, v_route, '[1,2,3,4,5,6,7]'::jsonb, true, v_stop)
    on conflict (employee_id, route_id) do update set weekdays = excluded.weekdays,
      active = true, boarding_stop_id = excluded.boarding_stop_id, updated_at = now();

  insert into public.driver_journeys (driver_id, route_id, assignment_id, service_date, direction,
    status, vehicle_model, vehicle_plate, started_at, position_lat, position_lng,
    position_updated_at, eta_minutes, delay_minutes)
  values (v_driver, v_route, v_assignment, v_date, 'outbound', 'in_progress',
    'Van Sprinter', 'ABC-1D23', now() - interval '5 minutes',
    -23.5408, -46.6389, now(), 8, 0)
  on conflict (driver_id, route_id, service_date) do update
    set status = 'in_progress', completed_at = null, cancelled_at = null,
      position_lat = excluded.position_lat, position_lng = excluded.position_lng,
      position_updated_at = now(), eta_minutes = 8, delay_minutes = 0, updated_at = now()
  returning id into v_journey;
  perform public.seed_driver_journey_passengers(v_journey);
  update public.driver_journey_passengers set boarding_stop_id = v_stop
    where journey_id = v_journey and boarding_stop_id is null;
  insert into public.app_notifications (recipient_id, code, category, type, title, message, action_url)
  values
    (v_passenger, 'trip-today', 'tripUpdates', 'info', 'Sua van está a caminho',
      'Acompanhe a chegada ao ponto de embarque.', '/employee/track'),
    (v_driver, 'journey-today', 'tripUpdates', 'info', 'Jornada em andamento',
      'Confira a próxima parada e os embarques pendentes.', '/driver/map')
  on conflict (recipient_id, code) do update set title = excluded.title,
    message = excluded.message, action_url = excluded.action_url, read_at = null,
    created_at = now();
end;
$$;

commit;
