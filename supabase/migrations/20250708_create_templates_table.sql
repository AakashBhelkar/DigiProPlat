-- Create the templates table
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  preview_image text not null,
  sections jsonb not null,
  category text not null,
  is_public boolean not null default false,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_user_template_name unique (user_id, name)
);

-- Indexes for performance
create index if not exists idx_templates_user_id on public.templates(user_id);
create index if not exists idx_templates_is_public on public.templates(is_public);
create index if not exists idx_templates_category on public.templates(category);

-- Trigger to auto-update updated_at
create or replace function update_templates_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_templates_updated_at on public.templates;
create trigger update_templates_updated_at
  before update on public.templates
  for each row execute function update_templates_updated_at();

-- Enable Row Level Security (RLS)
alter table public.templates enable row level security;

-- Policy: Only owner can update/delete
create policy "Templates: Only owner can update" on public.templates
  for update using (auth.uid() = user_id);

create policy "Templates: Only owner can delete" on public.templates
  for delete using (auth.uid() = user_id);

-- Policy: Owner can read their templates, public templates are readable by all
create policy "Templates: Owner can read" on public.templates
  for select using (auth.uid() = user_id);

create policy "Templates: Public can read public templates" on public.templates
  for select using (is_public = true);

-- Policy: Only authenticated users can insert
create policy "Templates: Only authenticated can insert" on public.templates
  for insert with check (auth.uid() = user_id);