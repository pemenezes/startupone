-- MoveCorp: persistent employee credits (run in Supabase SQL Editor)
-- Saldo por funcionário + histórico de movimentações.

alter table public.profiles
  add column if not exists credit_balance numeric(12,2) not null default 0,
  add column if not exists credit_last_top_up date;

-- Optional starting balance for existing employees (adjust if you prefer 0)
update public.profiles
set credit_balance = 350
where role = 'employee'
  and credit_balance = 0;

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12,2) not null,
  title text not null,
  created_at timestamptz default now()
);

create index if not exists credit_transactions_employee_idx
  on public.credit_transactions (employee_id, created_at desc);

alter table public.credit_transactions enable row level security;

drop policy if exists "Employees read own credit tx" on public.credit_transactions;
create policy "Employees read own credit tx"
  on public.credit_transactions for select
  to authenticated
  using (auth.uid() = employee_id);

drop policy if exists "Employees insert own credit tx" on public.credit_transactions;
create policy "Employees insert own credit tx"
  on public.credit_transactions for insert
  to authenticated
  with check (auth.uid() = employee_id);

-- Ensure employees can update their own credit fields (policy may already exist)
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
