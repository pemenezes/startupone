-- Comfy Package B1. Apply after driver_package_a.sql.
-- Persistent driver journeys. Passenger attendance belongs to Package B2.
begin;

create table if not exists public.driver_journeys (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.drivers(id) on delete restrict,
  route_id uuid not null references public.routes(id) on delete restrict,
  assignment_id uuid not null references public.driver_route_assignments(id) on delete restrict,
  service_date date not null,
  direction text not null check (direction in ('outbound', 'return')),
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed', 'cancelled')),
  vehicle_model text,
  vehicle_plate text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint driver_journeys_terminal_dates check (
    (status = 'in_progress' and completed_at is null and cancelled_at is null)
    or (status = 'completed' and completed_at is not null and cancelled_at is null)
    or (status = 'cancelled' and cancelled_at is not null and completed_at is null)
  ),
  unique (driver_id, route_id, service_date)
);

create index if not exists driver_journeys_driver_date_idx
  on public.driver_journeys (driver_id, service_date desc);
create index if not exists driver_journeys_route_date_idx
  on public.driver_journeys (route_id, service_date desc);
create unique index if not exists driver_journeys_one_in_progress_per_driver
  on public.driver_journeys (driver_id)
  where status = 'in_progress';

alter table public.driver_journeys enable row level security;

drop policy if exists "Drivers read own journeys" on public.driver_journeys;
create policy "Drivers read own journeys"
  on public.driver_journeys for select
  to authenticated
  using (driver_id = auth.uid());

-- All state transitions go through the functions below.
revoke all on public.driver_journeys from anon, authenticated;
grant select on public.driver_journeys to authenticated;

create or replace function public.start_driver_journey(
  p_route_id uuid,
  p_service_date date
)
returns public.driver_journeys
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_driver uuid := auth.uid();
  v_today date := (now() at time zone 'America/Sao_Paulo')::date;
  v_assignment public.driver_route_assignments%rowtype;
  v_route public.routes%rowtype;
  v_driver_data public.drivers%rowtype;
  v_journey public.driver_journeys%rowtype;
begin
  if v_driver is null or not exists (
    select 1 from public.profiles where id = v_driver and role = 'driver'
  ) then
    raise exception 'Somente motoristas podem iniciar jornadas.';
  end if;
  if p_service_date is distinct from v_today then
    raise exception 'A jornada só pode ser iniciada na data atual.';
  end if;
  if extract(isodow from p_service_date) > 5 then
    raise exception 'Não existe operação prevista para esta rota hoje.';
  end if;

  select * into v_driver_data from public.drivers where id = v_driver for update;
  if not found then
    raise exception 'Cadastro de motorista pendente. Consulte a operação.';
  end if;

  select * into v_journey from public.driver_journeys
    where driver_id = v_driver
      and route_id = p_route_id
      and service_date = p_service_date
    for update;
  if v_journey.id is not null then
    if v_journey.status = 'in_progress' then
      return v_journey;
    elsif v_journey.status = 'completed' then
      raise exception 'A jornada de hoje já foi concluída.';
    else
      raise exception 'A jornada de hoje foi cancelada e não pode ser reiniciada.';
    end if;
  end if;

  if exists (
    select 1 from public.driver_journeys
    where driver_id = v_driver and status = 'in_progress'
  ) then
    raise exception 'Já existe uma jornada em andamento. Retome ou finalize a operação atual.';
  end if;

  select * into v_assignment
    from public.driver_route_assignments
    where driver_id = v_driver
      and route_id = p_route_id
      and active = true
      and starts_on <= p_service_date
    for share;
  if not found then
    raise exception 'Você não possui uma atribuição ativa para esta rota.';
  end if;

  select * into v_route from public.routes
    where id = p_route_id and active = true for share;
  if not found then
    raise exception 'Esta rota não está disponível.';
  end if;

  insert into public.driver_journeys (
    driver_id, route_id, assignment_id, service_date, direction, status,
    vehicle_model, vehicle_plate, started_at
  ) values (
    v_driver, v_route.id, v_assignment.id, p_service_date, coalesce(v_route.direction, 'outbound'),
    'in_progress', v_driver_data.vehicle_model, v_driver_data.vehicle_plate, now()
  ) returning * into v_journey;
  return v_journey;
end;
$$;

create or replace function public.prevent_active_journey_route_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.active = true and new.active = false and exists (
    select 1 from public.driver_journeys
    where driver_id = old.driver_id and status = 'in_progress'
  ) then
    raise exception 'Conclua a jornada em andamento antes de trocar de rota.';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_active_journey_route_change on public.driver_route_assignments;
create trigger prevent_active_journey_route_change
  before update of active on public.driver_route_assignments
  for each row execute function public.prevent_active_journey_route_change();

create or replace function public.complete_driver_journey(p_journey_id uuid)
returns public.driver_journeys
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_driver uuid := auth.uid();
  v_journey public.driver_journeys%rowtype;
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

  update public.driver_journeys
    set status = 'completed', completed_at = now(), updated_at = now()
    where id = v_journey.id
    returning * into v_journey;
  return v_journey;
end;
$$;

revoke all on function public.start_driver_journey(uuid, date) from public, anon;
revoke all on function public.complete_driver_journey(uuid) from public, anon;
revoke all on function public.prevent_active_journey_route_change() from public, anon, authenticated;
grant execute on function public.start_driver_journey(uuid, date) to authenticated;
grant execute on function public.complete_driver_journey(uuid) to authenticated;

commit;
