-- API Tokens para MCP y integraciones externas
create table if not exists api_tokens (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  name text not null,
  token_hash text not null,
  token_prefix text not null,
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace trigger api_tokens_updated_at
  before update on api_tokens
  for each row execute function public.update_updated_at();

alter table api_tokens enable row level security;

create policy "Users can view own tokens" on api_tokens
  for select using (auth.uid() = user_id);
create policy "Users can insert own tokens" on api_tokens
  for insert with check (auth.uid() = user_id);
create policy "Users can update own tokens" on api_tokens
  for update using (auth.uid() = user_id);
create policy "Users can delete own tokens" on api_tokens
  for delete using (auth.uid() = user_id);
