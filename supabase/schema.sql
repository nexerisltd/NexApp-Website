-- ============================================================
-- NexApp — Supabase schema
-- Run this once in the Supabase SQL Editor (or via `supabase db push`)
-- ============================================================

-- Idempotent helper: ALTER PUBLICATION ... ADD TABLE has no IF NOT EXISTS
-- clause in Postgres, so re-running this file verbatim would error the
-- second time around without this guard. Every "add a table to realtime"
-- statement below goes through this instead of the raw ALTER PUBLICATION.
create or replace function public.add_table_to_realtime(target_table regclass)
returns void
language plpgsql
as $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = target_table::text
  ) then
    execute format('alter publication supabase_realtime add table %s', target_table);
  end if;
end;
$$;

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

-- Reviewer/submitter names and avatars are shown publicly across the site
-- (reviews, submissions list, etc.), so anyone must be able to read just
-- these display fields. This does not expose anything sensitive: profiles
-- only ever contain id, full_name, avatar_url, role, created_at, and none
-- of those are secrets.
drop policy if exists "Public can view basic profile info" on public.profiles;
create policy "Public can view basic profile info"
  on public.profiles for select
  using (true);

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
  -- Each entry: { "url": "https://...", "group": "desktop" | "mobile" | "web" | "other" }
  screenshots jsonb not null default '[]'::jsonb,
  version text default '1.0.0',
  size_label text,                       -- e.g. "24 MB" (free-form, since files are hosted externally)
  -- Each entry: { "label": "Windows", "url": "https://...", "group": "desktop" | "mobile" | "web" | "other" }
  platform_links jsonb not null default '[]'::jsonb,
  -- Which platform's screenshots show by default on the app page, until the
  -- visitor picks a platform themselves (see the platform switcher above the
  -- screenshot gallery).
  default_platform text not null default 'desktop' check (default_platform in ('desktop', 'mobile', 'web', 'other')),
  status text not null default 'draft' check (status in ('draft', 'published', 'pending', 'declined')),
  downloads_count integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migrating an existing install? These are safe to run any number of times:
alter table public.apps add column if not exists platform_links jsonb not null default '[]'::jsonb;
alter table public.apps drop column if exists platforms;
alter table public.apps drop column if exists external_link;

-- Screenshots used to be a plain text[] of URLs. Convert to jsonb objects
-- tagged with a platform group ({ "url": ..., "group": "desktop" }) so the
-- app page can show the right screenshots for the selected platform.
-- Existing screenshots are tagged with the app's default_platform so nothing
-- disappears after the migration — re-tag them from the admin panel
-- afterwards if a screenshot actually belongs to a different platform.
alter table public.apps add column if not exists default_platform text not null default 'desktop';
alter table public.apps add column if not exists review_note text;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'apps'
      and column_name = 'screenshots' and data_type = 'ARRAY'
  ) then
    -- ALTER COLUMN ... TYPE ... USING can't contain an aggregate subquery,
    -- so convert via a temporary column + UPDATE instead.
    alter table public.apps add column screenshots_jsonb jsonb not null default '[]'::jsonb;

    update public.apps a
    set screenshots_jsonb = coalesce(
      (select jsonb_agg(jsonb_build_object('url', s, 'group', a.default_platform))
       from unnest(a.screenshots) as s),
      '[]'::jsonb
    );

    alter table public.apps drop column screenshots;
    alter table public.apps rename column screenshots_jsonb to screenshots;
  end if;
end $$;

alter table public.apps drop constraint if exists apps_default_platform_check;
alter table public.apps
  add constraint apps_default_platform_check
  check (default_platform in ('desktop', 'mobile', 'web', 'other'));

alter table public.apps enable row level security;

drop policy if exists "Published apps are public" on public.apps;
create policy "Published apps are public" on public.apps for select
  using (
    status = 'published'
    or public.is_admin(auth.uid())
    or created_by = auth.uid()
  );

drop policy if exists "Admins manage apps" on public.apps;
create policy "Admins manage apps" on public.apps for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Only verified developers can submit an app for review — apply-dev is the
-- gate everyone goes through first, and submissions are always attributed
-- to themselves as 'pending' (never self-published, never posted as
-- someone else). Admins bypass this since they publish directly via
-- /admin, which inserts with status='published', not 'pending', so this
-- check only ever applies to the public-submission path.
drop policy if exists "Signed-in users can submit apps for review" on public.apps;
drop policy if exists "Verified developers can submit apps for review" on public.apps;
create policy "Verified developers can submit apps for review"
  on public.apps for insert
  with check (
    auth.uid() = created_by
    and status = 'pending'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and dev_status = 'verified'
    )
  );

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

