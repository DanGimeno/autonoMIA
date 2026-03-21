-- ============================================================
-- autonoMIA — Schema completo
-- Base de datos para autónomos españoles
-- ============================================================

-- gen_random_uuid() is built into PostgreSQL 13+ (used by Supabase)

-- ============================================================
-- Función reutilizable: updated_at automático
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- PROFILES (extiende auth.users)
-- Datos fiscales y personales del autónomo
-- ============================================================
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  trade_name text,                       -- nombre comercial
  nif text,                              -- NIF/NIE
  address text,
  city text,
  postal_code text,
  province text,
  phone text,
  iban text,                             -- cuenta bancaria
  epigraph text,                         -- epígrafe IAE
  registration_date date,                -- fecha alta autónomos
  autonomo_fee numeric(10,2),            -- cuota mensual
  default_vat_percent numeric(5,2) default 21,
  default_irpf_percent numeric(5,2) default 15,
  is_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace trigger profiles_updated_at
  before update on profiles
  for each row execute function public.update_updated_at();

-- ============================================================
-- CLIENTS
-- Entidad propia con datos fiscales para facturación
-- ============================================================
create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  name text not null,
  trade_name text,
  nif_cif text,
  type text default 'company' check (type in ('company', 'freelancer', 'individual')),
  email text,
  phone text,
  website text,
  contact_person text,
  address text,
  city text,
  postal_code text,
  province text,
  country text default 'España',
  default_payment_days integer default 30,
  default_vat_percent numeric(5,2) default 21,
  default_irpf_percent numeric(5,2) default 15,
  notes text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace trigger clients_updated_at
  before update on clients
  for each row execute function public.update_updated_at();

-- ============================================================
-- PROJECTS
-- ============================================================
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  client_id uuid references clients on delete set null,
  name text not null,
  client_name text,                      -- legacy, migrar a client_id
  description text,
  status text default 'active' check (status in ('active', 'paused', 'completed')),
  billing_type text default 'hourly' check (billing_type in ('hourly', 'flat_rate')),
  hourly_rate numeric(10,2),
  monthly_rate numeric(10,2),
  start_date date,
  end_date date,
  budget numeric(12,2),
  color text default '#63ADF2',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace trigger projects_updated_at
  before update on projects
  for each row execute function public.update_updated_at();

-- ============================================================
-- WORK LOGS
-- ============================================================
create table if not exists work_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  project_id uuid references projects on delete set null,
  work_date date not null,
  hours numeric(5,2) not null,
  notes text,
  is_billable boolean default true,
  effective_rate numeric(10,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace trigger work_logs_updated_at
  before update on work_logs
  for each row execute function public.update_updated_at();

-- ============================================================
-- INVOICES
-- ============================================================
create table if not exists invoices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  project_id uuid references projects on delete set null,
  client_id uuid references clients on delete set null,
  invoice_number text not null,
  series text default 'F',
  concept text not null,
  issue_date date not null,
  due_date date,
  amount numeric(12,2) not null,
  vat_percent numeric(5,2) default 21,
  irpf_percent numeric(5,2) default 15,
  status text default 'draft' check (status in ('draft', 'issued', 'collected', 'overdue')),
  paid_at timestamptz,
  submitted_to_client boolean default false,
  payment_method text check (payment_method in ('transfer', 'card', 'cash', 'paypal', 'other')),
  -- Recurrencia
  is_recurring boolean default false,
  recurrence_interval text check (recurrence_interval in ('monthly', 'quarterly', 'yearly')),
  recurrence_day integer,
  parent_invoice_id uuid references invoices on delete set null,
  -- Snapshot datos fiscales (congelados al emitir)
  issuer_name text,
  issuer_nif text,
  issuer_address text,
  client_name_snapshot text,
  client_nif_snapshot text,
  client_address_snapshot text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint invoices_unique_number_per_user unique (user_id, invoice_number)
);

create or replace trigger invoices_updated_at
  before update on invoices
  for each row execute function public.update_updated_at();

-- ============================================================
-- INVOICE ITEMS (líneas de factura)
-- ============================================================
create table if not exists invoice_items (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references invoices on delete cascade not null,
  concept text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(12,2) not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- INVOICE SEQUENCES (numeración correlativa por serie/año)
-- ============================================================
create table if not exists invoice_sequences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  year integer not null,
  series text not null default 'F',
  prefix text,
  last_number integer default 0,
  format text default '{prefix}{number}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint invoice_sequences_unique unique (user_id, year, series)
);

