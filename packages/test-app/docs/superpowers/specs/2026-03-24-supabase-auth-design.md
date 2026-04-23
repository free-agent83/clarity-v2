# Supabase Authentication — Design Spec

## Overview

Add email/password authentication to Minivoda using Supabase Auth and `@supabase/ssr`. All application routes move under `/buyer/*` and require authentication. A public marketing placeholder lives at `/` and the login form at `/login`. Users are created manually in the Supabase dashboard; the app auto-creates a matching `public.users` row on first login.

## Decisions

- **Auth method:** Email + password. No signup flow — users are provisioned manually in Supabase's backend.
- **Approach:** `@supabase/ssr` with Next.js middleware. Server-side session validation on every protected request. No client-only auth guards.
- **User provisioning:** Auto-create `public.users` row on first login (not in middleware — only at login time).
- **Authorization model:** Binary. Logged in = full access. No roles or permissions.
- **Database auth:** Application-layer enforcement via middleware + `getCurrentUser()`. Drizzle queries use `DATABASE_URL` directly — no Supabase RLS.

## New Dependency

- `@supabase/ssr` — Supabase's official Next.js integration for cookie-based session management. `@supabase/supabase-js` remains as a dependency (it's a peer dependency of `@supabase/ssr`).

## Route Restructure

### Before

All routes live at the root of `app/`:

```
/                         → Home (authenticated landing)
/browse/*                 → Product listings & details
/orders/*                 → Orders
/settings, /admin, etc.   → Other pages
/ui-kitchen-sink          → Component showcase
```

### After

Three zones with distinct auth and layout behavior:

| Zone      | Routes      | Auth     | Layout                              |
| --------- | ----------- | -------- | ----------------------------------- |
| Marketing | `/`         | Public   | Minimal (no app shell)              |
| Login     | `/login`    | Public   | Minimal (no app shell)              |
| App       | `/buyer/*`  | Protected| `LayoutBase` (header, nav, footer)  |

Every current route moves under `/buyer/`:

```
/browse/natural-diamonds   → /buyer/browse/natural-diamonds
/orders                    → /buyer/orders
/settings                  → /buyer/settings
/ui-kitchen-sink           → /buyer/ui-kitchen-sink
/ (home)                   → /buyer/ (authenticated landing)
```

### Layout Changes

- **`app/layout.tsx` (root):** Bare shell — fonts, `ThemeProvider`, `<html>`/`<body>`. No header, nav, or footer.
- **`app/buyer/layout.tsx` (new):** Wraps children in `LayoutBase` (header, nav, footer). All authenticated UI lives here.
- **`app/login/page.tsx` (new):** Standalone login page. Own minimal layout — no app shell.
- **`app/page.tsx` (new):** Marketing placeholder. Minivoda branding + "Sign in" link to `/login`.

## Supabase Client Factories

Three modules under `lib/supabase/`:

### `lib/supabase/client.ts` — Browser Client

- Uses `createBrowserClient` from `@supabase/ssr`.
- Used in Client Components (login form, sign-out button).
- Singleton per browser tab.

### `lib/supabase/server.ts` — Server Client

- Uses `createServerClient` from `@supabase/ssr` with Next.js `cookies()`.
- Used in Server Components and Server Actions.
- Created fresh per request (not a singleton).

### `lib/supabase/middleware.ts` — Middleware Client

- Same as server client but operates on `NextRequest`/`NextResponse`.
- Handles token refresh by writing updated cookies to the response.

### Replaces `db/supabase.ts`

The existing `db/supabase.ts` (plain `@supabase/supabase-js` client with no cookie handling) is removed. Verify no other files import from `db/supabase` before deleting. The new factories supersede it entirely.

## Middleware

**File:** `middleware.ts` at the project root.

**Responsibilities:**

1. **Refresh session** — calls `supabase.auth.getUser()` to validate the JWT and refresh expired tokens by updating cookies on the response.
2. **Redirect unauthenticated users** — if `getUser()` returns no user and the request is for a `/buyer/*` route, redirect to `/login`.

**Route matching:** Middleware runs only on `/buyer/*` routes via a positive matcher:

```ts
export const config = { matcher: ["/buyer/:path*"] }
```

This implicitly excludes static assets, `_next/*`, and all public routes. Marketing page and login page are fully public.

**Return URL:** When redirecting to `/login`, the original URL is preserved as a `?next=` query parameter so the user is returned to their intended destination after login.

**Token lifecycle:** Supabase issues a 1-hour access token and a longer-lived refresh token. Middleware transparently refreshes the access token. If the refresh token itself expires (prolonged inactivity), the user is redirected to `/login`.

## Login Page

**Route:** `/login`

**Layout:** Standalone — no header, nav, or footer. Centered card on a clean background with Minivoda branding.

**Components:**

- Email input
- Password input
- "Sign in" button (loading state while request is in flight)
- Inline error message area

**Behavior:**

The login form submits to a **Server Action** that handles the entire flow atomically:

1. User submits email + password.
2. Server Action creates a Supabase server client and calls `supabase.auth.signInWithPassword({ email, password })`.
3. On failure → return the error message. The client form displays it inline. Inputs remain enabled.
4. On success → run the auto-create user logic (Section below) within the same Server Action → redirect to `/buyer/` (or the `?next=` URL if present).

Using a Server Action (rather than calling `signInWithPassword` from the browser client then separately calling a Server Action for auto-create) ensures the entire login + provisioning flow completes before the redirect fires. No race condition.

**Styling:** Matches existing design language — same fonts, colors, dark mode support.

## Auto-Create User Row

