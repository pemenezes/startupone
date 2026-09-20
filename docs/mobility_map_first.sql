-- Apply after driver_package_b2.sql in a separate development Supabase project.
-- Adds route geometry and persisted stop arrival without replacing B1/B2.
begin;

create table if not exists public.route_stops (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes(id) on delete cascade,
  stop_order integer not null check (stop_order > 0),
  name text not null,
  kind text not null default 'boarding' check (kind in ('boarding', 'destination')),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  minutes_to_next integer not null default 0 check (minutes_to_next >= 0),
  unique (route_id, stop_order),
  unique (id, route_id)
);

create index if not exists route_stops_route_order_idx on public.route_stops (route_id, stop_order);
alter table public.route_stops enable row level security;
drop policy if exists "Authenticated read route stops" on public.route_stops;
create policy "Authenticated read route stops" on public.route_stops
  for select to authenticated using (
    exists (
      select 1 from public.routes r
      join public.profiles p on p.company_id = r.company_id
      where r.id = route_stops.route_id and p.id = auth.uid()
    )
  );
revoke all on public.route_stops from anon, authenticated;
grant select on public.route_stops to authenticated;

create table if not exists public.app_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  code text not null,
  category text not null default 'tripUpdates',
  type text not null default 'info' check (type in ('info', 'success', 'warning', 'danger')),
  title text not null,
  message text not null,
  action_url text,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  unique (recipient_id, code)
);
create index if not exists app_notifications_recipient_idx on public.app_notifications (recipient_id, created_at desc);
alter table public.app_notifications enable row level security;
drop policy if exists "Recipients read notifications" on public.app_notifications;
create policy "Recipients read notifications" on public.app_notifications
  for select to authenticated using (recipient_id = auth.uid());
drop policy if exists "Recipients mark notifications read" on public.app_notifications;
create policy "Recipients mark notifications read" on public.app_notifications
  for update to authenticated using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());
revoke all on public.app_notifications from anon, authenticated;
grant select, update (read_at) on public.app_notifications to authenticated;

alter table public.employee_route_subscriptions
  add column if not exists boarding_stop_id uuid references public.route_stops(id) on delete set null;
alter table public.profiles
  add column if not exists no_show_count integer not null default 0;
alter table public.driver_journey_passengers
  add column if not exists boarding_stop_id uuid references public.route_stops(id) on delete set null;
alter table public.driver_journeys
  add column if not exists position_lat double precision,
  add column if not exists position_lng double precision,
  add column if not exists position_updated_at timestamptz,
  add column if not exists eta_minutes integer,
  add column if not exists delay_minutes integer not null default 0;

create table if not exists public.driver_journey_stops (
  journey_id uuid not null references public.driver_journeys(id) on delete cascade,
  route_stop_id uuid not null references public.route_stops(id) on delete restrict,
  arrived_at timestamptz not null default now(),
  primary key (journey_id, route_stop_id)
);
alter table public.driver_journey_stops enable row level security;
drop policy if exists "Journey members read stop arrivals" on public.driver_journey_stops;
create policy "Journey members read stop arrivals" on public.driver_journey_stops
  for select to authenticated
  using (public.is_driver_for_journey(journey_id) or public.is_passenger_for_journey(journey_id));
revoke all on public.driver_journey_stops from anon, authenticated;
grant select on public.driver_journey_stops to authenticated;

-- B2 creates the attendance snapshot. Link new rows to the subscription's point
-- and use the first boarding stop when an older subscription has no point yet.
create or replace function public.assign_journey_boarding_stop()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_route_id uuid;
begin
  if new.boarding_stop_id is not null then return new; end if;
  select route_id into v_route_id from public.driver_journeys where id = new.journey_id;
  select coalesce(
    (select s.boarding_stop_id from public.employee_route_subscriptions s
      where s.id = new.subscription_id and s.route_id = v_route_id),
    (select rs.id from public.route_stops rs
      where rs.route_id = v_route_id and rs.kind = 'boarding'
      order by rs.stop_order limit 1)
  ) into new.boarding_stop_id;
  return new;
end;
$$;
drop trigger if exists assign_journey_boarding_stop on public.driver_journey_passengers;
create trigger assign_journey_boarding_stop before insert on public.driver_journey_passengers
  for each row execute function public.assign_journey_boarding_stop();
revoke all on function public.assign_journey_boarding_stop() from public, anon, authenticated;

update public.driver_journey_passengers p
set boarding_stop_id = coalesce(
  (select s.boarding_stop_id from public.employee_route_subscriptions s
    where s.id = p.subscription_id),
  (select rs.id from public.driver_journeys j join public.route_stops rs on rs.route_id = j.route_id
    where j.id = p.journey_id and rs.kind = 'boarding' order by rs.stop_order limit 1)
)
where p.boarding_stop_id is null;

create or replace function public.confirm_driver_stop(p_journey_id uuid, p_route_stop_id uuid)
returns public.driver_journey_stops
language plpgsql security definer set search_path = '' as $$
declare
  v_journey public.driver_journeys%rowtype;
  v_stop public.route_stops%rowtype;
  v_record public.driver_journey_stops%rowtype;
begin
  select * into v_journey from public.driver_journeys
    where id = p_journey_id and driver_id = auth.uid() for update;
  if not found or v_journey.status <> 'in_progress' then
    raise exception 'Jornada indisponível para confirmar chegada.';
  end if;
  select * into v_stop from public.route_stops
    where id = p_route_stop_id and route_id = v_journey.route_id;
  if not found then raise exception 'Parada não pertence à rota.'; end if;
  select * into v_record from public.driver_journey_stops
    where journey_id = p_journey_id and route_stop_id = p_route_stop_id;
  if found then return v_record; end if;
  if exists (
    select 1 from public.route_stops previous
    where previous.route_id = v_journey.route_id and previous.stop_order < v_stop.stop_order
      and not exists (select 1 from public.driver_journey_stops done
        where done.journey_id = p_journey_id and done.route_stop_id = previous.id)
  ) then raise exception 'Confirme primeiro as paradas anteriores.'; end if;
  if exists (
    select 1 from public.driver_journey_passengers p
    join public.route_stops previous on previous.id = p.boarding_stop_id
    where p.journey_id = p_journey_id and p.status = 'expected'
      and previous.stop_order < v_stop.stop_order
  ) then raise exception 'Resolva os embarques da parada anterior.'; end if;
  if v_stop.kind = 'destination' and exists (
    select 1 from public.driver_journey_passengers p
    where p.journey_id = p_journey_id and p.status = 'expected'
  ) then raise exception 'Resolva todos os embarques antes do destino.'; end if;
  insert into public.driver_journey_stops (journey_id, route_stop_id)
    values (p_journey_id, p_route_stop_id) returning * into v_record;
  update public.driver_journeys set position_lat = v_stop.latitude,
    position_lng = v_stop.longitude, position_updated_at = now(),
    eta_minutes = case when v_stop.kind = 'destination' then 0 else v_stop.minutes_to_next end,
    updated_at = now()
    where id = p_journey_id;
  return v_record;
end;
$$;
revoke all on function public.confirm_driver_stop(uuid, uuid) from public, anon;
grant execute on function public.confirm_driver_stop(uuid, uuid) to authenticated;

commit;
