-- MoveCorp: companies, employee onboarding fields, routes, active trips
-- Run AFTER docs/drivers_and_reviews.sql (drivers table must exist).
-- Paste into Supabase → SQL Editor → Run.

-- 1) Companies (employee dropdown)
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz default now()
);

alter table public.companies enable row level security;

drop policy if exists "Authenticated can read companies" on public.companies;
create policy "Authenticated can read companies"
  on public.companies for select
  to authenticated
  using (active = true);

insert into public.companies (name) values
  ('TechCorp S.A.'),
  ('Inova Mobilidade Ltda.'),
  ('Grupo Horizonte')
on conflict (name) do nothing;

-- 2) Profile onboarding fields
alter table public.profiles
  add column if not exists company_id uuid references public.companies(id) on delete set null,
  add column if not exists home_address text,
  add column if not exists work_address text;

-- 3) Company routes (optional driver link)
create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  boarding_stop text not null,
  driver_id uuid references public.drivers(id) on delete set null,
  estimated_arrival text default '08:00',
  eta_minutes int default 15,
  occupancy int default 70,
  active boolean not null default true,
  created_at timestamptz default now()
);

create index if not exists routes_company_id_idx on public.routes (company_id);

alter table public.routes enable row level security;

drop policy if exists "Authenticated can read routes" on public.routes;
create policy "Authenticated can read routes"
  on public.routes for select
  to authenticated
  using (active = true);

-- Seed routes without drivers first (link drivers later with UPDATE)
insert into public.routes (company_id, name, boarding_stop, estimated_arrival, eta_minutes, occupancy)
select c.id, v.name, v.boarding_stop, v.estimated_arrival, v.eta_minutes, v.occupancy
from public.companies c
cross join (
  values
    ('Linha Centro → Zona Sul', 'Praça Matriz', '18:15', 12, 85),
    ('Linha Centro Express', 'Estação da Luz', '18:05', 8, 62),
    ('Linha Pinheiros → Sul', 'Rua Augusta, 200', '18:20', 18, 74)
) as v(name, boarding_stop, estimated_arrival, eta_minutes, occupancy)
where c.name = 'TechCorp S.A.'
  and not exists (
    select 1 from public.routes r where r.company_id = c.id and r.name = v.name
  );

insert into public.routes (company_id, name, boarding_stop, estimated_arrival, eta_minutes, occupancy)
select c.id, v.name, v.boarding_stop, v.estimated_arrival, v.eta_minutes, v.occupancy
from public.companies c
cross join (
  values
    ('Linha Inova Circuito', 'Av. Paulista, 1000', '07:45', 20, 55),
    ('Linha Inova Express', 'Estação Consolação', '08:10', 10, 68)
) as v(name, boarding_stop, estimated_arrival, eta_minutes, occupancy)
where c.name = 'Inova Mobilidade Ltda.'
  and not exists (
    select 1 from public.routes r where r.company_id = c.id and r.name = v.name
  );

insert into public.routes (company_id, name, boarding_stop, estimated_arrival, eta_minutes, occupancy)
select c.id, v.name, v.boarding_stop, v.estimated_arrival, v.eta_minutes, v.occupancy
from public.companies c
cross join (
  values
    ('Linha Horizonte Norte', 'Terminal Barra Funda', '07:30', 25, 60)
) as v(name, boarding_stop, estimated_arrival, eta_minutes, occupancy)
where c.name = 'Grupo Horizonte'
  and not exists (
    select 1 from public.routes r where r.company_id = c.id and r.name = v.name
  );

-- Optional: attach first registered driver to all TechCorp routes
update public.routes r
set driver_id = d.id
from public.drivers d
join public.companies c on c.id = r.company_id
where c.name = 'TechCorp S.A.'
  and r.driver_id is null
  and d.id = (select id from public.drivers order by created_at asc limit 1);

-- 4) Employee active / cancelled trips
create table if not exists public.employee_trips (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  route_id uuid not null references public.routes(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'cancelled')),
  trip_date date not null default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists employee_trips_employee_idx on public.employee_trips (employee_id, trip_date, status);

alter table public.employee_trips enable row level security;

drop policy if exists "Employees read own trips" on public.employee_trips;
create policy "Employees read own trips"
  on public.employee_trips for select
  to authenticated
  using (auth.uid() = employee_id);

drop policy if exists "Employees insert own trips" on public.employee_trips;
create policy "Employees insert own trips"
  on public.employee_trips for insert
  to authenticated
  with check (auth.uid() = employee_id);

drop policy if exists "Employees update own trips" on public.employee_trips;
create policy "Employees update own trips"
  on public.employee_trips for update
  to authenticated
  using (auth.uid() = employee_id)
  with check (auth.uid() = employee_id);

-- Employees can update own onboarding profile fields
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