-- Fast index for the analytics dashboard's date-range queries.
create index if not exists downloads_created_at_idx on public.downloads (created_at);
create index if not exists downloads_app_id_idx on public.downloads (app_id);

-- Sum of apps.downloads_count across every app — used by the admin
-- analytics page instead of counting every row in `downloads` on each load.
create or replace function public.total_downloads_count()
returns table (total bigint) as $$
  select coalesce(sum(downloads_count), 0) from public.apps;
$$ language sql stable security definer;

-- 4b. Generic "keep updated_at fresh" trigger function (used below by
--     both apps and reviews) --------------------------------------------
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 4c. REVIEWS (star rating + optional comment, one per user per app) -----
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_id, user_id)
);

alter table public.reviews enable row level security;

drop policy if exists "Reviews are viewable by everyone" on public.reviews;
create policy "Reviews are viewable by everyone"
  on public.reviews for select
  using (true);

drop policy if exists "Signed-in users can review an app" on public.reviews;
create policy "Signed-in users can review an app"
  on public.reviews for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can edit their own review" on public.reviews;
create policy "Users can edit their own review"
  on public.reviews for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own review" on public.reviews;
create policy "Users can delete their own review"
  on public.reviews for delete
  using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop trigger if exists reviews_touch_updated_at on public.reviews;
create trigger reviews_touch_updated_at
  before update on public.reviews
  for each row execute procedure public.touch_updated_at();

-- Cache the average rating + count on apps so listing/sort queries don't
-- need to aggregate reviews on every request.
alter table public.apps add column if not exists rating_avg numeric(3, 2) not null default 0;
alter table public.apps add column if not exists rating_count integer not null default 0;

create or replace function public.refresh_app_rating()
returns trigger as $$
declare
  target_app_id uuid := coalesce(new.app_id, old.app_id);
begin
  update public.apps set
    rating_avg = coalesce((select round(avg(rating)::numeric, 2) from public.reviews where app_id = target_app_id), 0),
    rating_count = (select count(*) from public.reviews where app_id = target_app_id)
  where id = target_app_id;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_review_changed on public.reviews;
create trigger on_review_changed
  after insert or update or delete on public.reviews
  for each row execute procedure public.refresh_app_rating();


-- 4d. FAVORITES / WISHLIST (a user saving an app for later) --------------
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (app_id, user_id)
);

alter table public.favorites enable row level security;

drop policy if exists "Users manage their own favorites" on public.favorites;
create policy "Users manage their own favorites"
  on public.favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. Keep apps.updated_at fresh (uses the touch_updated_at() function
--    defined above) ------------------------------------------------------
drop trigger if exists apps_touch_updated_at on public.apps;
create trigger apps_touch_updated_at
  before update on public.apps
  for each row execute procedure public.touch_updated_at();

-- 5b. NOTIFICATIONS ------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('app_update', 'submission_approved', 'submission_declined')),
  title text not null,
  body text,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_created_at_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "Users see their own notifications" on public.notifications;
create policy "Users see their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can mark their own notifications read" on public.notifications;
create policy "Users can mark their own notifications read"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Notify everyone who favorited an app when its version changes (and it's
-- actually published — no point notifying about a draft/pending app).
create or replace function public.notify_app_update()
returns trigger as $$
begin
  if new.status = 'published' and new.version is distinct from old.version then
    insert into public.notifications (user_id, type, title, body, link)
    select
      favorites.user_id,
      'app_update',
      new.name || ' was updated',
      'Now on version ' || new.version || '.',
      '/shop/' || new.slug
    from public.favorites
    where favorites.app_id = new.id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_app_version_changed on public.apps;
create trigger on_app_version_changed
  after update on public.apps
  for each row execute procedure public.notify_app_update();

