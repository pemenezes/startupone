-- MoveCorp: drivers registry + reviews (run in Supabase SQL Editor)
-- Lets employees rate real drivers registered on the platform.

-- 1) Extended driver profile (1:1 with profiles where role = driver)
create table if not exists public.drivers (
  id uuid primary key references public.profiles(id) on delete cascade,
  photo_url text,
  vehicle_model text not null default 'Van',
  vehicle_plate text not null default 'A definir',
  vehicle_color text default 'Branca',
  vehicle_capacity int default 15,
  vehicle_photo_url text,
  rating_average numeric(3,2) not null default 5.00,
  rating_count int not null default 0,
  verified_since date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.drivers enable row level security;

drop policy if exists "Authenticated users can read drivers" on public.drivers;
create policy "Authenticated users can read drivers"
  on public.drivers for select
  to authenticated
  using (true);

drop policy if exists "Drivers can update own row" on public.drivers;
create policy "Drivers can update own row"
  on public.drivers for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Allow drivers to insert their own row if missing
drop policy if exists "Drivers can insert own row" on public.drivers;
create policy "Drivers can insert own row"
  on public.drivers for insert
  to authenticated
  with check (auth.uid() = id);

-- 2) Allow reading driver profiles (name/email) for rating UI
drop policy if exists "Authenticated can read driver profiles" on public.profiles;
create policy "Authenticated can read driver profiles"
  on public.profiles for select
  to authenticated
  using (role = 'driver' or auth.uid() = id);

-- 3) Reviews
create table if not exists public.driver_reviews (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.drivers(id) on delete cascade,
  employee_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  route_name text,
  created_at timestamptz default now()
);

alter table public.driver_reviews enable row level security;

drop policy if exists "Authenticated can read reviews" on public.driver_reviews;
create policy "Authenticated can read reviews"
  on public.driver_reviews for select
  to authenticated
  using (true);

drop policy if exists "Employees can insert own reviews" on public.driver_reviews;
create policy "Employees can insert own reviews"
  on public.driver_reviews for insert
  to authenticated
  with check (auth.uid() = employee_id);

-- 4) Keep rating_average / rating_count in sync
create or replace function public.refresh_driver_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.drivers d
  set
    rating_average = coalesce((
      select round(avg(r.rating)::numeric, 2)
      from public.driver_reviews r
      where r.driver_id = coalesce(new.driver_id, old.driver_id)
    ), 5.00),
    rating_count = (
      select count(*)::int
      from public.driver_reviews r
      where r.driver_id = coalesce(new.driver_id, old.driver_id)
    ),
    updated_at = now()
  where d.id = coalesce(new.driver_id, old.driver_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists on_driver_review_changed on public.driver_reviews;
create trigger on_driver_review_changed
  after insert or update or delete on public.driver_reviews
  for each row
  execute function public.refresh_driver_rating();

-- 5) Auto-create drivers row when a driver profile is created
create or replace function public.handle_new_driver_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'driver' then
    insert into public.drivers (id)
    values (new.id)
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_profile_driver_created on public.profiles;
create trigger on_profile_driver_created
  after insert or update of role on public.profiles
  for each row
  execute function public.handle_new_driver_profile();

-- 6) Backfill: create drivers rows for existing driver profiles
insert into public.drivers (id)
select p.id
from public.profiles p
where p.role = 'driver'
on conflict (id) do nothing;