-- ============================================================
-- EXPENSES (gastos deducibles)
-- ============================================================
create table if not exists expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  project_id uuid references projects on delete set null,
  client_id uuid references clients on delete set null,
  concept text not null,
  category text not null check (category in (
    'material', 'software', 'hardware', 'travel', 'meals',
    'office', 'telecom', 'professional_services', 'training',
    'insurance', 'vehicle', 'marketing', 'banking', 'taxes', 'other'
  )),
  expense_date date not null,
  amount numeric(12,2) not null,
  vat_percent numeric(5,2) default 21,
  vat_deductible_percent numeric(5,2) default 100,
  irpf_percent numeric(5,2) default 0,
  supplier_name text,
  supplier_nif text,
  receipt_number text,
  payment_method text check (payment_method in ('transfer', 'card', 'cash', 'paypal', 'other')),
  status text default 'pending' check (status in ('pending', 'paid', 'reimbursed')),
  paid_at timestamptz,
  is_recurring boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace trigger expenses_updated_at
  before update on expenses
  for each row execute function public.update_updated_at();

-- ============================================================
-- TAX TASKS (obligaciones fiscales)
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
-- TAX QUARTERS (trimestres fiscales)
-- ============================================================
create table if not exists tax_quarters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  year integer not null,
  quarter integer not null check (quarter between 1 and 4),
  -- IVA (Modelo 303)
  vat_collected numeric(12,2) default 0,
  vat_deductible numeric(12,2) default 0,
  vat_balance numeric(12,2) default 0,
  -- IRPF (Modelo 130)
  income numeric(12,2) default 0,
  deductible_expenses numeric(12,2) default 0,
  net_income numeric(12,2) default 0,
  irpf_rate numeric(5,2) default 20,
  irpf_amount numeric(12,2) default 0,
  irpf_withheld numeric(12,2) default 0,
  -- Cuota
  autonomo_fee numeric(10,2) default 0,
  -- Estado
  modelo_303_status text default 'pending' check (modelo_303_status in ('pending', 'filed', 'paid')),
  modelo_303_filed_at timestamptz,
  modelo_130_status text default 'pending' check (modelo_130_status in ('pending', 'filed', 'paid')),
  modelo_130_filed_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint tax_quarters_unique_per_user unique (user_id, year, quarter)
);

create or replace trigger tax_quarters_updated_at
  before update on tax_quarters
  for each row execute function public.update_updated_at();

-- ============================================================
-- DOCUMENTS (adjuntos: tickets, facturas recibidas, contratos)
-- ============================================================
create table if not exists documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  entity_type text not null check (entity_type in ('invoice', 'expense', 'project', 'client', 'tax_quarter')),
  entity_id uuid not null,
  file_name text not null,
  file_path text not null,
  file_type text,
  file_size integer,
  created_at timestamptz default now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  type text not null check (type in ('overdue_invoice', 'upcoming_tax_task', 'general', 'admin')),
  title text not null,
  message text,
  read boolean default false,
  link text,
  created_at timestamptz default now()
);