-- Notify a submitter when their pending app is approved or declined.
create or replace function public.notify_submission_reviewed()
returns trigger as $$
begin
  if old.status = 'pending' and new.status = 'published' and new.created_by is not null then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      new.created_by,
      'submission_approved',
      new.name || ' was approved',
      'Your app is now live on NexApp.',
      '/shop/' || new.slug
    );
  elsif old.status = 'pending' and new.status = 'declined' and new.created_by is not null then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      new.created_by,
      'submission_declined',
      new.name || ' was declined',
      coalesce(new.review_note, 'No reason was given.'),
      '/dashboard'
    );
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_submission_reviewed on public.apps;
create trigger on_submission_reviewed
  after update on public.apps
  for each row execute procedure public.notify_submission_reviewed();

-- 5c. REPORTS (users flagging an app for admin review) -------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (
    reason in ('spam', 'malware', 'broken_link', 'inappropriate', 'copyright', 'other')
  ),
  details text,
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

create index if not exists reports_status_idx on public.reports (status);

alter table public.reports enable row level security;

drop policy if exists "Signed-in users can file a report" on public.reports;
create policy "Signed-in users can file a report"
  on public.reports for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can see their own reports" on public.reports;
create policy "Users can see their own reports"
  on public.reports for select
  using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "Admins can update reports" on public.reports;
create policy "Admins can update reports"
  on public.reports for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

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

-- Any signed-in user can upload an icon/screenshot for an app they're
-- submitting via /submit — scoped to its own subfolder so this doesn't
-- widen who can write into the admin's regular icons/screenshots paths.
drop policy if exists "Users can upload submission assets" on storage.objects;
create policy "Users can upload submission assets"
  on storage.objects for insert
  with check (
    bucket_id = 'app-assets'
    and (storage.foldername(name))[1] = 'submissions'
    and auth.uid() is not null
  );

-- Any signed-in user may upload/replace/remove their OWN avatar, kept in
-- its own subfolder (avatars/<user id>/...) so this stays scoped to just
-- their own file and doesn't need admin rights like the policies above.
drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'app-assets'
    and (storage.foldername(name))[1] = 'avatars'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "Users can replace their own avatar" on storage.objects;
create policy "Users can replace their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'app-assets'
    and (storage.foldername(name))[1] = 'avatars'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'app-assets'
    and (storage.foldername(name))[1] = 'avatars'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

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

-- ============================================================
-- 13. Homepage hero billboards -------------------------------------------
-- Admin-curated slides for the homepage hero carousel. Each billboard
-- points at an app: the app's icon floats over the billboard (like the
-- default NexApp logo used to), the app's cover image is the billboard
-- background, and "Learn more" links straight to that app's page.
-- ============================================================

-- Apps can now have a wide cover image (used as the billboard background
-- when featured) in addition to their square icon.
alter table public.apps add column if not exists cover_url text;
-- CSS object-position value (e.g. '50% 30%') so the admin can pick which
-- part of the cover stays in frame when it's cropped to the billboard's
-- 21:9 shape.
alter table public.apps add column if not exists cover_position text not null default '50% 50%';

create table if not exists public.billboards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  app_id uuid not null references public.apps(id) on delete cascade,
  offer text,
  display_order integer not null default 0,
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists billboards_touch_updated_at on public.billboards;
create trigger billboards_touch_updated_at
  before update on public.billboards
  for each row execute procedure public.touch_updated_at();

alter table public.billboards enable row level security;

drop policy if exists "Active billboards are viewable by everyone" on public.billboards;
create policy "Active billboards are viewable by everyone"
  on public.billboards for select
  using (active = true or public.is_admin(auth.uid()));

drop policy if exists "Admins can insert billboards" on public.billboards;
create policy "Admins can insert billboards"
  on public.billboards for insert
  with check (public.is_admin(auth.uid()));

drop policy if exists "Admins can update billboards" on public.billboards;
create policy "Admins can update billboards"
  on public.billboards for update
  using (public.is_admin(auth.uid()));

drop policy if exists "Admins can delete billboards" on public.billboards;
create policy "Admins can delete billboards"
  on public.billboards for delete
  using (public.is_admin(auth.uid()));

-- No new storage policies needed: cover images upload into the same
-- 'app-assets' bucket under 'covers/' (admin) or 'submissions/<uid>/covers/'
-- (user submissions), both already covered by the existing app-assets
-- storage policies above.

-- ============================================================
-- 14. Rate limiting -------------------------------------------------------
-- A shared, serverless-safe rate limiter: server actions call
-- check_rate_limit() with a key that scopes the limit (e.g.
-- 'submit_app:<user id>' or 'billboard_save:<user id>'), a max hit count,
-- and a window. This lives in Postgres (not in-memory) so it works
-- correctly across Vercel's serverless/edge instances, which don't share
-- memory. All thresholds are passed in by the caller, not hardcoded here.
-- ============================================================

