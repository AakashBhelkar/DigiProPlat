-- Create user_api_keys table for storing encrypted API keys per user/provider
create table if not exists public.user_api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null, -- e.g., 'openai'
  api_key_encrypted text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

-- Enable Row Level Security
alter table public.user_api_keys enable row level security;

-- Policy: Only the owner can read/write their key
create policy "Allow user to manage own API keys"
  on public.user_api_keys
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id); 