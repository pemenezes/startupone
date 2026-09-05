-- MoveCorp V1: recurring routes by region (run in Supabase SQL Editor)
-- Requires: companies, profiles, drivers, routes (from earlier docs).

-- 1) Regions
create table if not exists public.regions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  city text default 'São Paulo',
  active boolean not null default true,
  created_at timestamptz default now()
);

alter table public.regions enable row level security;

drop policy if exists "Authenticated can read regions" on public.regions;
create policy "Authenticated can read regions"
  on public.regions for select
  to authenticated
  using (active = true);

insert into public.regions (name, city) values
  ('Zona Oeste', 'São Paulo'),
  ('Zona Sul', 'São Paulo'),
  ('Zona Norte', 'São Paulo'),
  ('Centro', 'São Paulo')
on conflict (name) do nothing;

-- 2) Profile region
alter table public.profiles
  add column if not exists region_id uuid references public.regions(id) on delete set null;

-- 3) Extend routes for recurring model
alter table public.routes
  add column if not exists region_id uuid references public.regions(id) on delete set null,
  add column if not exists direction text default 'outbound'
    check (direction in ('outbound', 'return')),
  add column if not exists destination_label text,
  add column if not exists typical_start_time text default '07:30';

update public.routes
set destination_label = coalesce(nullif(destination_label, ''), boarding_stop)
where destination_label is null or destination_label = '';

update public.routes
set typical_start_time = coalesce(nullif(typical_start_time, ''), estimated_arrival, '07:30')
where typical_start_time is null or typical_start_time = '';

-- Attach seeded routes to regions by company (best-effort)
update public.routes r
set region_id = rg.id
from public.companies c, public.regions rg
where r.company_id = c.id
  and r.region_id is null
  and (
    (c.name = 'TechCorp S.A.' and rg.name = 'Centro')
    or (c.name = 'Inova Mobilidade Ltda.' and rg.name = 'Zona Sul')
    or (c.name = 'Grupo Horizonte' and rg.name = 'Zona Norte')
  );

-- Extra outbound/return pair example for TechCorp + Zona Oeste
insert into public.routes (
  company_id, region_id, name, boarding_stop, destination_label,
  direction, typical_start_time, estimated_arrival, eta_minutes, occupancy, active
)
select c.id, rg.id, v.name, v.boarding_stop, v.destination_label,
       v.direction, v.typical_start_time, v.typical_start_time, v.eta_minutes, 60, true
from public.companies c
cross join public.regions rg
cross join (
  values
    ('Zona Oeste → TechCorp (ida)', 'Casas Zona Oeste', 'Sede TechCorp', 'outbound', '07:20', 35),
    ('TechCorp → Zona Oeste (volta)', 'Sede TechCorp', 'Casas Zona Oeste', 'return', '18:15', 40)
) as v(name, boarding_stop, destination_label, direction, typical_start_time, eta_minutes)
where c.name = 'TechCorp S.A.'
  and rg.name = 'Zona Oeste'
  and not exists (
    select 1 from public.routes r where r.company_id = c.id and r.name = v.name
  );

-- 4) Driver permanent route assignment (Mon–Fri responsibility)
create table if not exists public.driver_route_assignments (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.drivers(id) on delete cascade,
  route_id uuid not null references public.routes(id) on delete cascade,
  active boolean not null default true,
  starts_on date not null default current_date,
  created_at timestamptz default now(),
  unique (driver_id, route_id)
);

create index if not exists driver_assignments_driver_idx
  on public.driver_route_assignments (driver_id, active);

create index if not exists driver_assignments_route_idx
  on public.driver_route_assignments (route_id, active);

alter table public.driver_route_assignments enable row level security;

drop policy if exists "Drivers manage own assignments" on public.driver_route_assignments;
create policy "Drivers manage own assignments"
  on public.driver_route_assignments for all
  to authenticated
  using (auth.uid() = driver_id)
  with check (auth.uid() = driver_id);

drop policy if exists "Authenticated read assignments" on public.driver_route_assignments;
create policy "Authenticated read assignments"
  on public.driver_route_assignments for select
  to authenticated
  using (true);

-- Only one active driver per route
create unique index if not exists driver_assignments_one_active_per_route
  on public.driver_route_assignments (route_id)
  where active = true;

-- 5) Employee recurring subscriptions (route + weekdays)
-- weekdays: ISO 1=Mon ... 7=Sun as jsonb array, e.g. [1,2,3,4,5]
create table if not exists public.employee_route_subscriptions (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  route_id uuid not null references public.routes(id) on delete cascade,
  weekdays jsonb not null default '[1,2,3,4,5]'::jsonb,
  active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (employee_id, route_id)
);

create index if not exists employee_subscriptions_employee_idx
  on public.employee_route_subscriptions (employee_id, active);

alter table public.employee_route_subscriptions enable row level security;

drop policy if exists "Employees manage own subscriptions" on public.employee_route_subscriptions;
create policy "Employees manage own subscriptions"
  on public.employee_route_subscriptions for all
  to authenticated
  using (auth.uid() = employee_id)
  with check (auth.uid() = employee_id);

drop policy if exists "Drivers read subscriptions for assigned routes" on public.employee_route_subscriptions;
create policy "Drivers read subscriptions for assigned routes"
  on public.employee_route_subscriptions for select
  to authenticated
  using (
    exists (
      select 1 from public.driver_route_assignments a
      where a.driver_id = auth.uid()
        and a.route_id = employee_route_subscriptions.route_id
        and a.active = true
    )
  );

-- 6) Day exceptions (cancel / extra day)
create table if not exists public.attendance_exceptions (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  route_id uuid not null references public.routes(id) on delete cascade,
  exception_date date not null,
  type text not null check (type in ('cancelled', 'added_extra')),
  reason text,
  created_at timestamptz default now(),
  unique (employee_id, route_id, exception_date)
);

create index if not exists attendance_exceptions_date_idx
  on public.attendance_exceptions (route_id, exception_date);

alter table public.attendance_exceptions enable row level security;

drop policy if exists "Employees manage own exceptions" on public.attendance_exceptions;
create policy "Employees manage own exceptions"
  on public.attendance_exceptions for all
  to authenticated
  using (auth.uid() = employee_id)
  with check (auth.uid() = employee_id);

drop policy if exists "Drivers read exceptions for assigned routes" on public.attendance_exceptions;
create policy "Drivers read exceptions for assigned routes"
  on public.attendance_exceptions for select
  to authenticated
  using (
    exists (
      select 1 from public.driver_route_assignments a
      where a.driver_id = auth.uid()
        and a.route_id = attendance_exceptions.route_id
        and a.active = true
    )
  );

-- Drivers can read passenger profile fields for people on their assigned routes
drop policy if exists "Drivers read assigned passenger profiles" on public.profiles;
create policy "Drivers read assigned passenger profiles"
  on public.profiles for select
  to authenticated
  using (
    exists (
      select 1
      from public.employee_route_subscriptions s
      join public.driver_route_assignments a
        on a.route_id = s.route_id and a.active = true
      where s.employee_id = profiles.id
        and s.active = true
        and a.driver_id = auth.uid()
    )
  );