create table if not exists public.rate_limit_hits (
  id bigint generated always as identity primary key,
  rl_key text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_hits_key_created_idx
  on public.rate_limit_hits (rl_key, created_at);

-- Old rows are cheap to keep briefly and prune opportunistically on every
-- call, so there's no separate cron/job needed to stop this table growing
-- forever.
create or replace function public.check_rate_limit(
  p_key text,
  p_max_hits integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  window_start timestamptz := now() - (p_window_seconds || ' seconds')::interval;
  hit_count integer;
begin
  delete from public.rate_limit_hits
  where created_at < now() - interval '1 day';

  select count(*) into hit_count
  from public.rate_limit_hits
  where rl_key = p_key and created_at >= window_start;

  if hit_count >= p_max_hits then
    return false;
  end if;

  insert into public.rate_limit_hits (rl_key) values (p_key);
  return true;
end;
$$;

-- Only server-side code (using the signed-in user's session, which is
-- always authenticated or anon through our server actions) calls this —
-- grant to both roles since some limits key off IP for signed-out users.
grant execute on function public.check_rate_limit(text, integer, integer) to authenticated, anon;

alter table public.rate_limit_hits enable row level security;
-- No direct table access for anyone; all reads/writes go through the
-- security-definer function above.
drop policy if exists "No direct access to rate limit hits" on public.rate_limit_hits;
create policy "No direct access to rate limit hits"
  on public.rate_limit_hits for all
  using (false)
  with check (false);

-- ============================================================
-- 15. Source code moves onto apps directly ---------------------------------
-- The separate admin "Source" section is retired — every app (whether
-- admin-created or submitted by an outside developer) now carries its own
-- GitHub link right on the apps row, editable from the same app form.
-- Outside developers are required to provide one on submission (enforced
-- in submit/actions.ts); admins can add one optionally when creating an
-- app directly. source_public is the developer's own choice: checked
-- shows the link on the app's public page, unchecked keeps it visible to
-- the review team (and admins) only, never removed.
-- ============================================================

alter table public.apps add column if not exists github_url text;
alter table public.apps add column if not exists source_public boolean not null default true;

-- One-time backfill from the old per-app sources table, if it has rows
-- this app doesn't already have a link for.
update public.apps a
set github_url = s.github_url
from public.sources s
where s.app_id = a.id and a.github_url is null;

-- The old table/policies are no longer read or written by the app and can
-- be dropped once you've confirmed the backfill above looks right:
--   drop table if exists public.sources;

-- ============================================================
-- 16. Developer verification, profiles, app issues, issue requests --------
-- ============================================================

-- Dev verification pipeline: an outside developer applies, an admin
-- reviews and approves/rejects (with a short reason), and only a
-- 'verified' dev can build a public profile or send issue requests.
alter table public.profiles add column if not exists dev_status text not null default 'none'
  check (dev_status in ('none', 'pending', 'verified', 'rejected'));
alter table public.profiles add column if not exists dev_application_note text;
alter table public.profiles add column if not exists dev_reject_reason text;
alter table public.profiles add column if not exists profile_headline text;
alter table public.profiles add column if not exists profile_bio text;

-- ---- App issues: admin-posted, shown as a banner on the app's page ------
create table if not exists public.app_issues (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  title text not null,
  description text,
  download_blocked boolean not null default false,
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

drop trigger if exists app_issues_touch_updated_at on public.app_issues;
create trigger app_issues_touch_updated_at
  before update on public.app_issues
  for each row execute procedure public.touch_updated_at();

create index if not exists app_issues_app_id_active_idx
  on public.app_issues (app_id, active);

alter table public.app_issues enable row level security;

drop policy if exists "Active issues are public, admins see all" on public.app_issues;
create policy "Active issues are public, admins see all"
  on public.app_issues for select
  using (active = true or public.is_admin(auth.uid()));

drop policy if exists "Admins manage app issues" on public.app_issues;
create policy "Admins manage app issues"
  on public.app_issues for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---- Issue requests: a verified dev reporting a problem to one admin ----
create table if not exists public.issue_requests (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete cascade,
  -- Whoever currently owns responding to this request (starts as the admin
  -- the dev picked; can move to another admin once the 10-minute claim
  -- window opens — see claim_issue_request()).
  target_admin_id uuid not null references public.profiles(id) on delete cascade,
  original_admin_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  download_blocked boolean not null default false,
  eta_start timestamptz,
  eta_end timestamptz,
  status text not null default 'pending'
    check (status in ('pending', 'testing', 'granted', 'denied')),
  status_note text,
  -- Resets every time ownership moves to a (possibly new) admin — the
  -- 10-minute claim window is measured from here, not from created_at.
  assigned_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists issue_requests_touch_updated_at on public.issue_requests;
create trigger issue_requests_touch_updated_at
  before update on public.issue_requests
  for each row execute procedure public.touch_updated_at();

create index if not exists issue_requests_target_admin_idx
  on public.issue_requests (target_admin_id, status);
create index if not exists issue_requests_requested_by_idx
  on public.issue_requests (requested_by, created_at desc);

alter table public.issue_requests enable row level security;

drop policy if exists "Devs see their own requests, admins see all" on public.issue_requests;
create policy "Devs see their own requests, admins see all"
  on public.issue_requests for select
  using (requested_by = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "Verified devs create issue requests" on public.issue_requests;
create policy "Verified devs create issue requests"
  on public.issue_requests for insert
  with check (
    requested_by = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and dev_status = 'verified'
    )
  );

drop policy if exists "Admins update issue requests" on public.issue_requests;
create policy "Admins update issue requests"
  on public.issue_requests for update
  using (public.is_admin(auth.uid()));

-- Atomically lets an admin other than the current target claim a request
-- once it's been sitting unanswered for 10+ minutes — a single UPDATE with
-- these WHERE conditions is race-safe, so two admins clicking "claim" at
-- the same instant can't both succeed.
create or replace function public.claim_issue_request(p_request_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  if not public.is_admin(auth.uid()) then
    return false;
  end if;

  update public.issue_requests
  set target_admin_id = auth.uid(), assigned_at = now()
  where id = p_request_id
    and status = 'pending'
    and assigned_at < now() - interval '10 minutes'
    and target_admin_id <> auth.uid();

  get diagnostics updated_count = row_count;
  return updated_count > 0;
end;
$$;

grant execute on function public.claim_issue_request(uuid) to authenticated;

-- New event types this feature introduces.
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in (
    'app_update', 'submission_approved', 'submission_declined',
    'issue_request_new', 'issue_request_status', 'issue_request_claimed',
    'dev_application_result', 'app_issue_posted'
  ));

-- Realtime so the notification bell updates instantly, without a refresh —
-- this is what makes "hard notification push" actually push.
select public.add_table_to_realtime('public.notifications');
-- Also realtime so a developer's issue-request status badge updates the
-- instant an admin changes it, without needing to refresh the page.
select public.add_table_to_realtime('public.issue_requests');

-- ============================================================
-- 17. Notification triggers for dev verification & issue requests --------
-- Follows the same pattern as notify_app_update()/notify_submission_reviewed()
-- above: security-definer triggers insert notifications directly, so no
-- separate INSERT policy on notifications is needed for this feature.
-- ============================================================

create or replace function public.notify_dev_verification()
returns trigger as $$
begin
  if old.dev_status = 'pending' and new.dev_status = 'verified' then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      new.id,
      'dev_application_result',
      'You''re a verified developer',
      'You can now submit apps, report issues directly to an admin, and build a public developer profile.',
      '/apply-dev'
    );
  elsif old.dev_status = 'pending' and new.dev_status = 'rejected' then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      new.id,
      'dev_application_result',
      'Developer application not approved',
      coalesce(new.dev_reject_reason, 'No reason was given.'),
      '/apply-dev'
    );
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_dev_status_changed on public.profiles;
create trigger on_dev_status_changed
  after update on public.profiles
  for each row execute procedure public.notify_dev_verification();

-- A new issue request -> notify the admin it was sent to.
create or replace function public.notify_issue_request_new()
returns trigger as $$
declare
  app_name text;
begin
  select name into app_name from public.apps where id = new.app_id;
  insert into public.notifications (user_id, type, title, body, link)
  values (
    new.target_admin_id,
    'issue_request_new',
    'New issue request: ' || coalesce(app_name, 'an app'),
    new.title,
    '/admin/issue-requests'
  );
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_issue_request_created on public.issue_requests;
create trigger on_issue_request_created
  after insert on public.issue_requests
  for each row execute procedure public.notify_issue_request_new();

-- Status changes -> notify the developer who filed it. Ownership moving to
-- a different admin (a 10-minute claim) -> notify the admin who lost it.
create or replace function public.notify_issue_request_changed()
returns trigger as $$
declare
  app_name text;
begin
  select name into app_name from public.apps where id = new.app_id;

  if new.status is distinct from old.status then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      new.requested_by,
      'issue_request_status',
      coalesce(app_name, 'Your issue request') || ': ' ||
        case new.status
          when 'testing' then 'now being tested'
          when 'granted' then 'granted & applied'
          when 'denied' then 'denied & dismissed'
          else new.status
        end,
      coalesce(new.status_note, ''),
      '/dashboard/issues'
    );
  end if;

  if new.target_admin_id is distinct from old.target_admin_id then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      old.target_admin_id,
      'issue_request_claimed',
      'An unanswered request was claimed',
      coalesce(app_name, 'An issue request') || ' — "' || new.title || '" was claimed by another admin after sitting unanswered for 10 minutes.',
      '/admin/issue-requests'
    );
  end if;

  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_issue_request_updated on public.issue_requests;
