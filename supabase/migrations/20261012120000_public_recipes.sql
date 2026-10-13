-- Public recipes: anyone, signed in or not, can read recipes marked public. Only owners can write.
-- Existing rows become public via the default; owners can switch individual recipes to private.

alter table public.recipes add column if not exists is_public boolean not null default true;

create index if not exists recipes_public_updated_idx on public.recipes (updated_at desc) where is_public;

create policy "anyone reads public recipes" on public.recipes
  for select to anon, authenticated
  using (is_public);

-- Anonymous visitors get read access only; the policy above limits them to public rows.
grant select on public.recipes to anon;