Runs server-side after successful login, before redirecting to `/buyer/`.

**Logic:**

1. Get authenticated user via `supabase.auth.getUser()` → yields `id` (auth UUID) and `email`.
2. Query `public.users` where `authUserId` matches the auth UUID.
3. If row exists → done, proceed to redirect.
4. If no row exists → insert:
   - `authUserId` → auth user's UUID
   - `email` → from auth profile
   - `name` → from auth metadata, falling back to email prefix
   - `companyName` → random plausible jewellery business name (e.g., "Diamond & Co.", "Prestige Gems Ltd.")
   - `phone` → random phone number string
   - `currencyId` → look up the `currencies` row where `value = 'USD'` and use its `id`

**Why not in middleware:** Running a database query on every request would be wasteful. This check only needs to happen once at login time.

## `getCurrentUser()` Helper

**File:** `lib/api/users.ts` (extends existing module).

**Purpose:** Single source of truth for resolving the authenticated Supabase user to the application's `public.users` row.

**Logic:**

1. Create a Supabase server client.
2. Call `getUser()` to get the auth UUID.
3. Query `public.users` where `authUserId` matches.
4. If no auth session exists → call `redirect("/login")`. This shouldn't normally happen (middleware already guards `/buyer/*`), but serves as a safety net.
5. If auth session is valid but no matching `public.users` row exists → this indicates a data integrity issue (auto-create failed or the row was manually deleted). Throw an error rather than silently redirecting to login.
6. Otherwise → return the user row.

**Replaces:** The current naive `fetchCurrentUser()` which returns `db.query.users.findFirst()` with no filtering.

**Usage:** All Server Components and server-side code that need the current user call `getCurrentUser()`.

**Updates to existing code:**

- Home page greeting (currently hardcoded "Nice to see you again, John!") → uses the real user's name.
- Any future page needing user context (orders, cart, shortlists) calls `getCurrentUser()`.

## Sign Out

**Location:** "Sign out" button in the app shell header (`BuyerNav`), alongside existing controls (currency selector, wishlist, cart).

**Component:** A small Client Component (`SignOutButton`) that:

1. On click → opens a confirmation dialog (`AlertDialog` from shadcn/ui) with "Are you sure you want to sign out?" and Cancel / Sign out buttons.
2. On confirm → calls `supabase.auth.signOut()` via the browser client.
3. On completion → hard navigation to `/login` via `window.location.href` (not `router.push`) to ensure a full page reload and clear any in-memory client state.

## Environment Variables

No new environment variables needed. The existing ones suffice:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

For production (Vercel), these same variables point to the managed Supabase instance.

## File Inventory

### New Files

| File | Purpose |
| ---- | ------- |
| `lib/supabase/client.ts` | Browser Supabase client factory |
| `lib/supabase/server.ts` | Server Supabase client factory |
| `lib/supabase/middleware.ts` | Middleware Supabase client factory |
| `middleware.ts` | Next.js middleware — session refresh + route protection |
| `app/login/page.tsx` | Login page |
| `app/page.tsx` | Marketing placeholder (replaces current home page) |
| `app/buyer/layout.tsx` | Authenticated layout wrapping `LayoutBase` |
| `app/buyer/page.tsx` | Authenticated home (moved from current `app/page.tsx`) |
| `components/sign-out-button.tsx` | Sign out with confirmation dialog |

### Modified Files

| File | Change |
| ---- | ------ |
| `app/layout.tsx` | Strip `LayoutBase` — becomes bare shell (fonts, theme only) |
| `lib/api/users.ts` | Replace `fetchCurrentUser()` with auth-aware `getCurrentUser()` |
| `components/shell/buyer-nav.tsx` | Add `SignOutButton` |
| `lib/navigation.ts` | Update all route paths to `/buyer/*` prefix |

### Moved Files

All contents of `app/` (page directories) move to `app/buyer/`.

**Hardcoded route audit:** After moving files, all `href` values and `<Link>` components across the codebase must be audited for the `/buyer/` prefix. Key places to check:

- `lib/navigation.ts` — sidebar route definitions
- `components/shell/buyer-nav.tsx` — logo link (`href="/"` → `/buyer/`)
- All page components with `<Link href="/browse/...">`  or `href="/orders"` etc.
- `app/not-found.tsx` — see note below

A `grep` pass for `href="/"`, `href="/browse`, `href="/orders`, `href="/settings`, `href="/finances`, `href="/shortlists`, and `href="/admin` should catch most instances. Also check for backtick template literals like `` href={`/browse/... `` which static string grep won't find.

### `not-found.tsx` Behavior

After the restructure, `app/not-found.tsx` renders inside the bare root layout (no header/nav/footer). This is appropriate for 404s on public routes (e.g., `/random-path`). For 404s within the authenticated zone, Next.js will use `app/buyer/not-found.tsx` if it exists — create one that inherits `LayoutBase` so authenticated 404s show the app shell.

### Home Page Refactor

The current `app/page.tsx` is a `"use client"` component. When it moves to `app/buyer/page.tsx`, the greeting needs the real user's name from `getCurrentUser()` (server-side). The page will need to be converted to a Server Component, extracting interactive parts (e.g., the hero carousel) into separate Client Components that receive data as props.

### Removed Files

| File | Reason |
| ---- | ------ |
| `db/supabase.ts` | Replaced by `lib/supabase/*.ts` factories |

## What This Design Does NOT Cover

- Signup flow (users are created manually in Supabase dashboard)
- Role-based access control
- Row Level Security in Postgres
- Password reset / forgot password
- Email verification
- OAuth / social login
- Session management UI (active sessions, force logout)