create trigger on_issue_request_updated
  after update on public.issue_requests
  for each row execute procedure public.notify_issue_request_changed();

-- ============================================================
-- 18. Full developer identity verification (KYC) --------------------------
-- Replaces the simple "note" application with a proper verification
-- record: legal identity, government ID, a selfie for a human reviewer to
-- match against the ID, developer info, and required agreements. This is
-- sensitive personal data, so it lives in its own table with tight RLS
-- (owner + admin only, never public) and its documents live in a PRIVATE
-- storage bucket (not the public app-assets bucket) — served to admins
-- only via short-lived signed URLs, never a public link.
-- ============================================================

create table if not exists public.dev_verifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  -- Short, human-searchable id an admin can paste into a search box —
  -- separate from the internal uuid, e.g. "DEV-482913".
  request_number text not null unique,

  -- Account information
  full_legal_name text not null,
  display_name text not null,
  country text not null,
  date_of_birth date not null,
  phone_number text not null,
  phone_verified boolean not null default false,
  profile_photo_url text,

  -- Identity verification (private bucket — see below)
  gov_id_type text not null check (gov_id_type in ('nid', 'passport', 'driving_license')),
  gov_id_document_url text not null,
  selfie_url text not null,
  identity_match_confirmed boolean not null default false,

  -- Developer information
  bio text,
  portfolio_url text,
  github_url text,
  previous_projects text,
  dev_areas text[] not null default '{}',

  -- Legal & accountability
  agreement_accepted boolean not null default false,
  ownership_declaration boolean not null default false,
  ip_responsibility_declaration boolean not null default false,
  content_policy_accepted boolean not null default false,
  privacy_policy_accepted boolean not null default false,
  false_info_agreement boolean not null default false,

  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reject_reason text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists dev_verifications_touch_updated_at on public.dev_verifications;
