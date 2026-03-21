-- Add is_admin to profiles
alter table profiles add column if not exists is_admin boolean default false;

-- Notifications table
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

alter table notifications enable row level security;

create policy "Users can view own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users can insert own notifications" on notifications for insert with check (auth.uid() = user_id);
create policy "Users can update own notifications" on notifications for update using (auth.uid() = user_id);
create policy "Users can delete own notifications" on notifications for delete using (auth.uid() = user_id);

-- Scheduled tasks table (admin panel)
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

-- Scheduled tasks are admin-only — no RLS (only accessible via service role or admin check in app)
alter table scheduled_tasks enable row level security;

-- Only admins can manage scheduled tasks
create policy "Admins can view scheduled tasks" on scheduled_tasks for select
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
create policy "Admins can insert scheduled tasks" on scheduled_tasks for insert
  with check (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
create policy "Admins can update scheduled tasks" on scheduled_tasks for update
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
create policy "Admins can delete scheduled tasks" on scheduled_tasks for delete
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Task execution log
create table if not exists task_executions (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references scheduled_tasks on delete cascade not null,
  status text not null check (status in ('success', 'failure', 'running')),
  started_at timestamptz default now(),
  completed_at timestamptz,
  result jsonb,
  error text
);

alter table task_executions enable row level security;

create policy "Admins can view task executions" on task_executions for select
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Updated_at triggers
create or replace trigger scheduled_tasks_updated_at
  before update on scheduled_tasks
  for each row execute function public.update_updated_at();
