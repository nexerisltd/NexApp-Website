-- ============================================================
-- NexApp — Supabase schema
-- Run this once in the Supabase SQL Editor (or via `supabase db push`)
-- ============================================================

-- 0. PROFILES (created first so is_admin() below can reference it) -----
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- 1. Admin-check helper (security definer bypasses RLS so it never
--    falls into a self-referential-policy problem) ----------------------
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin(auth.uid()));

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

grant execute on function public.is_admin(uuid) to authenticated, anon;

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. CATEGORIES --------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

drop policy if exists "Categories are public" on public.categories;
create policy "Categories are public" on public.categories for select using (true);

drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories" on public.categories for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- 3. APPS ----------------------------------------------------------
create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  tagline text,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  icon_url text,
  screenshots text[] default '{}',
  version text default '1.0.0',
  size_label text,                       -- e.g. "24 MB" (free-form, since files are hosted externally)
  -- Each entry: { "label": "Windows", "url": "https://...", "group": "desktop" | "mobile" | "web" | "other" }
  platform_links jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  downloads_count integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migrating an existing install? These are safe to run any number of times:
alter table public.apps add column if not exists platform_links jsonb not null default '[]'::jsonb;
alter table public.apps drop column if exists platforms;
alter table public.apps drop column if exists external_link;

alter table public.apps enable row level security;

drop policy if exists "Published apps are public" on public.apps;
create policy "Published apps are public" on public.apps for select
  using (status = 'published' or public.is_admin(auth.uid()));

drop policy if exists "Admins manage apps" on public.apps;
create policy "Admins manage apps" on public.apps for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create index if not exists apps_category_idx on public.apps (category_id);
create index if not exists apps_status_idx on public.apps (status);

-- 4. DOWNLOADS (event log + per-user history) -----------------------
create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  platform_label text,
  created_at timestamptz not null default now()
);

alter table public.downloads enable row level security;

alter table public.downloads add column if not exists platform_label text;

drop policy if exists "Anyone can log a download" on public.downloads;
create policy "Anyone can log a download" on public.downloads for insert
  with check (true);

drop policy if exists "Users see their own downloads" on public.downloads;
create policy "Users see their own downloads" on public.downloads for select
  using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- Bump apps.downloads_count whenever a download row is inserted
create or replace function public.increment_app_downloads()
returns trigger as $$
begin
  update public.apps set downloads_count = downloads_count + 1 where id = new.app_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_download_logged on public.downloads;
create trigger on_download_logged
  after insert on public.downloads
  for each row execute procedure public.increment_app_downloads();

-- 5. Keep apps.updated_at fresh --------------------------------------
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists apps_touch_updated_at on public.apps;
create trigger apps_touch_updated_at
  before update on public.apps
  for each row execute procedure public.touch_updated_at();

-- 6. Seed a couple of starter categories (safe to edit/remove) --------
insert into public.categories (name, slug) values
  ('Productivity', 'productivity'),
  ('Utilities', 'utilities'),
  ('Games', 'games'),
  ('Developer Tools', 'developer-tools')
on conflict (name) do nothing;

-- 7. Storage bucket for app icons & screenshots (PNG/JPEG uploads) -----
insert into storage.buckets (id, name, public)
values ('app-assets', 'app-assets', true)
on conflict (id) do nothing;

drop policy if exists "Public can read app assets" on storage.objects;
create policy "Public can read app assets"
  on storage.objects for select
  using (bucket_id = 'app-assets');

drop policy if exists "Admins can upload app assets" on storage.objects;
create policy "Admins can upload app assets"
  on storage.objects for insert
  with check (bucket_id = 'app-assets' and public.is_admin(auth.uid()));

drop policy if exists "Admins can update app assets" on storage.objects;
create policy "Admins can update app assets"
  on storage.objects for update
  using (bucket_id = 'app-assets' and public.is_admin(auth.uid()));

drop policy if exists "Admins can delete app assets" on storage.objects;
create policy "Admins can delete app assets"
  on storage.objects for delete
  using (bucket_id = 'app-assets' and public.is_admin(auth.uid()));

-- ============================================================
-- To make yourself an admin after signing up once, run:
--   update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'you@gmail.com');
-- ============================================================

-- 10. Admin management by email (used by the in-app "Add admin" form) -----
create or replace function public.promote_to_admin(target_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Only admins can promote users';
  end if;

  select id into target_id from auth.users where email = target_email;

  if target_id is null then
    raise exception 'No account found for that email — they need to sign up first';
  end if;

  update public.profiles set role = 'admin' where id = target_id;
  return true;
end;
$$;

create or replace function public.revoke_admin(target_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Only admins can revoke admin access';
  end if;

  select id into target_id from auth.users where email = target_email;

  if target_id is null then
    raise exception 'No account found for that email';
  end if;

  if target_id = auth.uid() then
    raise exception 'You cannot revoke your own admin access';
  end if;

  update public.profiles set role = 'user' where id = target_id;
  return true;
end;
$$;

create or replace function public.list_admins()
returns table(id uuid, email text, full_name text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Only admins can view this';
  end if;

  return query
    select p.id, u.email::text, p.full_name
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.role = 'admin';
end;
$$;

grant execute on function public.promote_to_admin(text) to authenticated;
grant execute on function public.revoke_admin(text) to authenticated;
grant execute on function public.list_admins() to authenticated;

-- 9. SOURCES — one GitHub repo link per app, shown on that app's page ----
create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade unique,
  github_url text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sources enable row level security;

drop policy if exists "Sources are public" on public.sources;
create policy "Sources are public" on public.sources for select using (true);

drop policy if exists "Admins manage sources" on public.sources;
create policy "Admins manage sources" on public.sources for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop trigger if exists sources_touch_updated_at on public.sources;
create trigger sources_touch_updated_at
  before update on public.sources
  for each row execute procedure public.touch_updated_at();

-- 11. App ID — a permanent, auto-generated 6-digit code per app (distinct
--     from the internal uuid and from sources.app_id, the FK column) -----
alter table public.apps add column if not exists app_code text unique;

create or replace function public.generate_app_code()
returns trigger
language plpgsql
as $$
declare
  candidate text;
  taken boolean;
begin
  if new.app_code is not null then
    return new;
  end if;
  loop
    candidate := lpad((floor(random() * 1000000))::text, 6, '0');
    select exists(select 1 from public.apps where app_code = candidate) into taken;
    exit when not taken;
  end loop;
  new.app_code := candidate;
  return new;
end;
$$;

drop trigger if exists set_app_code on public.apps;
create trigger set_app_code
  before insert on public.apps
  for each row execute procedure public.generate_app_code();

-- Backfill any existing apps that don't have a code yet
do $$
declare
  r record;
  candidate text;
  taken boolean;
begin
  for r in select id from public.apps where app_code is null loop
    loop
      candidate := lpad((floor(random() * 1000000))::text, 6, '0');
      select exists(select 1 from public.apps where app_code = candidate) into taken;
      exit when not taken;
    end loop;
    update public.apps set app_code = candidate where id = r.id;
  end loop;
end $$;

-- 12. Let a signed-in user delete their own account -----------------------
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_own_account() to authenticated;
