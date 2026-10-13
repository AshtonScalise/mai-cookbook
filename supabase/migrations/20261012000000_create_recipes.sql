-- Initial schema: one recipes table per user, protected by row-level security.
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recipes_user_id_idx on public.recipes (user_id);

alter table public.recipes enable row level security;

create policy "users read own recipes"   on public.recipes for select using (auth.uid() = user_id);
create policy "users insert own recipes" on public.recipes for insert with check (auth.uid() = user_id);
create policy "users update own recipes" on public.recipes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own recipes" on public.recipes for delete using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists recipes_set_updated_at on public.recipes;
create trigger recipes_set_updated_at
  before update on public.recipes
  for each row execute function public.set_updated_at();

-- Explicit grants so the Data API works even when auto-expose of new tables is off. RLS still limits rows per user.
grant select, insert, update, delete on public.recipes to authenticated;