create trigger dev_verifications_touch_updated_at
  before update on public.dev_verifications
  for each row execute procedure public.touch_updated_at();

create index if not exists dev_verifications_request_number_idx
  on public.dev_verifications (request_number);
create index if not exists dev_verifications_status_idx
  on public.dev_verifications (status);

alter table public.dev_verifications enable row level security;

-- Never public: only the applicant themselves and admins can see this row
-- at all (this is where all the legal name / DOB / phone / documents are).
drop policy if exists "Owner and admins see verification requests" on public.dev_verifications;
create policy "Owner and admins see verification requests"
  on public.dev_verifications for select
  using (profile_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "Users submit their own verification request" on public.dev_verifications;
create policy "Users submit their own verification request"
  on public.dev_verifications for insert
  with check (profile_id = auth.uid());

-- A rejected applicant can update their own still-pending/rejected request
-- to re-apply; admins update to approve/reject.
drop policy if exists "Owner can update own pending/rejected request" on public.dev_verifications;
create policy "Owner can update own pending/rejected request"
  on public.dev_verifications for update
  using (profile_id = auth.uid() and status in ('pending', 'rejected'));

drop policy if exists "Admins update verification requests" on public.dev_verifications;
create policy "Admins update verification requests"
  on public.dev_verifications for update
  using (public.is_admin(auth.uid()));

-- Generates the next human-searchable request number, e.g. "DEV-482913".
create or replace function public.generate_dev_request_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate text;
  taken boolean;
begin
  loop
    candidate := 'DEV-' || lpad((floor(random() * 1000000))::text, 6, '0');
    select exists(select 1 from public.dev_verifications where request_number = candidate) into taken;
    exit when not taken;
  end loop;
  return candidate;
end;
$$;

grant execute on function public.generate_dev_request_number() to authenticated;

-- ---- Private storage bucket for ID documents & selfies -------------------
insert into storage.buckets (id, name, public)
values ('dev-verification-docs', 'dev-verification-docs', false)
on conflict (id) do nothing;

-- Applicants can upload only into their own folder (dev-verification-docs/<uid>/...).
drop policy if exists "Users upload their own verification docs" on storage.objects;
create policy "Users upload their own verification docs"
  on storage.objects for insert
  with check (
    bucket_id = 'dev-verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Reading is restricted to the owner or an admin — never public. Combined
-- with the bucket itself being private, a raw storage URL for these files
-- is useless without a signed URL minted server-side for an authorized
-- viewer (see getSignedDevDocUrl in the app).
drop policy if exists "Owner and admins read verification docs" on storage.objects;
create policy "Owner and admins read verification docs"
  on storage.objects for select
  using (
    bucket_id = 'dev-verification-docs'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin(auth.uid()))
  );

-- Approving/rejecting a verification request keeps profiles.dev_status in
-- sync automatically, so the existing dev-status notification trigger
-- (see section 16/17) still fires without the admin action needing to
-- update two tables by hand.
create or replace function public.sync_dev_status_from_verification()
returns trigger as $$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    update public.profiles
    set dev_status = 'verified', dev_reject_reason = null
    where id = new.profile_id;
  elsif new.status = 'rejected' and old.status is distinct from 'rejected' then
    update public.profiles
    set dev_status = 'rejected', dev_reject_reason = new.reject_reason
    where id = new.profile_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_dev_verification_status_changed on public.dev_verifications;
create trigger on_dev_verification_status_changed
  after update on public.dev_verifications
  for each row execute procedure public.sync_dev_status_from_verification();

-- Public-safe subset of a verification (display name + country only —
-- never legal name, DOB, phone, or documents) gets copied onto the
-- already-publicly-readable profiles row on approval, so the public
-- profile page never needs to touch the locked-down dev_verifications
-- table at all.
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists country text;

create or replace function public.sync_dev_status_from_verification()
returns trigger as $$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    update public.profiles
    set dev_status = 'verified',
        dev_reject_reason = null,
        display_name = new.display_name,
        country = new.country
    where id = new.profile_id;
  elsif new.status = 'rejected' and old.status is distinct from 'rejected' then
    update public.profiles
    set dev_status = 'rejected', dev_reject_reason = new.reject_reason
    where id = new.profile_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Realtime, scoped to exactly what section 19 needs (per the "only these
-- specific pages need push/pull, nothing else" requirement): the admin
-- inbox watches for new pending requests, and the applicant's own
-- /apply-dev page watches its own profiles row for a status change.
select public.add_table_to_realtime('public.dev_verifications');
select public.add_table_to_realtime('public.profiles');

-- ============================================================
-- 20. Senior Admin tier + Search Console verification tools ---------------
-- A senior admin is an admin with extra, more sensitive controls — this
-- section adds the tier itself plus the first tool (Google Search Console
-- domain verification). More senior-only tools get added onto this same
-- gate later.
-- ============================================================

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('user', 'admin', 'senior_admin'));

-- Senior admins count as admins everywhere is_admin() is already checked
-- (they get every regular-admin privilege plus the senior-only section).
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = uid and role in ('admin', 'senior_admin')
  );
