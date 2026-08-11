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

## 4. App flow

1. `/login` — pick role  
2. `/login/employee` | `/login/driver` | `/login/company` — email/password  
3. Success only if `profiles.role` matches the selected role  
4. **Sair** signs out via Supabase  

Role mapping: `company` login path → `admin` in the database.
