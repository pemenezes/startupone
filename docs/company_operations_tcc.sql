-- Apply after mobility_map_first.sql in the development Supabase project.
-- The admin dashboard reads existing company, route, journey, profile and credit rows.
begin;

alter table public.companies
  add column if not exists plan text not null default 'Business',
  add column if not exists monthly_contract numeric(12,2) not null default 0;
alter table public.profiles add column if not exists department text;
alter table public.routes add column if not exists display_code text;

create or replace function public.company_operations()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_company uuid;
  v_data jsonb;
begin
  select company_id into v_company from public.profiles
    where id = auth.uid() and role = 'admin';
  if v_company is null then raise exception 'Painel não disponível para esta conta.'; end if;

  select jsonb_build_object(
    'company', jsonb_build_object('name', c.name, 'plan', c.plan,
      'monthlyContract', c.monthly_contract),
    'employees', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', p.id, 'name', p.full_name, 'department', coalesce(p.department, 'Não informado'),
        'routeId', (select s.route_id from public.employee_route_subscriptions s
          where s.employee_id = p.id and s.active order by s.created_at desc limit 1),
        'balance', p.credit_balance, 'penalties', p.no_show_count
      ) order by p.full_name)
      from public.profiles p where p.company_id = c.id and p.role = 'employee'
    ), '[]'::jsonb),
    'routes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', r.id, 'code', coalesce(r.display_code, left(r.id::text, 8)),
        'name', r.name, 'region', coalesce(region.name, 'Não informada'),
        'status', case when j.delay_minutes > 0 and j.status = 'in_progress' then 'delayed'
          else coalesce(j.status, 'planned') end,
        'driver', coalesce(driver_profile.full_name, 'A definir'),
        'vehicle', coalesce(d.vehicle_model, 'Van') || ' · ' || coalesce(d.vehicle_plate, 'A definir'),
        'plate', coalesce(d.vehicle_plate, 'A definir'),
        'capacity', coalesce(d.vehicle_capacity, 15),
        'departure', coalesce(r.typical_start_time, r.estimated_arrival),
        'arrival', r.estimated_arrival, 'etaMinutes', j.eta_minutes,
        'progress', case when stop_count.total > 0
          then round(100.0 * coalesce(arrived.total, 0) / stop_count.total) else 0 end,
        'nextStop', coalesce(next_stop.name, r.destination_label, r.boarding_stop),
        'path', coalesce(path.coordinates, '[]'::jsonb),
        'position', case when j.position_lat is not null and j.position_lng is not null
          then jsonb_build_array(j.position_lat, j.position_lng)
          else null end,
        'passengers', coalesce(passengers.items, '[]'::jsonb),
        'noShows30Days', coalesce(absences.total, 0),
        'history', '[]'::jsonb
      ) order by r.name)
      from public.routes r
      left join public.regions region on region.id = r.region_id
      left join public.driver_route_assignments assignment on assignment.route_id = r.id and assignment.active
      left join public.drivers d on d.id = assignment.driver_id
      left join public.profiles driver_profile on driver_profile.id = assignment.driver_id
      left join lateral (
        select * from public.driver_journeys journey
        where journey.route_id = r.id and journey.service_date = (now() at time zone 'America/Sao_Paulo')::date
        order by journey.started_at desc limit 1
      ) j on true
      left join lateral (select count(*)::integer as total from public.route_stops rs where rs.route_id = r.id) stop_count on true
      left join lateral (select count(*)::integer as total from public.driver_journey_stops js where js.journey_id = j.id) arrived on true
      left join lateral (select jsonb_agg(jsonb_build_array(rs.latitude, rs.longitude) order by rs.stop_order) as coordinates
        from public.route_stops rs where rs.route_id = r.id) path on true
      left join lateral (select rs.name from public.route_stops rs where rs.route_id = r.id
        and not exists (select 1 from public.driver_journey_stops js where js.journey_id = j.id and js.route_stop_id = rs.id)
        order by rs.stop_order limit 1) next_stop on true
      left join lateral (select jsonb_agg(jsonb_build_object('id', jp.passenger_id, 'status', jp.status)) as items
        from public.driver_journey_passengers jp where jp.journey_id = j.id) passengers on true
      left join lateral (select count(*)::integer as total
        from public.driver_journey_passengers jp join public.driver_journeys prior on prior.id = jp.journey_id
        where prior.route_id = r.id and prior.service_date >= (now() at time zone 'America/Sao_Paulo')::date - 30
          and jp.status = 'absent') absences on true
      where r.company_id = c.id and r.active
    ), '[]'::jsonb),
    'creditTransactions', coalesce((
      select jsonb_agg(jsonb_build_object('id', tx.id, 'employeeId', tx.employee_id,
        'title', tx.title, 'amount', tx.amount, 'date', tx.created_at::date)
        order by tx.created_at desc)
      from public.credit_transactions tx join public.profiles p on p.id = tx.employee_id
      where p.company_id = c.id
    ), '[]'::jsonb)
  ) into v_data from public.companies c where c.id = v_company;
  return v_data;
end;
$$;
revoke all on function public.company_operations() from public, anon;
grant execute on function public.company_operations() to authenticated;

commit;
