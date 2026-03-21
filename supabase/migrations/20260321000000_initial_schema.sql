-- gen_random_uuid() is built into PostgreSQL 13+ (used by Supabase)

-- ============================================================
-- Updated_at trigger function (reusable)
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- Profiles table (extends Supabase auth.users)
-- ============================================================
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  nif text,
  address text,
  default_vat_percent numeric(5,2) default 21,
  default_irpf_percent numeric(5,2) default 15,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace trigger profiles_updated_at
  before update on profiles
  for each row execute function public.update_updated_at();

-- ============================================================
-- Projects table
-- ============================================================
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  name text not null,
  client_name text,
  description text,
  status text default 'active' check (status in ('active', 'paused', 'completed')),
  hourly_rate numeric(10,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace trigger projects_updated_at
  before update on projects
  for each row execute function public.update_updated_at();

-- ============================================================
-- Work logs table
-- ============================================================
create table if not exists work_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  project_id uuid references projects on delete set null,
  work_date date not null,
  hours numeric(5,2) not null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace trigger work_logs_updated_at
  before update on work_logs
  for each row execute function public.update_updated_at();

-- ============================================================
-- Invoices table
-- ============================================================
create table if not exists invoices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  project_id uuid references projects on delete set null,
  invoice_number text not null,
  concept text not null,
  issue_date date not null,
  due_date date,
  amount numeric(12,2) not null,
  vat_percent numeric(5,2) default 21,
  irpf_percent numeric(5,2) default 15,
  status text default 'draft' check (status in ('draft', 'issued', 'collected', 'overdue')),
  paid_at timestamptz,
  submitted_to_client boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint invoices_unique_number_per_user unique (user_id, invoice_number)
);

create or replace trigger invoices_updated_at
  before update on invoices
  for each row execute function public.update_updated_at();

-- ============================================================
-- Tax tasks table
-- ============================================================
create table if not exists tax_tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  title text not null,
  due_date date not null,
  category text default 'other' check (category in ('IVA', 'IRPF', 'cuota autónomo', 'other')),
  status text default 'pending' check (status in ('pending', 'done')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace trigger tax_tasks_updated_at
  before update on tax_tasks
  for each row execute function public.update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles enable row level security;
alter table projects enable row level security;
alter table work_logs enable row level security;
alter table invoices enable row level security;
alter table tax_tasks enable row level security;

-- Profiles policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Projects policies
create policy "Users can view own projects" on projects for select using (auth.uid() = user_id);
create policy "Users can insert own projects" on projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on projects for update using (auth.uid() = user_id);
create policy "Users can delete own projects" on projects for delete using (auth.uid() = user_id);

-- Work logs policies
create policy "Users can view own work logs" on work_logs for select using (auth.uid() = user_id);
create policy "Users can insert own work logs" on work_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own work logs" on work_logs for update using (auth.uid() = user_id);
create policy "Users can delete own work logs" on work_logs for delete using (auth.uid() = user_id);

-- Invoices policies
create policy "Users can view own invoices" on invoices for select using (auth.uid() = user_id);
create policy "Users can insert own invoices" on invoices for insert with check (auth.uid() = user_id);
create policy "Users can update own invoices" on invoices for update using (auth.uid() = user_id);
create policy "Users can delete own invoices" on invoices for delete using (auth.uid() = user_id);

-- Tax tasks policies
create policy "Users can view own tax tasks" on tax_tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tax tasks" on tax_tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tax tasks" on tax_tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tax tasks" on tax_tasks for delete using (auth.uid() = user_id);

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
