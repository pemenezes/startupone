-- Package A. Apply after recurring_routes_v1.sql.
-- Atomic route changes: checks happen before changing assignments; any error rolls back.
begin;

create or replace function public.claim_driver_route(p_route_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_driver uuid := auth.uid();
  v_assignment uuid;
  v_company uuid;
begin
  if v_driver is null or not exists (
    select 1 from public.profiles where id = v_driver and role = 'driver'
  ) then
    raise exception 'Somente motoristas podem assumir rotas.';
  end if;

  -- Serialize requests from the same driver, including requests for different routes.
  perform 1 from public.drivers where id = v_driver for update;
  if not found then
    raise exception 'Cadastro de motorista pendente. Consulte a operação.';
  end if;

  select company_id into v_company from public.routes
    where id = p_route_id and active = true for update;
  if not found then
    raise exception 'Esta rota não está disponível.';
  end if;
  perform 1 from public.companies where id = v_company and active = true for share;
  if not found then
    raise exception 'Esta empresa não está disponível.';
  end if;

  if exists (
    select 1 from public.driver_route_assignments
    where route_id = p_route_id and active = true and driver_id <> v_driver
  ) then
    raise exception 'Esta rota já foi assumida por outro motorista. Sua rota atual foi mantida.';
  end if;

  select id into v_assignment from public.driver_route_assignments
    where driver_id = v_driver and route_id = p_route_id and active = true;
  if v_assignment is not null then
    return v_assignment; -- Retrying the same claim preserves its original starts_on.
  end if;

  update public.driver_route_assignments set active = false
    where driver_id = v_driver and active = true;

  insert into public.driver_route_assignments (driver_id, route_id, active, starts_on)
    values (v_driver, p_route_id, true, (now() at time zone 'America/Sao_Paulo')::date)
    on conflict (driver_id, route_id) do update
      set active = true, starts_on = excluded.starts_on
    returning id into v_assignment;
  return v_assignment;
end;
$$;

revoke all on function public.claim_driver_route(uuid) from public, anon;
grant execute on function public.claim_driver_route(uuid) to authenticated;

-- Route changes by clients must go through the transaction above.
drop policy if exists "Drivers manage own assignments" on public.driver_route_assignments;
revoke insert, update, delete on public.driver_route_assignments from anon, authenticated;
commit;
