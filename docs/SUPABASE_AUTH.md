# Supabase Auth — MoveCorp

## 1. Environment variables

Copy [`.env.example`](../.env.example) to `.env` in the `startupone` folder:

```env
VITE_SUPABASE_URL=https://lybfluvegtwdlcpbmmgl.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key_here
```

Get values from: **Project Settings → API**  
- Project URL (not the dashboard URL)  
- `anon` `public` key  

Restart `npm run dev` after changing `.env`.

## 2. SQL (run in SQL Editor if not already done)

```sql
create type public.app_role as enum ('employee', 'driver', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role public.app_role not null,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);
```

## 3. Create 3 test users

### Fast way (recommended)

Open [`seed_example_users.sql`](./seed_example_users.sql), paste the whole file into **Supabase → SQL Editor**, and click **Run**.

| Role | Email | Password |
|------|-------|----------|
| employee | `funcionario@movecorp.test` | `Senha123!` |
| driver | `motorista@movecorp.test` | `Senha123!` |
| admin | `admin@movecorp.test` | `Senha123!` |

Then in the app: pick the role → enter that email/password.

### Manual way

#### A. Auth → Users → Add user

Create users with email + password (auto-confirm email for local testing).

Example:

| Email | Password | Role |
|-------|----------|------|
| `funcionario@movecorp.test` | (your choice) | employee |
| `motorista@movecorp.test` | (your choice) | driver |
| `admin@movecorp.test` | (your choice) | admin |

#### B. Link each user to `profiles`

After creating a user, copy their **User UID** from Auth → Users.

In SQL Editor:

```sql
insert into public.profiles (id, email, full_name, role)
values
  ('PASTE_EMPLOYEE_USER_UUID', 'funcionario@movecorp.test', 'Ana Silva', 'employee'),
  ('PASTE_DRIVER_USER_UUID', 'motorista@movecorp.test', 'Carlos Roberto', 'driver'),
  ('PASTE_ADMIN_USER_UUID', 'admin@movecorp.test', 'Admin TechCorp', 'admin');
```

Replace the three UUIDs with the real ones from the dashboard.

## Persistent employee credits

Run [`employee_credits.sql`](./employee_credits.sql).

- `profiles.credit_balance` — saldo por funcionário  
- `credit_transactions` — histórico (adição / troca VT / etc.)

The Credits screen reads/writes these so the balance survives refresh and is per logged-in user.

## Employee onboarding + trips

1. Run [`drivers_and_reviews.sql`](./drivers_and_reviews.sql) (if not done).
2. Run [`employee_onboarding_and_trips.sql`](./employee_onboarding_and_trips.sql).

Flow: login as employee → pick company → home/work addresses → choose route → home unlocks Acompanhar / Cancelar.

Optional: link a driver to routes:

```sql
update public.routes
set driver_id = 'PASTE_DRIVER_UUID'
where name like 'Linha Centro%';
```

## Drivers registry + reviews

Run [`drivers_and_reviews.sql`](./drivers_and_reviews.sql) in the Supabase SQL Editor once.

After that:

1. Any user with `profiles.role = 'driver'` gets a row in `public.drivers` (backfill + trigger).
2. Employees open **Avaliar motorista** and see **real** driver name + vehicle from the DB.
3. Submitting a review inserts into `driver_reviews` and updates `rating_average` / `rating_count`.

### Optional: set vehicle details for an existing driver

```sql
update public.drivers
set
  vehicle_model = 'Mercedes Sprinter',
  vehicle_plate = 'ABC-1234',
  vehicle_color = 'Branca',
  vehicle_capacity = 15,
  photo_url = 'https://i.pravatar.cc/150?u=driver1'
where id = 'PASTE_DRIVER_USER_UUID';
```

Get the UUID from **Authentication → Users** (or `select id, email from profiles where role = 'driver';`).

### App files

- [`src/lib/drivers.js`](../src/lib/drivers.js) — fetch / submit
- [`src/pages/employee/ReviewDriver.jsx`](../src/pages/employee/ReviewDriver.jsx) — UI


1. `/login` — pick role  
2. `/login/employee` | `/login/driver` | `/login/company` — email/password  
3. Success only if `profiles.role` matches the selected role  
4. **Sair** signs out via Supabase  

Role mapping: `company` login path → `admin` in the database.

## 5. Self-registration

Employees and drivers can create their own account (administrators are created
separately — see below).

### One-time setup: install the profile trigger

The app creates the auth user with `supabase.auth.signUp`, but the matching
`profiles` row is created by a database trigger. Install it once:

Open [`handle_new_user_trigger.sql`](./handle_new_user_trigger.sql), paste the
whole file into **Supabase → SQL Editor**, and click **Run**.

This adds a `handle_new_user()` function + `on_auth_user_created` trigger that
inserts into `profiles` using the signup metadata (`full_name`, `role`). No
client-side INSERT policy is needed, and it works whether or not email
confirmation is enabled.

### Register flow

1. `/register` — pick role (funcionário or motorista)
2. `/register/employee` | `/register/driver` — name, email, senha, confirmar senha
3. On submit, `signUp` sends `{ full_name, role }` as user metadata; the trigger
   creates the `profiles` row.
4. If email confirmation is **disabled** in your Supabase project, the user is
   logged in immediately and sent to their dashboard. If it is **enabled**, the
   app shows a "confirm your email" message and links to the login screen.

### Creating administrators

Admins are not self-registerable. With the trigger installed, create an admin by
adding a user whose metadata includes the admin role — either:

- Supabase → **Authentication → Users → Add user**, and set User Metadata to
  `{ "full_name": "Name", "role": "admin" }`, or
- the existing [`seed_example_users.sql`](./seed_example_users.sql) script.

Note: once the trigger is installed, the manual `insert into public.profiles ...`
statements in `seed_example_users.sql` become redundant (the trigger already
creates each profile from metadata). They are harmless because the trigger uses
`on conflict (id) do nothing`, but the role then comes from the user metadata
(`raw_user_meta_data.role`), so make sure that metadata sets the intended role.
