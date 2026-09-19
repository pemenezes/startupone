-- Comfy Package B2. Apply after driver_package_b1.sql.
-- Journey passenger snapshots, attendance recording and correction history.
begin;

create table if not exists public.driver_journey_passengers (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.driver_journeys(id) on delete cascade,
  passenger_id uuid not null references public.profiles(id) on delete restrict,
  subscription_id uuid references public.employee_route_subscriptions(id) on delete set null,
  passenger_name text not null,
  boarding_address text,
  status text not null default 'expected'
    check (status in ('expected', 'boarded', 'absent', 'cancelled')),
  recorded_at timestamptz,
  recorded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (journey_id, passenger_id),
  constraint driver_journey_passengers_record_check check (
    (status = 'expected' and recorded_at is null and recorded_by is null)
    or (status = 'cancelled' and recorded_by is null)
    or (status in ('boarded', 'absent') and recorded_at is not null and recorded_by is not null)
  )
);

create index if not exists driver_journey_passengers_journey_status_idx
  on public.driver_journey_passengers (journey_id, status);
create index if not exists driver_journey_passengers_passenger_idx
  on public.driver_journey_passengers (passenger_id, created_at desc);

create table if not exists public.driver_passenger_attendance_events (
  id uuid primary key default gen_random_uuid(),
  journey_passenger_id uuid not null references public.driver_journey_passengers(id) on delete cascade,
  journey_id uuid not null references public.driver_journeys(id) on delete cascade,
  passenger_id uuid not null references public.profiles(id) on delete restrict,
  previous_status text not null check (previous_status in ('expected', 'boarded', 'absent')),
  new_status text not null check (new_status in ('boarded', 'absent')),
  recorded_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists driver_attendance_events_journey_idx
  on public.driver_passenger_attendance_events (journey_id, created_at desc);

alter table public.driver_journey_passengers enable row level security;
alter table public.driver_passenger_attendance_events enable row level security;

-- Security-definer checks keep the policies small and avoid recursive RLS lookups.
create or replace function public.is_driver_for_journey(p_journey_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.driver_journeys
    where id = p_journey_id and driver_id = auth.uid()
  );
$$;

create or replace function public.is_passenger_for_journey(p_journey_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.driver_journey_passengers
    where journey_id = p_journey_id and passenger_id = auth.uid()
  );
$$;

drop policy if exists "Drivers read journey passengers" on public.driver_journey_passengers;
create policy "Drivers read journey passengers"
  on public.driver_journey_passengers for select to authenticated
  using (public.is_driver_for_journey(journey_id));

drop policy if exists "Passengers read own journey status" on public.driver_journey_passengers;
create policy "Passengers read own journey status"
  on public.driver_journey_passengers for select to authenticated
  using (passenger_id = auth.uid());

drop policy if exists "Drivers read attendance history" on public.driver_passenger_attendance_events;
create policy "Drivers read attendance history"
  on public.driver_passenger_attendance_events for select to authenticated
  using (public.is_driver_for_journey(journey_id));

drop policy if exists "Passengers read journeys containing them" on public.driver_journeys;
create policy "Passengers read journeys containing them"
  on public.driver_journeys for select to authenticated
  using (public.is_passenger_for_journey(id));

revoke all on public.driver_journey_passengers from anon, authenticated;
revoke all on public.driver_passenger_attendance_events from anon, authenticated;
revoke all on function public.is_driver_for_journey(uuid) from public, anon;
revoke all on function public.is_passenger_for_journey(uuid) from public, anon;
grant select on public.driver_journey_passengers to authenticated;
grant select on public.driver_passenger_attendance_events to authenticated;
grant execute on function public.is_driver_for_journey(uuid) to authenticated;
grant execute on function public.is_passenger_for_journey(uuid) to authenticated;

create or replace function public.seed_driver_journey_passengers(p_journey_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.driver_journey_passengers (
    journey_id, passenger_id, subscription_id, passenger_name,
    boarding_address, status, recorded_at
  )
  select
    j.id,
    s.employee_id,
    s.id,
    coalesce(nullif(trim(p.full_name), ''), nullif(trim(p.email), ''), 'Passageiro'),
    nullif(trim(p.home_address), ''),
    case when ex.type = 'cancelled' then 'cancelled' else 'expected' end,
    case when ex.type = 'cancelled' then coalesce(ex.created_at, now()) else null end
  from public.driver_journeys j
  join public.employee_route_subscriptions s
    on s.route_id = j.route_id and s.active = true
  join public.profiles p on p.id = s.employee_id
  left join public.attendance_exceptions ex
    on ex.employee_id = s.employee_id
   and ex.route_id = s.route_id
   and ex.exception_date = j.service_date
  where j.id = p_journey_id
    and (
      exists (
        select 1
        from jsonb_array_elements_text(coalesce(s.weekdays, '[]'::jsonb)) weekday(value)
        where weekday.value::integer = extract(isodow from j.service_date)::integer
      )
      or ex.type = 'added_extra'
    )
  on conflict (journey_id, passenger_id) do nothing;
end;
$$;

create or replace function public.seed_driver_journey_passengers_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.seed_driver_journey_passengers(new.id);
  return new;
end;
$$;

drop trigger if exists seed_driver_journey_passengers on public.driver_journeys;
create trigger seed_driver_journey_passengers
  after insert on public.driver_journeys
  for each row execute function public.seed_driver_journey_passengers_trigger();

-- Keep an open journey consistent when a passenger cancels after it has started.
-- A status already confirmed by the driver is never overwritten by a late cancellation.
create or replace function public.sync_open_journey_attendance_exception()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_exception public.attendance_exceptions%rowtype;
  v_profile public.profiles%rowtype;
  v_subscription public.employee_route_subscriptions%rowtype;
  v_journey record;
begin
  v_exception := new;

  if v_exception.type = 'cancelled' then
    update public.driver_journey_passengers passenger
      set status = 'cancelled', recorded_at = now(), recorded_by = null, updated_at = now()
      from public.driver_journeys journey
      where passenger.journey_id = journey.id
        and journey.route_id = v_exception.route_id
        and journey.service_date = v_exception.exception_date
        and journey.status = 'in_progress'
        and passenger.passenger_id = v_exception.employee_id
        and passenger.status = 'expected';
    return new;
  end if;

  select * into v_profile from public.profiles where id = v_exception.employee_id;
  select * into v_subscription from public.employee_route_subscriptions
    where employee_id = v_exception.employee_id
      and route_id = v_exception.route_id
      and active = true;
  if v_profile.id is null or v_subscription.id is null then
    return new;
  end if;

  for v_journey in
    select id from public.driver_journeys
    where route_id = v_exception.route_id
      and service_date = v_exception.exception_date
      and status = 'in_progress'
  loop
    insert into public.driver_journey_passengers (
      journey_id, passenger_id, subscription_id, passenger_name, boarding_address, status
    ) values (
      v_journey.id,
      v_profile.id,
      v_subscription.id,
      coalesce(nullif(trim(v_profile.full_name), ''), nullif(trim(v_profile.email), ''), 'Passageiro'),
      nullif(trim(v_profile.home_address), ''),
      'expected'
    )
    on conflict (journey_id, passenger_id) do update
      set status = 'expected', recorded_at = null, recorded_by = null, updated_at = now()
      where driver_journey_passengers.status = 'cancelled';
  end loop;
  return new;
end;
$$;

drop trigger if exists sync_open_journey_attendance_exception on public.attendance_exceptions;
create trigger sync_open_journey_attendance_exception
  after insert or update of type on public.attendance_exceptions
  for each row execute function public.sync_open_journey_attendance_exception();

-- Populate journeys already created before this migration.
do $$
declare
  v_journey record;
begin
  for v_journey in select id from public.driver_journeys loop
    perform public.seed_driver_journey_passengers(v_journey.id);
  end loop;
end;
$$;

create or replace function public.record_driver_passenger_status(
  p_journey_id uuid,
  p_passenger_id uuid,
  p_status text
)
returns public.driver_journey_passengers
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_driver uuid := auth.uid();
  v_journey public.driver_journeys%rowtype;
  v_passenger public.driver_journey_passengers%rowtype;
begin
  if p_status not in ('boarded', 'absent') then
    raise exception 'A situação informada não é válida.';
  end if;

  select * into v_journey from public.driver_journeys
    where id = p_journey_id and driver_id = v_driver
    for update;
  if not found then
    raise exception 'Jornada não encontrada para este motorista.';
  end if;
  if v_journey.status <> 'in_progress' then
    raise exception 'A presença só pode ser registrada durante uma jornada em andamento.';
  end if;

  select * into v_passenger from public.driver_journey_passengers
    where journey_id = p_journey_id and passenger_id = p_passenger_id
    for update;
  if not found then
    raise exception 'Passageiro não encontrado nesta jornada.';
  end if;
  if v_passenger.status = 'cancelled' then
    raise exception 'Este passageiro cancelou a viagem de hoje.';
  end if;
  if v_passenger.status = p_status then
    return v_passenger;
  end if;

  insert into public.driver_passenger_attendance_events (
    journey_passenger_id, journey_id, passenger_id,
    previous_status, new_status, recorded_by
  ) values (
    v_passenger.id, v_passenger.journey_id, v_passenger.passenger_id,
    v_passenger.status, p_status, v_driver
  );

  update public.driver_journey_passengers
    set status = p_status, recorded_at = now(), recorded_by = v_driver, updated_at = now()
    where id = v_passenger.id
    returning * into v_passenger;
  return v_passenger;
end;
$$;

create or replace function public.complete_driver_journey(p_journey_id uuid)
returns public.driver_journeys
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_driver uuid := auth.uid();
  v_journey public.driver_journeys%rowtype;
  v_pending integer;
begin
  select * into v_journey from public.driver_journeys
    where id = p_journey_id and driver_id = v_driver
    for update;
  if not found then
    raise exception 'Jornada não encontrada para este motorista.';
  end if;
  if v_journey.status = 'cancelled' then
    raise exception 'Uma jornada cancelada não pode ser finalizada.';
  end if;
  if v_journey.status = 'completed' then
    return v_journey;
  end if;

  select count(*) into v_pending
    from public.driver_journey_passengers
    where journey_id = v_journey.id and status = 'expected';
  if v_pending > 0 then
    raise exception 'Ainda existem % passageiro(s) sem situação definida.', v_pending;
  end if;

  update public.driver_journeys
    set status = 'completed', completed_at = now(), updated_at = now()
    where id = v_journey.id
    returning * into v_journey;
  return v_journey;
end;
$$;

revoke all on function public.seed_driver_journey_passengers(uuid) from public, anon, authenticated;
revoke all on function public.seed_driver_journey_passengers_trigger() from public, anon, authenticated;
revoke all on function public.sync_open_journey_attendance_exception() from public, anon, authenticated;
revoke all on function public.record_driver_passenger_status(uuid, uuid, text) from public, anon;
revoke all on function public.complete_driver_journey(uuid) from public, anon;
grant execute on function public.record_driver_passenger_status(uuid, uuid, text) to authenticated;
grant execute on function public.complete_driver_journey(uuid) to authenticated;

commit;