-- ============================================================
-- SCHEDULED TASKS (admin)
-- ============================================================
create table if not exists scheduled_tasks (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  cron_expression text not null,
  task_type text not null check (task_type in ('check_overdue_invoices', 'check_upcoming_tax_tasks', 'generate_quarterly_summary', 'custom')),
  enabled boolean default true,
  last_run_at timestamptz,
  next_run_at timestamptz,
  config jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace trigger scheduled_tasks_updated_at
  before update on scheduled_tasks
  for each row execute function public.update_updated_at();

-- ============================================================
-- TASK EXECUTIONS (historial)
-- ============================================================
create table if not exists task_executions (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references scheduled_tasks on delete cascade not null,
  status text not null check (status in ('success', 'failure', 'running')),
  started_at timestamptz default now(),
  completed_at timestamptz,
  result jsonb,
  error text
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table clients enable row level security;
alter table projects enable row level security;
alter table work_logs enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table invoice_sequences enable row level security;
alter table expenses enable row level security;
alter table tax_tasks enable row level security;
alter table tax_quarters enable row level security;
alter table documents enable row level security;
alter table notifications enable row level security;
alter table scheduled_tasks enable row level security;
alter table task_executions enable row level security;

-- Profiles
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Clients
create policy "Users can view own clients" on clients for select using (auth.uid() = user_id);
create policy "Users can insert own clients" on clients for insert with check (auth.uid() = user_id);
create policy "Users can update own clients" on clients for update using (auth.uid() = user_id);
create policy "Users can delete own clients" on clients for delete using (auth.uid() = user_id);

-- Projects
create policy "Users can view own projects" on projects for select using (auth.uid() = user_id);
create policy "Users can insert own projects" on projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on projects for update using (auth.uid() = user_id);
create policy "Users can delete own projects" on projects for delete using (auth.uid() = user_id);

-- Work logs
create policy "Users can view own work logs" on work_logs for select using (auth.uid() = user_id);
create policy "Users can insert own work logs" on work_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own work logs" on work_logs for update using (auth.uid() = user_id);
create policy "Users can delete own work logs" on work_logs for delete using (auth.uid() = user_id);

-- Invoices
create policy "Users can view own invoices" on invoices for select using (auth.uid() = user_id);
create policy "Users can insert own invoices" on invoices for insert with check (auth.uid() = user_id);
create policy "Users can update own invoices" on invoices for update using (auth.uid() = user_id);
create policy "Users can delete own invoices" on invoices for delete using (auth.uid() = user_id);

-- Invoice items (acceso heredado del invoice)
create policy "Users can view own invoice items" on invoice_items for select
  using (exists (select 1 from invoices where invoices.id = invoice_items.invoice_id and invoices.user_id = auth.uid()));
create policy "Users can insert own invoice items" on invoice_items for insert
  with check (exists (select 1 from invoices where invoices.id = invoice_items.invoice_id and invoices.user_id = auth.uid()));
create policy "Users can update own invoice items" on invoice_items for update
  using (exists (select 1 from invoices where invoices.id = invoice_items.invoice_id and invoices.user_id = auth.uid()));
create policy "Users can delete own invoice items" on invoice_items for delete
  using (exists (select 1 from invoices where invoices.id = invoice_items.invoice_id and invoices.user_id = auth.uid()));

-- Invoice sequences
create policy "Users can view own sequences" on invoice_sequences for select using (auth.uid() = user_id);
create policy "Users can insert own sequences" on invoice_sequences for insert with check (auth.uid() = user_id);
create policy "Users can update own sequences" on invoice_sequences for update using (auth.uid() = user_id);

-- Expenses
create policy "Users can view own expenses" on expenses for select using (auth.uid() = user_id);
create policy "Users can insert own expenses" on expenses for insert with check (auth.uid() = user_id);
create policy "Users can update own expenses" on expenses for update using (auth.uid() = user_id);
create policy "Users can delete own expenses" on expenses for delete using (auth.uid() = user_id);

-- Tax tasks
create policy "Users can view own tax tasks" on tax_tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tax tasks" on tax_tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tax tasks" on tax_tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tax tasks" on tax_tasks for delete using (auth.uid() = user_id);

-- Tax quarters
create policy "Users can view own tax quarters" on tax_quarters for select using (auth.uid() = user_id);
create policy "Users can insert own tax quarters" on tax_quarters for insert with check (auth.uid() = user_id);
create policy "Users can update own tax quarters" on tax_quarters for update using (auth.uid() = user_id);
create policy "Users can delete own tax quarters" on tax_quarters for delete using (auth.uid() = user_id);

-- Documents
create policy "Users can view own documents" on documents for select using (auth.uid() = user_id);
create policy "Users can insert own documents" on documents for insert with check (auth.uid() = user_id);
create policy "Users can update own documents" on documents for update using (auth.uid() = user_id);
create policy "Users can delete own documents" on documents for delete using (auth.uid() = user_id);

-- Notifications
create policy "Users can view own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users can insert own notifications" on notifications for insert with check (auth.uid() = user_id);
create policy "Users can update own notifications" on notifications for update using (auth.uid() = user_id);
create policy "Users can delete own notifications" on notifications for delete using (auth.uid() = user_id);

-- Scheduled tasks (admin only)
create policy "Admins can view scheduled tasks" on scheduled_tasks for select
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
create policy "Admins can insert scheduled tasks" on scheduled_tasks for insert
  with check (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
create policy "Admins can update scheduled tasks" on scheduled_tasks for update
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
create policy "Admins can delete scheduled tasks" on scheduled_tasks for delete
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Task executions (admin only)
create policy "Admins can view task executions" on task_executions for select
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

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
