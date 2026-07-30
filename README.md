# NexApp

A web-based app store — by **NexAuras**. Discover, publish, and download apps
today on the web, with native Android and desktop apps planned next.

Developer credit: **Arabi Islam / MR. ARX**

## Stack

- Next.js 15 (App Router, TypeScript, Turbopack)
- Tailwind CSS 4
- Supabase (Auth, Postgres, Row Level Security, Storage)
- Framer Motion (animations, page transitions)
- lucide-react icons

## Features

**Public**
- Home page with an animated two-column hero and a "Popular right now" grid
- Shop — browse/search the catalog, filter by category
- App detail page — screenshots (click to open a lightbox with prev/next
  navigation), a Download button that opens a platform picker (Desktop:
  Windows/Linux/macOS, Mobile: APK, or any custom platform an admin adds) and
  logs each download, plus a "View Source" link if a GitHub repo is linked
- Source — a public listing of apps that have a linked GitHub repository
- My Downloads — the signed-in user's personal download history

**Auth**
- Google sign-in only (via Supabase Auth)
- Reactive navbar (avatar + name dropdown) that updates instantly on
  login/logout without a page reload

**Admin panel** (role-gated, `/admin`)
- **Apps** — create/edit/publish/unpublish/delete listings; upload an icon
  and screenshots directly (PNG/JPEG, stored in Supabase Storage); add any
  number of custom platforms, each with its own download link
- **Source** — link a GitHub repository to an app (searchable app picker)
- **Admins** — promote or revoke admin access by email; shows each admin's
  NexID pulled live from the separate NexAurasTM project, if they have one

**UI/UX**
- Dark/light theme toggle (persisted, flash-free on load)
- Glassmorphism throughout (blurred translucent surfaces, gradient borders)
- Sora (display) / Inter (body) / JetBrains Mono (data) type system
- Toast notifications for save/download/admin actions
- Animated page transitions and a footer credit that types "Developed by
  Arabi Islam", deletes it, then types "MR. ARX" on a loop
  (`src/components/TypewriterCredit.tsx`)

## Setup

1. **Create a Supabase project** at https://supabase.com.

2. **Run the schema.** In the Supabase SQL Editor, paste and run the full
   contents of `supabase/schema.sql`. This creates every table, RLS policy,
   trigger, and helper function (including `is_admin()`, `promote_to_admin()`,
   `revoke_admin()`, `list_admins()`), plus the `app-assets` storage bucket
   used for icon/screenshot uploads.

3. **Enable Google auth.** Supabase Dashboard → Authentication → Providers →
   Google — add your Google OAuth Client ID/Secret (from Google Cloud
   Console), and add your Supabase callback URL as an authorized redirect URI
   in Google Cloud Console:
   `https://<project-ref>.supabase.co/auth/v1/callback`.
   Then set **Site URL** and **Redirect URLs** under Authentication → URL
   Configuration to include `http://localhost:3000/auth/callback` (and your
   production domain once deployed).

4. **Environment variables.** Copy `.env.local.example` to `.env.local` and
   fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```
   from Supabase → Project Settings → API. If you're using the NexID
   integration with a separate NexAurasTM project, also add:
   ```
   NEXAURAS_SUPABASE_URL=
   NEXAURAS_SERVICE_ROLE_KEY=
   ```
   (server-only — never prefix these with `NEXT_PUBLIC_`).

5. **Install and run.**
   ```bash
   npm install
   npm run dev
   ```

6. **Make yourself an admin.** Sign in once with Google through the app,
   then in the Supabase SQL Editor run:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'you@gmail.com');
   ```
   Refresh the app — an "Admin" link now appears in the account menu. From
   there, Admin → Admins lets you promote further admins by email.

## Project structure

```
src/
  app/
    page.tsx                     Home (hero + featured apps)
    shop/page.tsx                 Browse/search catalog
    shop/[slug]/page.tsx           App detail, screenshots, download, source link
    source/page.tsx               Public GitHub-source listing
    downloads/page.tsx            User's download history ("My Downloads")
    login/, signup/               Google sign-in pages
    admin/                        Role-gated admin panel
      page.tsx, new/, [id]/edit/   Apps CRUD
      source/                      Link GitHub repos to apps
      team/                        Promote/revoke admins, NexID lookup
    auth/callback/route.ts        Supabase OAuth redirect handler
  components/                     Navbar, Footer, AppCard, DownloadButton,
                                   ScreenshotGallery, PlatformLinksEditor,
                                   Toaster, UserMenu, etc.
  lib/supabase/                   Browser / server / middleware Supabase clients
  lib/nexauras.ts                 Server-only NexAurasTM NexID lookup
  lib/types.ts                    Shared TypeScript types
supabase/schema.sql               Full DB schema, RLS policies, functions, storage bucket
```

## Notes

- App files (APKs, installers, etc.) are **not** uploaded to this project —
  each platform on a listing just stores an external download link (Google
  Drive, GitHub Releases, etc.).
- Only app **icons and screenshots** are uploaded directly, via Supabase
  Storage (`app-assets` bucket).
- Colors, blur intensity, and type scale live in `src/app/globals.css`
  (Tailwind v4 `@theme`) — dark and light variants both defined there.