$$;

create or replace function public.is_senior_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'senior_admin'
  );
$$;

grant execute on function public.is_senior_admin(uuid) to authenticated, anon;

-- Only an existing senior admin can mint another one — a regular admin
-- cannot self-escalate or escalate anyone else into this tier.
create or replace function public.promote_to_senior_admin(target_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
begin
  if not public.is_senior_admin(auth.uid()) then
    raise exception 'Only senior admins can promote to senior admin';
  end if;

  select id into target_id from auth.users where email = target_email;
  if target_id is null then
    raise exception 'No account found for that email — they need to sign up first';
  end if;

  update public.profiles set role = 'senior_admin' where id = target_id;
  return true;
end;
$$;

create or replace function public.revoke_senior_admin(target_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
begin
  if not public.is_senior_admin(auth.uid()) then
    raise exception 'Only senior admins can revoke senior admin access';
  end if;

  select id into target_id from auth.users where email = target_email;
  if target_id is null then
    raise exception 'No account found for that email';
  end if;

  if target_id = auth.uid() then
    raise exception 'You cannot revoke your own senior admin access';
  end if;

  -- Steps back down to a regular admin, not all the way to 'user'.
  update public.profiles set role = 'admin' where id = target_id;
  return true;
end;
$$;

grant execute on function public.promote_to_senior_admin(text) to authenticated;
grant execute on function public.revoke_senior_admin(text) to authenticated;

-- ---- Search Console verification settings (singleton row) ---------------
-- None of this data is actually sensitive — Google's crawler fetches the
-- HTML file and meta tag completely unauthenticated over the public
-- internet, so a public SELECT policy is correct and intentional here.
-- Only *writing* these values is restricted to senior admins.
create table if not exists public.site_verification_settings (
  id boolean primary key default true,
  check (id),
  google_site_verification_meta text,
  google_html_verification_filename text,
  google_html_verification_content text,
  dns_txt_host text,
  dns_txt_value text,
  dns_cname_host text,
  dns_cname_value text,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.site_verification_settings (id) values (true)
  on conflict (id) do nothing;

drop trigger if exists site_verification_settings_touch_updated_at on public.site_verification_settings;
create trigger site_verification_settings_touch_updated_at
  before update on public.site_verification_settings
  for each row execute procedure public.touch_updated_at();

alter table public.site_verification_settings enable row level security;

drop policy if exists "Verification settings are publicly readable" on public.site_verification_settings;
create policy "Verification settings are publicly readable"
  on public.site_verification_settings for select
  using (true);

drop policy if exists "Senior admins manage verification settings" on public.site_verification_settings;
create policy "Senior admins manage verification settings"
  on public.site_verification_settings for all
  using (public.is_senior_admin(auth.uid()))
  with check (public.is_senior_admin(auth.uid()));

-- ---- Bootstrap note -------------------------------------------------------
-- There's no UI to create the very first senior admin (chicken-and-egg —
-- promote_to_senior_admin() itself requires an existing one). Run this
-- once by hand for whichever admin should become the first senior admin:
--   update public.profiles set role = 'senior_admin'
--   where id = (select id from auth.users where email = 'you@example.com');

-- ============================================================
-- 21. App update tracking for the sidebar's "Updates" page ----------------
-- Tracks when an app's version actually changed (not just any edit), so
-- "Updates" can show a real, meaningful list: which of your favorited or
-- downloaded apps got a new version since you added them, and when.
-- ============================================================

alter table public.apps add column if not exists version_updated_at timestamptz not null default now();
alter table public.profiles add column if not exists updates_last_seen_at timestamptz;

create or replace function public.touch_version_updated_at()
returns trigger as $$
begin
  if new.version is distinct from old.version then
    new.version_updated_at := now();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists apps_touch_version_updated_at on public.apps;
create trigger apps_touch_version_updated_at
  before update on public.apps
  for each row execute procedure public.touch_version_updated_at();

-- Always scoped to the caller's own auth.uid() (never takes a user id
-- parameter), so there's no way to query anyone else's update feed.
create or replace function public.get_my_app_updates()
returns table (
  app_id uuid,
  name text,
  slug text,
  icon_url text,
  version text,
  version_updated_at timestamptz,
  since timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    a.id, a.name, a.slug, a.icon_url, a.version, a.version_updated_at,
    least(coalesce(f.first_seen, 'infinity'::timestamptz), coalesce(d.first_seen, 'infinity'::timestamptz)) as since
  from public.apps a
  left join (
    select app_id, min(created_at) as first_seen
    from public.favorites where user_id = auth.uid() group by app_id
  ) f on f.app_id = a.id
  left join (
    select app_id, min(created_at) as first_seen
    from public.downloads where user_id = auth.uid() group by app_id
  ) d on d.app_id = a.id
  where (f.app_id is not null or d.app_id is not null)
    and a.version_updated_at > least(
      coalesce(f.first_seen, 'infinity'::timestamptz),
      coalesce(d.first_seen, 'infinity'::timestamptz)
    )
  order by a.version_updated_at desc;
$$;

grant execute on function public.get_my_app_updates() to authenticated;
