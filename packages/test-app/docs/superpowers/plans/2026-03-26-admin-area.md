# Admin Area Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full CRUD admin area with Supabase Realtime sync and cross-tab user switching, enabling god-mode users to manage orders, shortlists, invoices, and products for any user in the system.

**Architecture:** Route groups `(shop)` and `(admin)` under `app/buyer/` give independent layouts sharing the same URL prefix. Admin API routes under `/api/v1/admin/` are protected by three-layer auth (API key + Supabase session + god-mode role in `app_metadata`). Supabase Realtime pushes change events to buyer-side hooks that trigger targeted refetches. BroadcastChannel enables cross-tab user impersonation.

**Tech Stack:** Next.js 16 App Router, Drizzle ORM, Supabase (Auth + Realtime), shadcn/ui, Tailwind CSS v4, Tabler Icons

**Note on testing:** This project has no test framework configured. Verification steps use `npm run typecheck`, `npm run build`, and manual browser checks.

**Note on client-side mutations:** Admin modals (Client Components) should use **Server Actions** for create/update/delete operations, not direct `fetch()` calls to API routes. Server Actions inherit the authenticated session context, so no API key or Bearer token is needed on the client. The admin API routes (`/api/v1/admin/*`) exist for external consumers and testing; the admin UI calls `lib/api/admin/` functions via Server Actions. The client-side `fetch()` calls shown in list components (e.g., `refreshData` in `orders-list.tsx`) should also be replaced with Server Actions — create a `refetchAdminOrders` server action alongside the mutation actions. The `process.env.NEXT_PUBLIC_API_KEY` variable is not needed.

---

## File Structure

### Files to move (Task 1)

```
app/buyer/page.tsx            → app/buyer/(shop)/page.tsx
app/buyer/not-found.tsx       → app/buyer/(shop)/not-found.tsx
app/buyer/browse/             → app/buyer/(shop)/browse/
app/buyer/orders/             → app/buyer/(shop)/orders/
app/buyer/shortlists/         → app/buyer/(shop)/shortlists/
app/buyer/finances/           → app/buyer/(shop)/finances/
app/buyer/settings/           → app/buyer/(shop)/settings/
app/buyer/ui-kitchen-sink/    → app/buyer/(shop)/ui-kitchen-sink/
app/buyer/admin/              → DELETE (replaced by (admin) route group)
```

### Files to modify

```
app/buyer/layout.tsx          — Slim down to session-only wrapper
lib/navigation.ts             — Add target="_blank" hint to admin link
components/shell/nav-sheet.tsx — Apply target="_blank" on admin link
supabase/seed.sql             — Add admin auth user + public user
CLAUDE.md                     — Update route structure docs
docs/api/README.md            — Add admin API endpoints
```

### New files to create

```
# Route group layouts
app/buyer/(shop)/layout.tsx
app/buyer/(admin)/admin/layout.tsx
app/buyer/(admin)/admin/page.tsx
app/buyer/(admin)/admin/orders/page.tsx
app/buyer/(admin)/admin/shortlists/page.tsx
app/buyer/(admin)/admin/invoices/page.tsx
app/buyer/(admin)/admin/products/page.tsx

# Admin auth
lib/api/admin/auth.ts

# Admin data layer
lib/api/admin/lookups.ts
lib/api/admin/users.ts
lib/api/admin/orders.ts
lib/api/admin/shortlists.ts
lib/api/admin/invoices.ts
lib/api/admin/products.ts

# Admin API routes
app/api/v1/admin/orders/route.ts
app/api/v1/admin/orders/[id]/route.ts
app/api/v1/admin/shortlists/route.ts
app/api/v1/admin/shortlists/[id]/route.ts
app/api/v1/admin/invoices/route.ts
app/api/v1/admin/invoices/[id]/route.ts
app/api/v1/admin/products/route.ts
app/api/v1/admin/products/[id]/route.ts
app/api/v1/admin/lookups/route.ts
app/api/v1/admin/users/route.ts
app/api/v1/admin/impersonate/route.ts

# Admin UI components
components/admin/admin-header.tsx
components/admin/admin-sidebar.tsx
components/admin/admin-list-page.tsx
components/admin/admin-data-table.tsx
components/admin/delete-dialog.tsx
components/admin/product-combobox.tsx
components/admin/user-switcher.tsx
components/admin/orders/orders-list.tsx
components/admin/orders/order-modal.tsx
components/admin/shortlists/shortlists-list.tsx
components/admin/shortlists/shortlist-modal.tsx
components/admin/invoices/invoices-list.tsx
components/admin/invoices/invoice-modal.tsx
components/admin/products/products-list.tsx
components/admin/products/product-modal.tsx

# Realtime infrastructure
hooks/use-realtime-sync.ts
components/realtime-provider.tsx
components/realtime-status.tsx
components/broadcast-listener.tsx

# Buyer-side server actions for realtime refetch
app/buyer/(shop)/orders/actions.ts
app/buyer/(shop)/shortlists/actions.ts
app/buyer/(shop)/browse/natural-diamonds/actions.ts
app/buyer/(shop)/browse/lab-grown-diamonds/actions.ts
app/buyer/(shop)/browse/gemstones/actions.ts
app/buyer/(shop)/browse/natural-melee/actions.ts
app/buyer/(shop)/browse/lab-grown-melee/actions.ts
app/buyer/(shop)/browse/jewelry/engagement-rings/actions.ts
app/buyer/(shop)/browse/jewelry/wedding-bands/actions.ts
app/buyer/(shop)/browse/jewelry/tennis-bracelets/actions.ts

# Database migration
supabase/migrations/<timestamp>_enable_realtime.sql
```

---

## Task 1: Route Group Restructuring

**Files:**
- Modify: `app/buyer/layout.tsx`
- Create: `app/buyer/(shop)/layout.tsx`
- Move: all existing buyer pages into `app/buyer/(shop)/`
- Delete: `app/buyer/admin/` (placeholder page)

This task restructures the `app/buyer/` directory to use Next.js route groups, allowing the admin area to have its own layout independent of the buyer shell.

- [ ] **Step 1: Create the `(shop)` route group directory and move all existing buyer pages into it**

```bash
mkdir -p "app/buyer/(shop)"
mv app/buyer/page.tsx "app/buyer/(shop)/"
mv app/buyer/not-found.tsx "app/buyer/(shop)/"
mv app/buyer/browse "app/buyer/(shop)/"
mv app/buyer/orders "app/buyer/(shop)/"
mv app/buyer/shortlists "app/buyer/(shop)/"
mv app/buyer/finances "app/buyer/(shop)/"
mv app/buyer/settings "app/buyer/(shop)/"
mv app/buyer/ui-kitchen-sink "app/buyer/(shop)/"
```

- [ ] **Step 2: Delete the old admin placeholder page**

```bash
rm -rf app/buyer/admin
```

- [ ] **Step 3: Slim down `app/buyer/layout.tsx` to a shared session-only wrapper**

The current layout fetches the user and wraps in LayoutBase. We need to split this: the thin shared layout stays here, the buyer chrome moves to `(shop)/layout.tsx`.

Replace `app/buyer/layout.tsx` with:

```tsx
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Minivoda",
  description: "Minivoda buyer platform",
}

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
```

Note: Session refresh is handled by middleware (`middleware.ts`), not the layout. The layout was previously calling `getCurrentUser()` and passing to `LayoutBase`, but that logic now lives in the `(shop)` layout.

- [ ] **Step 4: Create `app/buyer/(shop)/layout.tsx` with the buyer shell**

```tsx
import { getCurrentUser } from "@/lib/api/users"
import { LayoutBase } from "@/components/layouts/layout-base"

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  return <LayoutBase user={user}>{children}</LayoutBase>
}
```

- [ ] **Step 5: Create the `(admin)` route group skeleton**

```bash
mkdir -p "app/buyer/(admin)/admin"
```

Create a temporary `app/buyer/(admin)/admin/layout.tsx` so the route group is valid:

```tsx
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div>{children}</div>
}
```

Create `app/buyer/(admin)/admin/page.tsx`:

```tsx
import { redirect } from "next/navigation"

export default function AdminPage() {
  redirect("/buyer/admin/orders")
}
```

- [ ] **Step 6: Verify the restructuring works**

Run: `npm run typecheck && npm run build`

If there are import path issues from the file moves, fix them. The route groups `(shop)` and `(admin)` should not appear in URLs — `/buyer/orders` should still work, and `/buyer/admin` should redirect to `/buyer/admin/orders`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: restructure buyer routes into (shop) and (admin) route groups"
```

---

## Task 2: Seed Admin User + God-Mode Auth

**Files:**
- Modify: `supabase/seed.sql`
- Create: `lib/api/admin/auth.ts`

- [ ] **Step 1: Add admin auth user to `supabase/seed.sql`**

Add this block at the very top of `seed.sql`, before any `public.*` inserts. Supabase local dev uses the `auth` schema for authentication users. The password is hashed with pgcrypto's `crypt()`:

```sql
-- ============================================================================
-- 0. AUTH USERS (Supabase auth.users — must come before public.users)
-- ============================================================================

-- Admin user (god-mode)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'aaaaaaaa-admin-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'admin@nivoda.com',
  crypt('Nivoda123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
  '{"name":"Admin User"}'::jsonb,
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Also create identity for the admin user
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'aaaaaaaa-admin-4000-8000-000000000001',
  'aaaaaaaa-admin-4000-8000-000000000001',
  'admin@nivoda.com',
  '{"sub":"aaaaaaaa-admin-4000-8000-000000000001","email":"admin@nivoda.com"}'::jsonb,
  'email',
  now(),
  now(),
  now()
);
```

Then add the corresponding `public.users` row in the existing users section (after the other user INSERTs):

```sql
INSERT INTO public.users VALUES ('b1000001-0001-4000-8000-000000000099', 'aaaaaaaa-admin-4000-8000-000000000001', 'admin@nivoda.com', 'Admin User', 'Minivoda Admin', NULL, true, 'a1000019-0001-4000-8000-000000000001', '2024-01-01 00:00:00+00', '2024-01-01 00:00:00+00', NULL);
```

Note: The `auth_user_id` column (`'aaaaaaaa-admin-4000-8000-000000000001'`) links the public user to the auth user. The existing seed users have `NULL` for `auth_user_id` — they were created before Supabase Auth was wired up.

- [ ] **Step 2: Create `lib/api/admin/auth.ts` — admin API auth helper**

```tsx
import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/db/client"
import { users } from "@/db/schema"
import { createApiClient } from "@/lib/supabase/api"
import { apiError } from "@/lib/api/response"

type AppUser = typeof users.$inferSelect

/**
 * Admin-only API auth: API key + Bearer token + god-mode role.
 * Returns the app user if all checks pass, or a Response (error).
 */
export async function withAdminAuth(
  request: NextRequest,
): Promise<{ user: AppUser } | Response> {
  // Layer 1: API key validation
  const apiKey = request.headers.get("x-api-key")
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return apiError("INVALID_API_KEY", "Valid API key required", 401)
  }

  // Layer 2: Bearer token
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return apiError("UNAUTHORIZED", "Authentication required", 401)
  }

  const token = authHeader.slice(7)
  const supabase = createApiClient()
  const { data: authData, error: authError } =
    await supabase.auth.getUser(token)

  if (authError || !authData.user) {
    return apiError("UNAUTHORIZED", "Invalid or expired token", 401)
  }

  // Layer 3: God-mode role check
  const role = authData.user.app_metadata?.role
  if (role !== "admin") {
    return apiError("FORBIDDEN", "Admin access required", 403)
  }

  // Look up app user
  const [appUser] = await db
    .select()
    .from(users)
    .where(eq(users.authUserId, authData.user.id))
    .limit(1)

  if (!appUser) {
    return apiError("UNAUTHORIZED", "Admin account not found", 401)
  }

  return { user: appUser }
}

/**
 * Type guard: returns true if auth result is a Response (error).
 */
export function isAdminAuthError(
  result: { user: AppUser } | Response,
): result is Response {
  return result instanceof Response
}
```

- [ ] **Step 3: Verify the seed works**

Run: `npm run db:reset`

Expected: Database resets, migrations apply, seed data inserts without errors. The admin auth user should exist in `auth.users` with `app_metadata.role = "admin"`.

- [ ] **Step 4: Verify the auth module compiles**

Run: `npm run typecheck`

- [ ] **Step 5: Commit**

```bash
git add supabase/seed.sql lib/api/admin/auth.ts
git commit -m "feat(admin): seed admin user and add god-mode auth helper"
```

---

## Task 3: Admin Layout Shell

**Files:**
- Create: `components/admin/admin-header.tsx`
- Create: `components/admin/admin-sidebar.tsx`
- Modify: `app/buyer/(admin)/admin/layout.tsx`
- Modify: `lib/navigation.ts`
- Modify: `components/shell/nav-sheet.tsx`

- [ ] **Step 1: Create `components/admin/admin-sidebar.tsx`**

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconListCheck,
  IconHeart,
  IconReceipt2,
  IconDiamond,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"

const adminNavItems = [
  { label: "Orders", href: "/buyer/admin/orders", icon: IconListCheck },
  { label: "Shortlists", href: "/buyer/admin/shortlists", icon: IconHeart },
  { label: "Invoices", href: "/buyer/admin/invoices", icon: IconReceipt2 },
  { label: "Products", href: "/buyer/admin/products", icon: IconDiamond },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-60 shrink-0 flex-col gap-1 border-r p-3">
      {adminNavItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-chart-2/10 text-chart-2"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        )
      })}
    </aside>
  )
}
```

- [ ] **Step 2: Create `components/admin/admin-header.tsx`**

This is a simple header for now. The user-switcher dropdown is added in a later task.

```tsx
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export function AdminHeader({ userName }: { userName: string }) {
  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <Link href="/buyer/admin" className="text-lg font-semibold">
          Minivoda
        </Link>
        <Badge variant="secondary">Admin</Badge>
      </div>
      <div className="text-sm text-muted-foreground">{userName}</div>
    </header>
  )
}
```

- [ ] **Step 3: Replace `app/buyer/(admin)/admin/layout.tsx` with the full admin shell**

This layout checks for god-mode role and renders a 403 if the user is not an admin.

```tsx
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/api/users"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect("/login")
  }

  const role = authUser.app_metadata?.role
  if (role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">403 — Forbidden</h1>
          <p className="mt-2 text-muted-foreground">
            You do not have admin access.
          </p>
        </div>
      </div>
    )
  }

  const appUser = await getCurrentUser()

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader userName={appUser.name ?? appUser.email} />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Add `target` property to NavItem type and admin link in `lib/navigation.ts`**

Add a `target` field to the `NavItem` interface and set it on the admin link:

In `lib/navigation.ts`, add `target?: string` to the `NavItem` interface, and add `target: "_blank"` to the Admin Dashboard item:

```tsx
export interface NavItem {
  label: string
  href: string
  icon?: ComponentType<{ size?: number; className?: string }>
  badge?: string
  hasSubmenu?: boolean
  hasNotification?: boolean
  hasChevron?: boolean
  target?: string
}
```

Update the admin item:

```tsx
export const adminItems: NavItem[] = [
  {
    label: "Admin Dashboard",
    href: "/buyer/admin",
    icon: IconAdjustmentsAlt,
    hasChevron: true,
    target: "_blank",
  },
  { label: "Settings", href: "/buyer/settings", icon: IconSettings },
]
```

- [ ] **Step 5: Apply `target` in `components/shell/nav-sheet.tsx`**

Find where `adminItems` are rendered (the `NavLink` components in the bottom nav section) and pass the `target` prop to the underlying `<Link>`:

In the `NavLink` component or where admin items are mapped, add `target={item.target}` to the `<Link>` element. The exact edit depends on how `NavLink` is defined — look for the `adminItems.map` and add the target prop.

- [ ] **Step 6: Verify**

Run: `npm run typecheck && npm run build`

Start dev server, log in as `admin@nivoda.com` / `Nivoda123`, navigate to `/buyer/admin`. Should see header + sidebar + redirect to `/buyer/admin/orders` (which will show a blank page since the page doesn't exist yet — that's expected).

Log in as a non-admin user and navigate to `/buyer/admin` — should see the 403 page.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(admin): add admin layout shell with header, sidebar, and god-mode gate"
```

---

## Task 4: Admin Lookups + Users Data Layer

**Files:**
- Create: `lib/api/admin/lookups.ts`
- Create: `lib/api/admin/users.ts`
- Create: `app/api/v1/admin/lookups/route.ts`
- Create: `app/api/v1/admin/users/route.ts`

- [ ] **Step 1: Create `lib/api/admin/lookups.ts`**

Fetches all lookup table data in a single call for populating admin form dropdowns.

```tsx
import { db } from "@/db/client"
import {
  shapes,
  diamondColors,
  diamondClarityGrades,
  diamondCutGrades,
  diamondPolishGrades,
  diamondSymmetryGrades,
  diamondFluorescenceLevels,
  gemstoneTypes,
  gemstoneCutGrades,
  gemstoneTreatments,
  gemstoneOrigins,
  metals,
  bandStyles,
  paymentMethods,
  orderEventTypes,
  invoiceStatuses,
  ledgerEntryTypes,
  paymentTerms,
  productCategories,
} from "@/db/schema"

export interface LookupItem {
  id: string
  value: string
}

export interface AllLookups {
  shapes: LookupItem[]
  diamondColors: LookupItem[]
  diamondClarityGrades: LookupItem[]
  diamondCutGrades: LookupItem[]
  diamondPolishGrades: LookupItem[]
  diamondSymmetryGrades: LookupItem[]
  diamondFluorescenceLevels: LookupItem[]
  gemstoneTypes: LookupItem[]
  gemstoneCutGrades: LookupItem[]
  gemstoneTreatments: LookupItem[]
  gemstoneOrigins: LookupItem[]
  metals: LookupItem[]
  bandStyles: LookupItem[]
  paymentMethods: LookupItem[]
  orderEventTypes: LookupItem[]
  invoiceStatuses: LookupItem[]
  ledgerEntryTypes: LookupItem[]
  paymentTerms: LookupItem[]
  productCategories: LookupItem[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchTable(table: any): Promise<LookupItem[]> {
  const rows = await db
    .select({ id: table.id, value: table.value })
    .from(table)
    .orderBy(table.sortOrder)
  return rows as LookupItem[]
}

export async function fetchAllLookups(): Promise<AllLookups> {
  const [
    shapesData,
    diamondColorsData,
    diamondClarityGradesData,
    diamondCutGradesData,
    diamondPolishGradesData,
    diamondSymmetryGradesData,
    diamondFluorescenceLevelsData,
    gemstoneTypesData,
    gemstoneCutGradesData,
    gemstoneTreatmentsData,
    gemstoneOriginsData,
    metalsData,
    bandStylesData,
    paymentMethodsData,
    orderEventTypesData,
    invoiceStatusesData,
    ledgerEntryTypesData,
    paymentTermsData,
    productCategoriesData,
  ] = await Promise.all([
    fetchTable(shapes),
    fetchTable(diamondColors),
    fetchTable(diamondClarityGrades),
    fetchTable(diamondCutGrades),
    fetchTable(diamondPolishGrades),
    fetchTable(diamondSymmetryGrades),
    fetchTable(diamondFluorescenceLevels),
    fetchTable(gemstoneTypes),
    fetchTable(gemstoneCutGrades),
    fetchTable(gemstoneTreatments),
    fetchTable(gemstoneOrigins),
    fetchTable(metals),
    fetchTable(bandStyles),
    fetchTable(paymentMethods),
    fetchTable(orderEventTypes),
    fetchTable(invoiceStatuses),
    fetchTable(ledgerEntryTypes),
    fetchTable(paymentTerms),
    fetchTable(productCategories),
  ])

  return {
    shapes: shapesData,
    diamondColors: diamondColorsData,
    diamondClarityGrades: diamondClarityGradesData,
    diamondCutGrades: diamondCutGradesData,
    diamondPolishGrades: diamondPolishGradesData,
    diamondSymmetryGrades: diamondSymmetryGradesData,
    diamondFluorescenceLevels: diamondFluorescenceLevelsData,
    gemstoneTypes: gemstoneTypesData,
    gemstoneCutGrades: gemstoneCutGradesData,
    gemstoneTreatments: gemstoneTreatmentsData,
    gemstoneOrigins: gemstoneOriginsData,
    metals: metalsData,
    bandStyles: bandStylesData,
    paymentMethods: paymentMethodsData,
    orderEventTypes: orderEventTypesData,
    invoiceStatuses: invoiceStatusesData,
    ledgerEntryTypes: ledgerEntryTypesData,
    paymentTerms: paymentTermsData,
    productCategories: productCategoriesData,
  }
}
```

- [ ] **Step 2: Create `lib/api/admin/users.ts`**

```tsx
import { db } from "@/db/client"
import { users } from "@/db/schema"
import { isNull } from "drizzle-orm"

export interface AdminUserItem {
  id: string
  email: string
  name: string | null
  companyName: string | null
}

export async function fetchAllUsers(): Promise<AdminUserItem[]> {
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      companyName: users.companyName,
    })
    .from(users)
    .where(isNull(users.deletedAt))
    .orderBy(users.name)

  return rows
}
```

- [ ] **Step 3: Create `app/api/v1/admin/lookups/route.ts`**

```tsx
import { NextRequest } from "next/server"
import { withAdminAuth, isAdminAuthError } from "@/lib/api/admin/auth"
import { fetchAllLookups } from "@/lib/api/admin/lookups"
import { apiSuccess } from "@/lib/api/response"

export async function GET(request: NextRequest) {
  const auth = await withAdminAuth(request)
  if (isAdminAuthError(auth)) return auth

  const lookups = await fetchAllLookups()
  return apiSuccess(lookups)
}
```

- [ ] **Step 4: Create `app/api/v1/admin/users/route.ts`**

```tsx
import { NextRequest } from "next/server"
import { withAdminAuth, isAdminAuthError } from "@/lib/api/admin/auth"
import { fetchAllUsers } from "@/lib/api/admin/users"
import { apiSuccess } from "@/lib/api/response"

export async function GET(request: NextRequest) {
  const auth = await withAdminAuth(request)
  if (isAdminAuthError(auth)) return auth

  const users = await fetchAllUsers()
  return apiSuccess(users)
}
```

- [ ] **Step 5: Verify**

Run: `npm run typecheck`

- [ ] **Step 6: Commit**

```bash
git add lib/api/admin/lookups.ts lib/api/admin/users.ts app/api/v1/admin/lookups/route.ts app/api/v1/admin/users/route.ts
git commit -m "feat(admin): add lookup and user data layer with API routes"
```

---

## Task 5: Shared Admin UI Components

**Files:**
- Create: `components/admin/admin-list-page.tsx`
- Create: `components/admin/admin-data-table.tsx`
- Create: `components/admin/delete-dialog.tsx`
- Create: `components/admin/product-combobox.tsx`

- [ ] **Step 1: Create `components/admin/admin-list-page.tsx`**

Shared layout for all admin list views: title, create button, filter bar, children (table), pagination.

```tsx
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IconPlus, IconSearch } from "@tabler/icons-react"

interface FilterOption {
  label: string
  value: string
  options: { label: string; value: string }[]
}

interface AdminListPageProps {
  title: string
  searchValue: string
  onSearchChange: (value: string) => void
  onCreateClick: () => void
  filters?: FilterOption[]
  filterValues?: Record<string, string>
  onFilterChange?: (key: string, value: string) => void
  totalItems: number
  currentPage: number
  totalPages: number
  perPage: number
  onPageChange: (page: number) => void
  children: React.ReactNode
}

export function AdminListPage({
  title,
  searchValue,
  onSearchChange,
  onCreateClick,
  filters,
  filterValues,
  onFilterChange,
  totalItems,
  currentPage,
  totalPages,
  perPage,
  onPageChange,
  children,
}: AdminListPageProps) {
  const startItem = (currentPage - 1) * perPage + 1
  const endItem = Math.min(currentPage * perPage, totalItems)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <Button onClick={onCreateClick}>
          <IconPlus size={16} className="mr-2" />
          Create
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <IconSearch
            size={16}
            className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"
          />
          <Input
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        {filters?.map((filter) => (
          <Select
            key={filter.value}
            value={filterValues?.[filter.value] ?? "all"}
            onValueChange={(v) => onFilterChange?.(filter.value, v)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label}</SelectItem>
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      {/* Table */}
      {children}

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startItem}–{endItem} of {totalItems}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPages ||
                  Math.abs(p - currentPage) <= 1,
              )
              .map((p, idx, arr) => {
                const prev = arr[idx - 1]
                const showEllipsis = prev !== undefined && p - prev > 1
                return (
                  <span key={p} className="flex items-center">
                    {showEllipsis && (
                      <span className="px-1 text-muted-foreground">…</span>
                    )}
                    <Button
                      variant={p === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(p)}
                    >
                      {p}
                    </Button>
                  </span>
                )
              })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create `components/admin/admin-data-table.tsx`**

Generic table component with row actions (Edit, Delete) and checkbox column.

```tsx
"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { IconDots, IconEdit, IconTrash } from "@tabler/icons-react"

export interface Column<T> {
  header: string
  accessorKey?: keyof T
  cell?: (row: T) => React.ReactNode
  className?: string
}

interface AdminDataTableProps<T extends { id: string }> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
  extraActions?: (row: T) => React.ReactNode
}

export function AdminDataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  onEdit,
  onDelete,
  extraActions,
}: AdminDataTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox disabled />
          </TableHead>
          {columns.map((col) => (
            <TableHead key={col.header} className={col.className}>
              {col.header}
            </TableHead>
          ))}
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length + 2}
              className="py-8 text-center text-muted-foreground"
            >
              No items found
            </TableCell>
          </TableRow>
        ) : (
          data.map((row) => (
            <TableRow
              key={row.id}
              className="cursor-pointer"
              onClick={() => onRowClick?.(row)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox disabled />
              </TableCell>
              {columns.map((col) => (
                <TableCell key={col.header} className={col.className}>
                  {col.cell
                    ? col.cell(row)
                    : col.accessorKey
                      ? String(row[col.accessorKey] ?? "")
                      : ""}
                </TableCell>
              ))}
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <IconDots size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(row)}>
                        <IconEdit size={14} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {extraActions?.(row)}
                    {onDelete && (
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDelete(row)}
                      >
                        <IconTrash size={14} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 3: Create `components/admin/delete-dialog.tsx`**

```tsx
"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  isPending?: boolean
}

export function DeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isPending,
}: DeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

- [ ] **Step 4: Create `components/admin/product-combobox.tsx`**

Searchable product selector used in order and shortlist modals.

```tsx
"use client"

import { useState } from "react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { IconCheck, IconSelector } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { formatUSD } from "@/lib/utils"

export interface ProductOption {
  id: string
  stockId: string
  category: string
  priceUsd: number
}

interface ProductComboboxProps {
  products: ProductOption[]
  value: string | null
  onChange: (productId: string, product: ProductOption) => void
  placeholder?: string
}

export function ProductCombobox({
  products,
  value,
  onChange,
  placeholder = "Select product...",
}: ProductComboboxProps) {
  const [open, setOpen] = useState(false)
  const selected = products.find((p) => p.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selected
            ? `${selected.stockId} — ${selected.category} — ${formatUSD(selected.priceUsd)}`
            : placeholder}
          <IconSelector size={16} className="ml-2 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-100 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search by stock ID..." />
          <CommandList>
            <CommandEmpty>No products found.</CommandEmpty>
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={`${product.stockId} ${product.category}`}
                  onSelect={() => {
                    onChange(product.id, product)
                    setOpen(false)
                  }}
                >
                  <IconCheck
                    size={14}
                    className={cn(
                      "mr-2",
                      value === product.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex-1">
                    <span className="font-medium">{product.stockId}</span>
                    <span className="mx-2 text-muted-foreground">
                      {product.category}
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    {formatUSD(product.priceUsd)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
```

- [ ] **Step 5: Verify**

Run: `npm run typecheck`

- [ ] **Step 6: Commit**

```bash
git add components/admin/admin-list-page.tsx components/admin/admin-data-table.tsx components/admin/delete-dialog.tsx components/admin/product-combobox.tsx
git commit -m "feat(admin): add shared admin UI components (list page, data table, delete dialog, product combobox)"
```

---

## Task 6: Orders Data Layer + API Routes

**Files:**
- Create: `lib/api/admin/orders.ts`
- Create: `app/api/v1/admin/orders/route.ts`
- Create: `app/api/v1/admin/orders/[id]/route.ts`

- [ ] **Step 1: Create `lib/api/admin/orders.ts`**

Full CRUD for orders. List is not user-scoped. Create handles the two-level checkout/order hierarchy. Delete cascades to all dependent records.

```tsx
import { db } from "@/db/client"
import { eq, sql, desc, and, like, inArray } from "drizzle-orm"
import {
  orders,
  orderCheckouts,
  orderProducts,
  orderEvents,
  orderExchangeRates,
  products,
  users,
} from "@/db/schema"
import type { PaginatedResult } from "@/lib/api/helpers"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdminOrderListItem {
  id: string
  orderNumber: string
  userName: string
  userId: string
  status: string | null
  itemCount: number
  finalPriceUsd: number
  createdAt: string
}

export interface AdminOrderDetail {
  id: string
  checkoutId: string
  orderNumber: string
  userId: string
  paymentTermId: string
  statusId: string | null
  estimatedDelivery: string
  deliveryAddressId: string | null
  shippingCost: number
  vatAmount: number
  finalPriceUsd: number
  canTrack: boolean
  canPayInvoice: boolean
  items: { id: string; productId: string; priceUsd: number }[]
  events: { id: string; eventTypeId: string; occurredAt: string }[]
}

export interface CreateOrderInput {
  userId: string
  paymentTermId: string
  statusId?: string
  estimatedDelivery: string
  deliveryAddressId?: string
  shippingCost?: number
  vatAmount?: number
  finalPriceUsd: number
  canTrack?: boolean
  canPayInvoice?: boolean
  items: { productId: string; priceUsd: number }[]
  events?: { eventTypeId: string; occurredAt: string }[]
}

export interface UpdateOrderInput {
  paymentTermId?: string
  statusId?: string | null
  estimatedDelivery?: string
  deliveryAddressId?: string | null
  shippingCost?: number
  vatAmount?: number
  finalPriceUsd?: number
  canTrack?: boolean
  canPayInvoice?: boolean
  items?: { productId: string; priceUsd: number }[]
  events?: { eventTypeId: string; occurredAt: string }[]
}

// ---------------------------------------------------------------------------
// List (all users)
// ---------------------------------------------------------------------------

export async function fetchAdminOrderList(options: {
  page: number
  perPage: number
  search?: string
  statusId?: string
  userId?: string
}): Promise<PaginatedResult<AdminOrderListItem>> {
  const checkouts = await db.query.orderCheckouts.findMany({
    with: {
      user: true,
      orders: {
        with: {
          currentStatusRef: true,
          products: true,
        },
      },
    },
  })

  let items: AdminOrderListItem[] = []
  for (const checkout of checkouts) {
    for (const order of checkout.orders) {
      items.push({
        id: order.id,
        orderNumber: `${String(checkout.orderNumber).padStart(4, "0")}-${order.orderNumber}`,
        userName: checkout.user?.name ?? checkout.user?.email ?? "Unknown",
        userId: checkout.userId,
        status: order.currentStatusRef?.value ?? null,
        itemCount: order.products?.length ?? 0,
        finalPriceUsd: Number(order.finalPriceUsd),
        createdAt: checkout.createdAt.toISOString().split("T")[0],
      })
    }
  }

  // Filters
  if (options.userId) {
    items = items.filter((o) => o.userId === options.userId)
  }
  if (options.statusId) {
    items = items.filter(
      (o) => o.status?.toLowerCase() === options.statusId?.toLowerCase(),
    )
  }
  if (options.search) {
    const q = options.search.toLowerCase()
    items = items.filter(
      (o) =>
        o.orderNumber.includes(q) || o.userName.toLowerCase().includes(q),
    )
  }

  // Sort by date descending
  items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  // Paginate
  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / options.perPage))
  const page = Math.min(Math.max(1, options.page), totalPages)
  const offset = (page - 1) * options.perPage
  const paged = items.slice(offset, offset + options.perPage)

  return {
    items: paged,
    totalItems,
    totalPages,
    currentPage: page,
    perPage: options.perPage,
  }
}

// ---------------------------------------------------------------------------
// Detail
// ---------------------------------------------------------------------------

export async function fetchAdminOrder(
  orderId: string,
): Promise<AdminOrderDetail | undefined> {
  const row = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      checkout: true,
      products: true,
      events: true,
    },
  })

  if (!row) return undefined

  return {
    id: row.id,
    checkoutId: row.checkoutId,
    orderNumber: `${String(row.checkout.orderNumber).padStart(4, "0")}-${row.orderNumber}`,
    userId: row.checkout.userId,
    paymentTermId: row.paymentTermId,
    statusId: row.currentStatus,
    estimatedDelivery: row.estimatedDelivery,
    deliveryAddressId: row.deliveryAddressId,
    shippingCost: Number(row.shippingCost),
    vatAmount: Number(row.vatAmount),
    finalPriceUsd: Number(row.finalPriceUsd),
    canTrack: row.canTrack,
    canPayInvoice: row.canPayInvoice,
    items: (row.products ?? []).map((p) => ({
      id: p.id,
      productId: p.productId,
      priceUsd: Number(p.priceUsd),
    })),
    events: (row.events ?? []).map((e) => ({
      id: e.id,
      eventTypeId: e.eventTypeId,
      occurredAt: e.occurredAt.toISOString(),
    })),
  }
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createAdminOrder(
  input: CreateOrderInput,
): Promise<{ id: string }> {
  // Find the next order number for this user
  const existingCheckouts = await db
    .select({ orderNumber: orderCheckouts.orderNumber })
    .from(orderCheckouts)
    .where(eq(orderCheckouts.userId, input.userId))
    .orderBy(desc(orderCheckouts.orderNumber))
    .limit(1)

  const nextCheckoutNumber =
    existingCheckouts.length > 0 ? existingCheckouts[0].orderNumber + 1 : 1

  // Create checkout
  const [checkout] = await db
    .insert(orderCheckouts)
    .values({
      userId: input.userId,
      orderNumber: nextCheckoutNumber,
      paymentTermId: input.paymentTermId,
    })
    .returning()

  // Create order
  const [order] = await db
    .insert(orders)
    .values({
      checkoutId: checkout.id,
      orderNumber: 1,
      paymentTermId: input.paymentTermId,
      currentStatus: input.statusId ?? null,
      estimatedDelivery: input.estimatedDelivery,
      deliveryAddressId: input.deliveryAddressId ?? null,
      shippingCost: String(input.shippingCost ?? 0),
      vatAmount: String(input.vatAmount ?? 0),
      finalPriceUsd: String(input.finalPriceUsd),
      canTrack: input.canTrack ?? false,
      canPayInvoice: input.canPayInvoice ?? false,
    })
    .returning()

  // Create order items with product snapshots
  if (input.items.length > 0) {
    const productIds = input.items.map((i) => i.productId)
    const productRows = await db
      .select()
      .from(products)
      .where(inArray(products.id, productIds))

    const productMap = new Map(productRows.map((p) => [p.id, p]))

    await db.insert(orderProducts).values(
      input.items.map((item) => {
        const product = productMap.get(item.productId)
        return {
          orderId: order.id,
          productId: item.productId,
          priceUsd: String(item.priceUsd),
          snapshot: product
            ? {
                stockId: product.stockId,
                description: product.description,
                priceUsd: Number(product.priceUsd),
              }
            : {},
        }
      }),
    )
  }

  // Create timeline events
  if (input.events && input.events.length > 0) {
    await db.insert(orderEvents).values(
      input.events.map((e) => ({
        orderId: order.id,
        eventTypeId: e.eventTypeId,
        occurredAt: new Date(e.occurredAt),
      })),
    )
  }

  return { id: order.id }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateAdminOrder(
  orderId: string,
  input: UpdateOrderInput,
): Promise<void> {
  // Update order fields
  const updateData: Record<string, unknown> = {}
  if (input.paymentTermId !== undefined)
    updateData.paymentTermId = input.paymentTermId
  if (input.statusId !== undefined) updateData.currentStatus = input.statusId
  if (input.estimatedDelivery !== undefined)
    updateData.estimatedDelivery = input.estimatedDelivery
  if (input.deliveryAddressId !== undefined)
    updateData.deliveryAddressId = input.deliveryAddressId
  if (input.shippingCost !== undefined)
    updateData.shippingCost = String(input.shippingCost)
  if (input.vatAmount !== undefined)
    updateData.vatAmount = String(input.vatAmount)
  if (input.finalPriceUsd !== undefined)
    updateData.finalPriceUsd = String(input.finalPriceUsd)
  if (input.canTrack !== undefined) updateData.canTrack = input.canTrack
  if (input.canPayInvoice !== undefined)
    updateData.canPayInvoice = input.canPayInvoice

  if (Object.keys(updateData).length > 0) {
    await db.update(orders).set(updateData).where(eq(orders.id, orderId))
  }

  // Also update paymentTermId on checkout if changed
  if (input.paymentTermId !== undefined) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      columns: { checkoutId: true },
    })
    if (order) {
      await db
        .update(orderCheckouts)
        .set({ paymentTermId: input.paymentTermId })
        .where(eq(orderCheckouts.id, order.checkoutId))
    }
  }

  // Replace items if provided
  if (input.items !== undefined) {
    await db.delete(orderProducts).where(eq(orderProducts.orderId, orderId))

    if (input.items.length > 0) {
      const productIds = input.items.map((i) => i.productId)
      const productRows = await db
        .select()
        .from(products)
        .where(inArray(products.id, productIds))
      const productMap = new Map(productRows.map((p) => [p.id, p]))

      await db.insert(orderProducts).values(
        input.items.map((item) => {
          const product = productMap.get(item.productId)
          return {
            orderId,
            productId: item.productId,
            priceUsd: String(item.priceUsd),
            snapshot: product
              ? {
                  stockId: product.stockId,
                  description: product.description,
                  priceUsd: Number(product.priceUsd),
                }
              : {},
          }
        }),
      )
    }
  }

  // Replace events if provided
  if (input.events !== undefined) {
    await db.delete(orderEvents).where(eq(orderEvents.orderId, orderId))

    if (input.events.length > 0) {
      await db.insert(orderEvents).values(
        input.events.map((e) => ({
          orderId,
          eventTypeId: e.eventTypeId,
          occurredAt: new Date(e.occurredAt),
        })),
      )
    }
  }
}

// ---------------------------------------------------------------------------
// Delete (nuclear cascade)
// ---------------------------------------------------------------------------

export async function deleteAdminOrder(orderId: string): Promise<void> {
  // Delete dependent records first
  await db.delete(orderExchangeRates).where(eq(orderExchangeRates.orderId, orderId))
  await db.delete(orderEvents).where(eq(orderEvents.orderId, orderId))
  await db.delete(orderProducts).where(eq(orderProducts.orderId, orderId))

  // Get the checkout ID before deleting the order
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    columns: { checkoutId: true },
  })

  // Delete the order
  await db.delete(orders).where(eq(orders.id, orderId))

  // If this was the last order in the checkout, delete the checkout too
  if (order) {
    const remainingOrders = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.checkoutId, order.checkoutId))
      .limit(1)

    if (remainingOrders.length === 0) {
      await db
        .delete(orderCheckouts)
        .where(eq(orderCheckouts.id, order.checkoutId))
    }
  }
}
```

- [ ] **Step 2: Create `app/api/v1/admin/orders/route.ts`**

```tsx
import { NextRequest } from "next/server"
import { withAdminAuth, isAdminAuthError } from "@/lib/api/admin/auth"
import {
  fetchAdminOrderList,
  createAdminOrder,
  type CreateOrderInput,
} from "@/lib/api/admin/orders"
import { apiSuccess, apiCreated, apiError } from "@/lib/api/response"
import { parsePagination } from "@/lib/api/helpers"

export async function GET(request: NextRequest) {
  const auth = await withAdminAuth(request)
  if (isAdminAuthError(auth)) return auth

  const pagination = parsePagination(request.nextUrl.searchParams)
  if ("error" in pagination) {
    return apiError("INVALID_PARAMS", pagination.error, 400)
  }

  const sp = request.nextUrl.searchParams
  const result = await fetchAdminOrderList({
    page: pagination.page,
    perPage: pagination.perPage,
    search: sp.get("search") ?? undefined,
    statusId: sp.get("status") ?? undefined,
    userId: sp.get("user") ?? undefined,
  })

  return apiSuccess(result.items, {
    page: result.currentPage,
    perPage: result.perPage,
    totalItems: result.totalItems,
    totalPages: result.totalPages,
  })
}

export async function POST(request: NextRequest) {
  const auth = await withAdminAuth(request)
  if (isAdminAuthError(auth)) return auth

  const body = (await request.json()) as CreateOrderInput
  const result = await createAdminOrder(body)
  return apiCreated(result)
}
```

- [ ] **Step 3: Create `app/api/v1/admin/orders/[id]/route.ts`**

```tsx
import { NextRequest } from "next/server"
import { withAdminAuth, isAdminAuthError } from "@/lib/api/admin/auth"
import {
  fetchAdminOrder,
  updateAdminOrder,
  deleteAdminOrder,
  type UpdateOrderInput,
} from "@/lib/api/admin/orders"
import { apiSuccess, apiError } from "@/lib/api/response"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withAdminAuth(request)
  if (isAdminAuthError(auth)) return auth

  const { id } = await params
  const order = await fetchAdminOrder(id)
  if (!order) return apiError("NOT_FOUND", "Order not found", 404)

  return apiSuccess(order)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withAdminAuth(request)
  if (isAdminAuthError(auth)) return auth

  const { id } = await params
  const body = (await request.json()) as UpdateOrderInput
  await updateAdminOrder(id, body)
  return apiSuccess({ id })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withAdminAuth(request)
  if (isAdminAuthError(auth)) return auth

  const { id } = await params
  await deleteAdminOrder(id)
  return apiSuccess({ deleted: true })
}
```

- [ ] **Step 4: Verify**

Run: `npm run typecheck`

- [ ] **Step 5: Commit**

```bash
git add lib/api/admin/orders.ts app/api/v1/admin/orders/
git commit -m "feat(admin): add orders CRUD data layer and API routes"
```

---

## Task 7: Orders Admin Page (List + Modal)

**Files:**
- Create: `components/admin/orders/orders-list.tsx`
- Create: `components/admin/orders/order-modal.tsx`
- Create: `app/buyer/(admin)/admin/orders/page.tsx`

- [ ] **Step 1: Create `components/admin/orders/order-modal.tsx`**

Modal dialog for creating/editing orders. Handles the form state, product selection, repeatable items and events.

```tsx
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  ProductCombobox,
  type ProductOption,
} from "@/components/admin/product-combobox"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import type { LookupItem } from "@/lib/api/admin/lookups"
import type { AdminUserItem } from "@/lib/api/admin/users"
import type { CreateOrderInput, AdminOrderDetail } from "@/lib/api/admin/orders"

interface OrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order?: AdminOrderDetail
  users: AdminUserItem[]
  products: ProductOption[]
  paymentTerms: LookupItem[]
  orderEventTypes: LookupItem[]
  addresses: { id: string; name: string }[]
  onSave: (data: CreateOrderInput) => Promise<void>
  defaultUserId?: string
}

interface OrderItem {
  productId: string
  priceUsd: number
}

interface OrderEvent {
  eventTypeId: string
  occurredAt: string
}

export function OrderModal({
  open,
  onOpenChange,
  order,
  users,
  products,
  paymentTerms,
  orderEventTypes,
  addresses,
  onSave,
  defaultUserId,
}: OrderModalProps) {
  const isEdit = !!order
  const [saving, setSaving] = useState(false)

  // Form state
  const [userId, setUserId] = useState(order?.userId ?? defaultUserId ?? "")
  const [paymentTermId, setPaymentTermId] = useState(
    order?.paymentTermId ?? paymentTerms[0]?.id ?? "",
  )
  const [statusId, setStatusId] = useState(order?.statusId ?? "")
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    order?.estimatedDelivery ?? "",
  )
  const [deliveryAddressId, setDeliveryAddressId] = useState(
    order?.deliveryAddressId ?? "",
  )
  const [shippingCost, setShippingCost] = useState(
    order?.shippingCost?.toString() ?? "0",
  )
  const [vatAmount, setVatAmount] = useState(
    order?.vatAmount?.toString() ?? "0",
  )
  const [finalPriceUsd, setFinalPriceUsd] = useState(
    order?.finalPriceUsd?.toString() ?? "",
  )
  const [canTrack, setCanTrack] = useState(order?.canTrack ?? false)
  const [canPayInvoice, setCanPayInvoice] = useState(
    order?.canPayInvoice ?? false,
  )
  const [items, setItems] = useState<OrderItem[]>(
    order?.items?.map((i) => ({
      productId: i.productId,
      priceUsd: i.priceUsd,
    })) ?? [],
  )
  const [events, setEvents] = useState<OrderEvent[]>(
    order?.events?.map((e) => ({
      eventTypeId: e.eventTypeId,
      occurredAt: e.occurredAt.slice(0, 16),
    })) ?? [],
  )

  async function handleSave() {
    setSaving(true)
    try {
      await onSave({
        userId,
        paymentTermId,
        statusId: statusId || undefined,
        estimatedDelivery,
        deliveryAddressId: deliveryAddressId || undefined,
        shippingCost: Number(shippingCost),
        vatAmount: Number(vatAmount),
        finalPriceUsd: Number(finalPriceUsd),
        canTrack,
        canPayInvoice,
        items,
        events,
      })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Order" : "Create Order"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* Core fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>User *</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name ?? u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Payment Term *</Label>
              <Select value={paymentTermId} onValueChange={setPaymentTermId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentTerms.map((pt) => (
                    <SelectItem key={pt.id} value={pt.id}>
                      {pt.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <Select value={statusId} onValueChange={setStatusId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {orderEventTypes.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Estimated Delivery *</Label>
              <Input
                type="date"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Final Price USD *</Label>
              <Input
                type="number"
                step="0.01"
                value={finalPriceUsd}
                onChange={(e) => setFinalPriceUsd(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Delivery Address</Label>
              <Select
                value={deliveryAddressId}
                onValueChange={setDeliveryAddressId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select address" />
                </SelectTrigger>
                <SelectContent>
                  {addresses.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={canTrack} onCheckedChange={setCanTrack} />
              <Label>Can Track</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={canPayInvoice}
                onCheckedChange={setCanPayInvoice}
              />
              <Label>Can Pay Invoice</Label>
            </div>
          </div>

          {/* Delivery costs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Shipping Cost</Label>
              <Input
                type="number"
                step="0.01"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>VAT</Label>
              <Input
                type="number"
                step="0.01"
                value={vatAmount}
                onChange={(e) => setVatAmount(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div className="flex flex-col gap-3">
            <Label className="text-base font-medium">Order Items</Label>
            {items.map((item, idx) => (
              <div key={idx} className="flex items-end gap-2">
                <div className="flex-1">
                  <ProductCombobox
                    products={products}
                    value={item.productId}
                    onChange={(id, product) => {
                      const next = [...items]
                      next[idx] = {
                        productId: id,
                        priceUsd: product.priceUsd,
                      }
                      setItems(next)
                    }}
                  />
                </div>
                <div className="w-28">
                  <Input
                    type="number"
                    step="0.01"
                    value={item.priceUsd}
                    onChange={(e) => {
                      const next = [...items]
                      next[idx] = {
                        ...next[idx],
                        priceUsd: Number(e.target.value),
                      }
                      setItems(next)
                    }}
                    placeholder="Price"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setItems(items.filter((_, i) => i !== idx))}
                >
                  <IconTrash size={14} />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => setItems([...items, { productId: "", priceUsd: 0 }])}
            >
              <IconPlus size={14} className="mr-1" />
              Add item
            </Button>
          </div>

          <Separator />

          {/* Timeline Events */}
          <div className="flex flex-col gap-3">
            <Label className="text-base font-medium">Timeline Events</Label>
            {events.map((event, idx) => (
              <div key={idx} className="flex items-end gap-2">
                <div className="flex-1">
                  <Select
                    value={event.eventTypeId}
                    onValueChange={(v) => {
                      const next = [...events]
                      next[idx] = { ...next[idx], eventTypeId: v }
                      setEvents(next)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {orderEventTypes.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-48">
                  <Input
                    type="datetime-local"
                    value={event.occurredAt}
                    onChange={(e) => {
                      const next = [...events]
                      next[idx] = { ...next[idx], occurredAt: e.target.value }
                      setEvents(next)
                    }}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setEvents(events.filter((_, i) => i !== idx))
                  }
                >
                  <IconTrash size={14} />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() =>
                setEvents([...events, { eventTypeId: "", occurredAt: "" }])
              }
            >
              <IconPlus size={14} className="mr-1" />
              Add event
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Create `components/admin/orders/orders-list.tsx`**

Client component that manages modal state, filters, and renders the table. Calls admin API routes for CRUD operations.

```tsx
"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AdminListPage } from "@/components/admin/admin-list-page"
import { AdminDataTable, type Column } from "@/components/admin/admin-data-table"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { OrderModal } from "@/components/admin/orders/order-modal"
import { Badge } from "@/components/ui/badge"
import { formatUSD } from "@/lib/utils"
import type {
  AdminOrderListItem,
  CreateOrderInput,
} from "@/lib/api/admin/orders"
import type { AllLookups } from "@/lib/api/admin/lookups"
import type { AdminUserItem } from "@/lib/api/admin/users"
import type { ProductOption } from "@/components/admin/product-combobox"
import type { PaginatedResult } from "@/lib/api/helpers"

interface OrdersListProps {
  initialData: PaginatedResult<AdminOrderListItem>
  lookups: AllLookups
  users: AdminUserItem[]
  products: ProductOption[]
  defaultUserId?: string
}

const columns: Column<AdminOrderListItem>[] = [
  { header: "Order #", accessorKey: "orderNumber" },
  { header: "User", accessorKey: "userName" },
  {
    header: "Status",
    cell: (row) =>
      row.status ? <Badge variant="secondary">{row.status}</Badge> : "—",
  },
  { header: "Items", accessorKey: "itemCount", className: "text-center" },
  {
    header: "Final Price",
    cell: (row) => formatUSD(row.finalPriceUsd),
    className: "text-right",
  },
  { header: "Created", accessorKey: "createdAt" },
]

export function OrdersList({
  initialData,
  lookups,
  users,
  products,
  defaultUserId,
}: OrdersListProps) {
  const router = useRouter()
  const [data, setData] = useState(initialData)
  const [search, setSearch] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<AdminOrderListItem | null>(
    null,
  )
  const [deletingOrder, setDeletingOrder] =
    useState<AdminOrderListItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const refreshData = useCallback(
    async (page = data.currentPage) => {
      const sp = new URLSearchParams({
        page: String(page),
        perPage: String(data.perPage),
      })
      if (search) sp.set("search", search)

      const res = await fetch(`/api/v1/admin/orders?${sp}`, {
        headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY ?? "" },
      })
      const json = await res.json()
      setData({
        items: json.data,
        ...json.pagination,
      })
    },
    [data.currentPage, data.perPage, search],
  )

  async function handleSave(input: CreateOrderInput) {
    const url = editingOrder
      ? `/api/v1/admin/orders/${editingOrder.id}`
      : "/api/v1/admin/orders"
    const method = editingOrder ? "PATCH" : "POST"

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY ?? "",
      },
      body: JSON.stringify(input),
    })

    setEditingOrder(null)
    await refreshData()
  }

  async function handleDelete() {
    if (!deletingOrder) return
    setIsDeleting(true)
    await fetch(`/api/v1/admin/orders/${deletingOrder.id}`, {
      method: "DELETE",
      headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY ?? "" },
    })
    setIsDeleting(false)
    setDeletingOrder(null)
    await refreshData()
  }

  return (
    <>
      <AdminListPage
        title="Orders"
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v)
          refreshData(1)
        }}
        onCreateClick={() => setIsCreateOpen(true)}
        filters={[
          {
            label: "Status",
            value: "status",
            options: lookups.orderEventTypes.map((s) => ({
              label: s.value,
              value: s.id,
            })),
          },
          {
            label: "User",
            value: "user",
            options: users.map((u) => ({
              label: u.name ?? u.email,
              value: u.id,
            })),
          },
        ]}
        totalItems={data.totalItems}
        currentPage={data.currentPage}
        totalPages={data.totalPages}
        perPage={data.perPage}
        onPageChange={refreshData}
      >
        <AdminDataTable
          columns={columns}
          data={data.items}
          onRowClick={(row) => setEditingOrder(row)}
          onEdit={(row) => setEditingOrder(row)}
          onDelete={(row) => setDeletingOrder(row)}
        />
      </AdminListPage>

      {/* Create modal */}
      <OrderModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        users={users}
        products={products}
        paymentTerms={lookups.paymentTerms}
        orderEventTypes={lookups.orderEventTypes}
        addresses={[]}
        onSave={handleSave}
        defaultUserId={defaultUserId}
      />

      {/* Edit modal — fetches full order detail on open */}
      {editingOrder && (
        <OrderModal
          open={!!editingOrder}
          onOpenChange={(open) => !open && setEditingOrder(null)}
          users={users}
          products={products}
          paymentTerms={lookups.paymentTerms}
          orderEventTypes={lookups.orderEventTypes}
          addresses={[]}
          onSave={handleSave}
          defaultUserId={defaultUserId}
        />
      )}

      {/* Delete confirmation */}
      <DeleteDialog
        open={!!deletingOrder}
        onOpenChange={(open) => !open && setDeletingOrder(null)}
        title="Delete Order"
        description={`This will permanently delete order ${deletingOrder?.orderNumber} and all its items, events, and exchange rates. This cannot be undone.`}
        onConfirm={handleDelete}
        isPending={isDeleting}
      />
    </>
  )
}
```

- [ ] **Step 3: Create `app/buyer/(admin)/admin/orders/page.tsx`**

Server Component that fetches data and renders the client component.

```tsx
import { fetchAdminOrderList } from "@/lib/api/admin/orders"
import { fetchAllLookups } from "@/lib/api/admin/lookups"
import { fetchAllUsers } from "@/lib/api/admin/users"
import { fetchAdminProductOptions } from "@/lib/api/admin/products"
import { OrdersList } from "@/components/admin/orders/orders-list"

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const perPage = Number(params.perPage) || 20

  const [data, lookups, users, products] = await Promise.all([
    fetchAdminOrderList({ page, perPage }),
    fetchAllLookups(),
    fetchAllUsers(),
    fetchAdminProductOptions(),
  ])

  return (
    <OrdersList
      initialData={data}
      lookups={lookups}
      users={users}
      products={products}
    />
  )
}
```

Note: `fetchAdminProductOptions` is created in Task 10 (Products data layer). For now, create a stub in `lib/api/admin/products.ts`:

```tsx
import { db } from "@/db/client"
import { products, productCategories } from "@/db/schema"
import { eq, isNull } from "drizzle-orm"
import type { ProductOption } from "@/components/admin/product-combobox"

export async function fetchAdminProductOptions(): Promise<ProductOption[]> {
  const rows = await db.query.products.findMany({
    where: isNull(products.deletedAt),
    with: { productCategory: true },
  })

  return rows.map((p) => ({
    id: p.id,
    stockId: p.stockId,
    category: p.productCategory?.value ?? "",
    priceUsd: Number(p.priceUsd),
  }))
}
```

- [ ] **Step 4: Verify**

Run: `npm run typecheck && npm run build`

Start dev server, log in as admin, navigate to `/buyer/admin/orders`. Should see the orders list page with the create button, filter bar, and table.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(admin): add orders list page with create/edit/delete modals"
```

---

## Task 8: Shortlists Data Layer + API + Page

**Files:**
- Create: `lib/api/admin/shortlists.ts`
- Create: `app/api/v1/admin/shortlists/route.ts`
- Create: `app/api/v1/admin/shortlists/[id]/route.ts`
- Create: `components/admin/shortlists/shortlists-list.tsx`
- Create: `components/admin/shortlists/shortlist-modal.tsx`
- Create: `app/buyer/(admin)/admin/shortlists/page.tsx`

- [ ] **Step 1: Create `lib/api/admin/shortlists.ts`**

```tsx
import { db } from "@/db/client"
import { eq } from "drizzle-orm"
import { shortlists, shortlistItems } from "@/db/schema"

export interface AdminShortlistListItem {
  id: string
  name: string
  userName: string
  userId: string
  itemCount: number
  createdAt: string
}

export interface AdminShortlistDetail {
  id: string
  name: string
  userId: string
  items: { id: string; productId: string }[]
}

export interface CreateShortlistInput {
  userId: string
  name: string
  items: { productId: string }[]
}

export interface UpdateShortlistInput {
  name?: string
  items?: { productId: string }[]
}

export async function fetchAdminShortlistList(options: {
  page: number
  perPage: number
  search?: string
  userId?: string
}): Promise<{
  items: AdminShortlistListItem[]
  totalItems: number
  totalPages: number
  currentPage: number
  perPage: number
}> {
  const rows = await db.query.shortlists.findMany({
    with: { user: true, items: true },
  })

  let items: AdminShortlistListItem[] = rows.map((sl) => ({
    id: sl.id,
    name: sl.name,
    userName: sl.user?.name ?? sl.user?.email ?? "Unknown",
    userId: sl.userId,
    itemCount: sl.items?.length ?? 0,
    createdAt: sl.createdAt.toISOString().split("T")[0],
  }))

  if (options.userId) items = items.filter((s) => s.userId === options.userId)
  if (options.search) {
    const q = options.search.toLowerCase()
    items = items.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.userName.toLowerCase().includes(q),
    )
  }

  items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / options.perPage))
  const page = Math.min(Math.max(1, options.page), totalPages)
  const offset = (page - 1) * options.perPage

  return {
    items: items.slice(offset, offset + options.perPage),
    totalItems,
    totalPages,
    currentPage: page,
    perPage: options.perPage,
  }
}

export async function fetchAdminShortlist(
  id: string,
): Promise<AdminShortlistDetail | undefined> {
  const row = await db.query.shortlists.findFirst({
    where: eq(shortlists.id, id),
    with: { items: true },
  })
  if (!row) return undefined
  return {
    id: row.id,
    name: row.name,
    userId: row.userId,
    items: (row.items ?? []).map((i) => ({ id: i.id, productId: i.productId })),
  }
}

export async function createAdminShortlist(
  input: CreateShortlistInput,
): Promise<{ id: string }> {
  const [row] = await db
    .insert(shortlists)
    .values({ userId: input.userId, name: input.name })
    .returning()

  if (input.items.length > 0) {
    await db.insert(shortlistItems).values(
      input.items.map((i) => ({ shortlistId: row.id, productId: i.productId })),
    )
  }

  return { id: row.id }
}

export async function updateAdminShortlist(
  id: string,
  input: UpdateShortlistInput,
): Promise<void> {
  if (input.name !== undefined) {
    await db.update(shortlists).set({ name: input.name }).where(eq(shortlists.id, id))
  }
  if (input.items !== undefined) {
    await db.delete(shortlistItems).where(eq(shortlistItems.shortlistId, id))
    if (input.items.length > 0) {
      await db.insert(shortlistItems).values(
        input.items.map((i) => ({ shortlistId: id, productId: i.productId })),
      )
    }
  }
}

export async function deleteAdminShortlist(id: string): Promise<void> {
  await db.delete(shortlistItems).where(eq(shortlistItems.shortlistId, id))
  await db.delete(shortlists).where(eq(shortlists.id, id))
}
```

- [ ] **Step 2: Create API routes, list component, modal, and page**

Follow the exact same pattern as Task 6 (API routes) and Task 7 (list + modal + page) but for shortlists. The API routes go in `app/api/v1/admin/shortlists/route.ts` (GET + POST) and `app/api/v1/admin/shortlists/[id]/route.ts` (GET + PATCH + DELETE).

The shortlist modal is simpler than orders — it only has:
- User select
- Name text input
- Repeatable product items via ProductCombobox

The list component follows the same pattern as `OrdersList` with columns: Name, User, Items count, Created date. Filter: User only.

The page server component fetches shortlist list, lookups, users, and products, then renders the client list.

Create all four files following the established patterns.

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run build`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(admin): add shortlists CRUD with list page, modal, and API routes"
```

---

## Task 9: Invoices Data Layer + API + Page

**Files:**
- Create: `lib/api/admin/invoices.ts`
- Create: `app/api/v1/admin/invoices/route.ts`
- Create: `app/api/v1/admin/invoices/[id]/route.ts`
- Create: `components/admin/invoices/invoices-list.tsx`
- Create: `components/admin/invoices/invoice-modal.tsx`
- Create: `app/buyer/(admin)/admin/invoices/page.tsx`

- [ ] **Step 1: Create `lib/api/admin/invoices.ts`**

```tsx
import { db } from "@/db/client"
import { eq } from "drizzle-orm"
import { invoices, ledgerEntries, ledgerEntryExchangeRates } from "@/db/schema"

export interface AdminInvoiceListItem {
  id: string
  invoiceNumber: string
  userName: string
  userId: string
  status: string | null
  totalAmountUsd: number
  issueDate: string
  dueDate: string
}

export interface AdminInvoiceDetail {
  id: string
  invoiceNumber: string
  userId: string
  paymentMethodId: string
  statusId: string | null
  totalAmountUsd: number
  issueDate: string
  dueDate: string
  ledgerEntries: {
    id: string
    ledgerEntryTypeId: string
    orderId: string | null
    description: string
    amountUsd: number
    occurredAt: string
  }[]
}

export interface CreateInvoiceInput {
  userId: string
  invoiceNumber: string
  paymentMethodId: string
  statusId?: string
  totalAmountUsd: number
  issueDate: string
  dueDate: string
  ledgerEntries?: {
    ledgerEntryTypeId: string
    orderId?: string
    description: string
    amountUsd: number
    occurredAt: string
  }[]
}

export interface UpdateInvoiceInput {
  invoiceNumber?: string
  paymentMethodId?: string
  statusId?: string | null
  totalAmountUsd?: number
  issueDate?: string
  dueDate?: string
  ledgerEntries?: {
    ledgerEntryTypeId: string
    orderId?: string
    description: string
    amountUsd: number
    occurredAt: string
  }[]
}

export async function fetchAdminInvoiceList(options: {
  page: number
  perPage: number
  search?: string
  statusId?: string
  userId?: string
}): Promise<{
  items: AdminInvoiceListItem[]
  totalItems: number
  totalPages: number
  currentPage: number
  perPage: number
}> {
  const rows = await db.query.invoices.findMany({
    with: { user: true, currentStatusRef: true },
  })

  let items: AdminInvoiceListItem[] = rows.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    userName: inv.user?.name ?? inv.user?.email ?? "Unknown",
    userId: inv.userId,
    status: inv.currentStatusRef?.value ?? null,
    totalAmountUsd: Number(inv.totalAmountUsd),
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
  }))

  if (options.userId) items = items.filter((i) => i.userId === options.userId)
  if (options.statusId) {
    items = items.filter(
      (i) => i.status?.toLowerCase() === options.statusId?.toLowerCase(),
    )
  }
  if (options.search) {
    const q = options.search.toLowerCase()
    items = items.filter(
      (i) =>
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.userName.toLowerCase().includes(q),
    )
  }

  items.sort(
    (a, b) =>
      new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime(),
  )

  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / options.perPage))
  const page = Math.min(Math.max(1, options.page), totalPages)
  const offset = (page - 1) * options.perPage

  return {
    items: items.slice(offset, offset + options.perPage),
    totalItems,
    totalPages,
    currentPage: page,
    perPage: options.perPage,
  }
}

export async function fetchAdminInvoice(
  id: string,
): Promise<AdminInvoiceDetail | undefined> {
  const row = await db.query.invoices.findFirst({
    where: eq(invoices.id, id),
    with: { ledgerEntries: true },
  })
  if (!row) return undefined
  return {
    id: row.id,
    invoiceNumber: row.invoiceNumber,
    userId: row.userId,
    paymentMethodId: row.paymentMethodId,
    statusId: row.currentStatus,
    totalAmountUsd: Number(row.totalAmountUsd),
    issueDate: row.issueDate,
    dueDate: row.dueDate,
    ledgerEntries: (row.ledgerEntries ?? []).map((le) => ({
      id: le.id,
      ledgerEntryTypeId: le.ledgerEntryTypeId,
      orderId: le.orderId,
      description: le.description,
      amountUsd: Number(le.amountUsd),
      occurredAt: le.occurredAt.toISOString(),
    })),
  }
}

export async function createAdminInvoice(
  input: CreateInvoiceInput,
): Promise<{ id: string }> {
  const [row] = await db
    .insert(invoices)
    .values({
      userId: input.userId,
      invoiceNumber: input.invoiceNumber,
      paymentMethodId: input.paymentMethodId,
      currentStatus: input.statusId ?? null,
      totalAmountUsd: String(input.totalAmountUsd),
      issueDate: input.issueDate,
      dueDate: input.dueDate,
    })
    .returning()

  if (input.ledgerEntries && input.ledgerEntries.length > 0) {
    await db.insert(ledgerEntries).values(
      input.ledgerEntries.map((le) => ({
        invoiceId: row.id,
        ledgerEntryTypeId: le.ledgerEntryTypeId,
        orderId: le.orderId ?? null,
        description: le.description,
        amountUsd: String(le.amountUsd),
        occurredAt: new Date(le.occurredAt),
      })),
    )
  }

  return { id: row.id }
}

export async function updateAdminInvoice(
  id: string,
  input: UpdateInvoiceInput,
): Promise<void> {
  const updateData: Record<string, unknown> = {}
  if (input.invoiceNumber !== undefined)
    updateData.invoiceNumber = input.invoiceNumber
  if (input.paymentMethodId !== undefined)
    updateData.paymentMethodId = input.paymentMethodId
  if (input.statusId !== undefined) updateData.currentStatus = input.statusId
  if (input.totalAmountUsd !== undefined)
    updateData.totalAmountUsd = String(input.totalAmountUsd)
  if (input.issueDate !== undefined) updateData.issueDate = input.issueDate
  if (input.dueDate !== undefined) updateData.dueDate = input.dueDate

  if (Object.keys(updateData).length > 0) {
    await db.update(invoices).set(updateData).where(eq(invoices.id, id))
  }

  if (input.ledgerEntries !== undefined) {
    // Delete existing exchange rates for this invoice's ledger entries
    const existingEntries = await db
      .select({ id: ledgerEntries.id })
      .from(ledgerEntries)
      .where(eq(ledgerEntries.invoiceId, id))

    for (const entry of existingEntries) {
      await db
        .delete(ledgerEntryExchangeRates)
        .where(eq(ledgerEntryExchangeRates.ledgerEntryId, entry.id))
    }

    await db.delete(ledgerEntries).where(eq(ledgerEntries.invoiceId, id))

    if (input.ledgerEntries.length > 0) {
      await db.insert(ledgerEntries).values(
        input.ledgerEntries.map((le) => ({
          invoiceId: id,
          ledgerEntryTypeId: le.ledgerEntryTypeId,
          orderId: le.orderId ?? null,
          description: le.description,
          amountUsd: String(le.amountUsd),
          occurredAt: new Date(le.occurredAt),
        })),
      )
    }
  }
}

export async function deleteAdminInvoice(id: string): Promise<void> {
  const entries = await db
    .select({ id: ledgerEntries.id })
    .from(ledgerEntries)
    .where(eq(ledgerEntries.invoiceId, id))

  for (const entry of entries) {
    await db
      .delete(ledgerEntryExchangeRates)
      .where(eq(ledgerEntryExchangeRates.ledgerEntryId, entry.id))
  }

  await db.delete(ledgerEntries).where(eq(ledgerEntries.invoiceId, id))
  await db.delete(invoices).where(eq(invoices.id, id))
}
```

- [ ] **Step 2: Create API routes, list component, modal, and page**

Follow the exact same pattern as Tasks 6-7 for invoices. The API routes go in `app/api/v1/admin/invoices/route.ts` (GET + POST) and `app/api/v1/admin/invoices/[id]/route.ts` (GET + PATCH + DELETE).

The invoice modal has:
- Core fields: User, invoice number, payment method, status, total amount, issue date, due date
- Repeatable ledger entries: type, description, amount, occurred at, optional order

Columns: Invoice #, User, Status, Amount, Issue date, Due date. Filters: Status, User.

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run build`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(admin): add invoices CRUD with list page, modal, and API routes"
```

---

## Task 10: Products Data Layer + API + Page

**Files:**
- Complete: `lib/api/admin/products.ts` (expand the stub from Task 7)
- Create: `app/api/v1/admin/products/route.ts`
- Create: `app/api/v1/admin/products/[id]/route.ts`
- Create: `components/admin/products/products-list.tsx`
- Create: `components/admin/products/product-modal.tsx`
- Create: `app/buyer/(admin)/admin/products/page.tsx`

This is the most complex module due to the category-adaptive form and multiple junction tables for jewelry.

- [ ] **Step 1: Expand `lib/api/admin/products.ts`**

This file already has `fetchAdminProductOptions()` from Task 7. Add the full CRUD operations:

```tsx
import { db } from "@/db/client"
import { eq, isNull, inArray } from "drizzle-orm"
import {
  products,
  diamonds,
  gemstones,
  meleeLots,
  engagementRings,
  engagementRingAvailableMetals,
  engagementRingCompatibleStones,
  weddingBands,
  weddingBandAvailableMetals,
  tennisBracelets,
  productImages,
  certifications,
  orderProducts,
  shortlistItems,
  cartItems,
} from "@/db/schema"
import type { ProductOption } from "@/components/admin/product-combobox"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdminProductListItem {
  id: string
  stockId: string
  category: string
  categorySlug: string
  supplierName: string
  priceUsd: number
  isActive: boolean
  createdAt: string
}

export interface CreateProductInput {
  supplierId: string
  stockId: string
  productCategoryId: string
  priceUsd: number
  description: string
  isActive?: boolean
  // Category-specific (only one of these will be populated)
  diamond?: {
    labGrown: boolean
    shapeId: string
    carat: number
    colorId: string
    clarityId: string
    cutId: string
    polishId: string
    symmetryId: string
    fluorescenceId: string
    pricePerCaratUsd?: number
    tablePct?: number
    depthPct?: number
    lengthMm?: number
    widthMm?: number
    depthMm?: number
  }
  gemstone?: {
    gemstoneTypeId: string
    shapeId: string
    carat: number
    color: string
    clarity: string
    cutId: string
    treatmentId: string
    originId: string
    pricePerCaratUsd?: number
    lengthMm?: number
    widthMm?: number
    depthMm?: number
  }
  melee?: {
    labGrown: boolean
    shapeId: string
    sizeRange: string
    colorRange: string
    clarityRange: string
    cutId: string
    quantity: number
    totalCaratWeight: number
  }
  engagementRing?: {
    sku: string
    bandStyleId: string
    ringWidthMm?: number
    availableMetals: { metalId: string; priceUsd: number }[]
    compatibleStones: { shapeId: string; maxCarat: number }[]
  }
  weddingBand?: {
    sku: string
    bandStyleId: string
    ringWidthMm?: number
    availableMetals: { metalId: string; priceUsd: number }[]
  }
  tennisBracelet?: {
    sku: string
  }
}

// ---------------------------------------------------------------------------
// Product options (already exists from Task 7 stub)
// ---------------------------------------------------------------------------

export async function fetchAdminProductOptions(): Promise<ProductOption[]> {
  const rows = await db.query.products.findMany({
    where: isNull(products.deletedAt),
    with: { productCategory: true },
  })

  return rows.map((p) => ({
    id: p.id,
    stockId: p.stockId,
    category: p.productCategory?.value ?? "",
    priceUsd: Number(p.priceUsd),
  }))
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

export async function fetchAdminProductList(options: {
  page: number
  perPage: number
  search?: string
  categoryId?: string
  supplierId?: string
  isActive?: boolean
}): Promise<{
  items: AdminProductListItem[]
  totalItems: number
  totalPages: number
  currentPage: number
  perPage: number
}> {
  const rows = await db.query.products.findMany({
    where: isNull(products.deletedAt),
    with: { productCategory: true, supplier: true },
  })

  let items: AdminProductListItem[] = rows.map((p) => ({
    id: p.id,
    stockId: p.stockId,
    category: p.productCategory?.value ?? "",
    categorySlug: p.productCategory?.value ?? "",
    supplierName: p.supplier?.name ?? "",
    priceUsd: Number(p.priceUsd),
    isActive: p.isActive,
    createdAt: p.createdAt.toISOString().split("T")[0],
  }))

  if (options.categoryId)
    items = items.filter((p) => p.categorySlug === options.categoryId)
  if (options.supplierId)
    items = items.filter((p) => p.supplierName === options.supplierId)
  if (options.isActive !== undefined)
    items = items.filter((p) => p.isActive === options.isActive)
  if (options.search) {
    const q = options.search.toLowerCase()
    items = items.filter(
      (p) =>
        p.stockId.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    )
  }

  items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / options.perPage))
  const page = Math.min(Math.max(1, options.page), totalPages)
  const offset = (page - 1) * options.perPage

  return {
    items: items.slice(offset, offset + options.perPage),
    totalItems,
    totalPages,
    currentPage: page,
    perPage: options.perPage,
  }
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createAdminProduct(
  input: CreateProductInput,
): Promise<{ id: string }> {
  const [product] = await db
    .insert(products)
    .values({
      supplierId: input.supplierId,
      stockId: input.stockId,
      productCategoryId: input.productCategoryId,
      priceUsd: String(input.priceUsd),
      description: input.description,
      isActive: input.isActive ?? true,
    })
    .returning()

  // Category-specific inserts
  if (input.diamond) {
    await db.insert(diamonds).values({
      productId: product.id,
      labGrown: input.diamond.labGrown,
      shapeId: input.diamond.shapeId,
      carat: String(input.diamond.carat),
      colorId: input.diamond.colorId,
      clarityId: input.diamond.clarityId,
      cutId: input.diamond.cutId,
      polishId: input.diamond.polishId,
      symmetryId: input.diamond.symmetryId,
      fluorescenceId: input.diamond.fluorescenceId,
      pricePerCaratUsd: input.diamond.pricePerCaratUsd
        ? String(input.diamond.pricePerCaratUsd)
        : null,
      tablePct: input.diamond.tablePct
        ? String(input.diamond.tablePct)
        : null,
      depthPct: input.diamond.depthPct
        ? String(input.diamond.depthPct)
        : null,
      lengthMm: input.diamond.lengthMm
        ? String(input.diamond.lengthMm)
        : null,
      widthMm: input.diamond.widthMm ? String(input.diamond.widthMm) : null,
      depthMm: input.diamond.depthMm ? String(input.diamond.depthMm) : null,
    })
  }

  if (input.gemstone) {
    await db.insert(gemstones).values({
      productId: product.id,
      gemstoneTypeId: input.gemstone.gemstoneTypeId,
      shapeId: input.gemstone.shapeId,
      carat: String(input.gemstone.carat),
      color: input.gemstone.color,
      clarity: input.gemstone.clarity,
      cutId: input.gemstone.cutId,
      treatmentId: input.gemstone.treatmentId,
      originId: input.gemstone.originId,
      pricePerCaratUsd: input.gemstone.pricePerCaratUsd
        ? String(input.gemstone.pricePerCaratUsd)
        : null,
      lengthMm: input.gemstone.lengthMm
        ? String(input.gemstone.lengthMm)
        : null,
      widthMm: input.gemstone.widthMm
        ? String(input.gemstone.widthMm)
        : null,
      depthMm: input.gemstone.depthMm
        ? String(input.gemstone.depthMm)
        : null,
    })
  }

  if (input.melee) {
    await db.insert(meleeLots).values({
      productId: product.id,
      labGrown: input.melee.labGrown,
      shapeId: input.melee.shapeId,
      sizeRange: input.melee.sizeRange,
      colorRange: input.melee.colorRange,
      clarityRange: input.melee.clarityRange,
      cutId: input.melee.cutId,
      quantity: input.melee.quantity,
      totalCaratWeight: String(input.melee.totalCaratWeight),
    })
  }

  if (input.engagementRing) {
    const [ring] = await db
      .insert(engagementRings)
      .values({
        productId: product.id,
        sku: input.engagementRing.sku,
        bandStyleId: input.engagementRing.bandStyleId,
        ringWidthMm: input.engagementRing.ringWidthMm
          ? String(input.engagementRing.ringWidthMm)
          : null,
      })
      .returning()

    if (input.engagementRing.availableMetals.length > 0) {
      await db.insert(engagementRingAvailableMetals).values(
        input.engagementRing.availableMetals.map((m) => ({
          engagementRingId: ring.id,
          metalId: m.metalId,
          priceUsd: String(m.priceUsd),
        })),
      )
    }

    if (input.engagementRing.compatibleStones.length > 0) {
      await db.insert(engagementRingCompatibleStones).values(
        input.engagementRing.compatibleStones.map((s) => ({
          engagementRingId: ring.id,
          shapeId: s.shapeId,
          maxCarat: String(s.maxCarat),
        })),
      )
    }
  }

  if (input.weddingBand) {
    const [band] = await db
      .insert(weddingBands)
      .values({
        productId: product.id,
        sku: input.weddingBand.sku,
        bandStyleId: input.weddingBand.bandStyleId,
        ringWidthMm: input.weddingBand.ringWidthMm
          ? String(input.weddingBand.ringWidthMm)
          : null,
      })
      .returning()

    if (input.weddingBand.availableMetals.length > 0) {
      await db.insert(weddingBandAvailableMetals).values(
        input.weddingBand.availableMetals.map((m) => ({
          weddingBandId: band.id,
          metalId: m.metalId,
          priceUsd: String(m.priceUsd),
        })),
      )
    }
  }

  if (input.tennisBracelet) {
    await db.insert(tennisBracelets).values({
      productId: product.id,
      sku: input.tennisBracelet.sku,
    })
  }

  return { id: product.id }
}

// ---------------------------------------------------------------------------
// Delete (nuclear cascade)
// ---------------------------------------------------------------------------

export async function deleteAdminProduct(productId: string): Promise<void> {
  // Delete from junction tables (jewelry)
  const ring = await db.query.engagementRings.findFirst({
    where: eq(engagementRings.productId, productId),
    columns: { id: true },
  })
  if (ring) {
    await db.delete(engagementRingAvailableMetals).where(eq(engagementRingAvailableMetals.engagementRingId, ring.id))
    await db.delete(engagementRingCompatibleStones).where(eq(engagementRingCompatibleStones.engagementRingId, ring.id))
    await db.delete(engagementRings).where(eq(engagementRings.id, ring.id))
  }

  const band = await db.query.weddingBands.findFirst({
    where: eq(weddingBands.productId, productId),
    columns: { id: true },
  })
  if (band) {
    await db.delete(weddingBandAvailableMetals).where(eq(weddingBandAvailableMetals.weddingBandId, band.id))
    await db.delete(weddingBands).where(eq(weddingBands.id, band.id))
  }

  // Delete from simple child tables
  await db.delete(tennisBracelets).where(eq(tennisBracelets.productId, productId))
  await db.delete(diamonds).where(eq(diamonds.productId, productId))
  await db.delete(gemstones).where(eq(gemstones.productId, productId))
  await db.delete(meleeLots).where(eq(meleeLots.productId, productId))
  await db.delete(certifications).where(eq(certifications.productId, productId))
  await db.delete(productImages).where(eq(productImages.productId, productId))

  // Nuclear cascade: remove from orders, shortlists, carts
  await db.delete(orderProducts).where(eq(orderProducts.productId, productId))
  await db.delete(shortlistItems).where(eq(shortlistItems.productId, productId))
  await db.delete(cartItems).where(eq(cartItems.productId, productId))

  // Delete the product itself
  await db.delete(products).where(eq(products.id, productId))
}
```

- [ ] **Step 2: Create API routes for products**

`app/api/v1/admin/products/route.ts` (GET list + POST create) and `app/api/v1/admin/products/[id]/route.ts` (GET detail + PATCH update + DELETE). Follow the same pattern as orders API routes but using the products data layer functions.

- [ ] **Step 3: Create `components/admin/products/product-modal.tsx`**

This is the most complex modal. It has:
- Common fields section (category select, supplier, stock ID, price, active toggle, description)
- A category-specific section that swaps based on selected category
- For jewelry categories: repeatable rows for available metals and compatible stones

The category select uses `lookups.productCategories`. When the category changes, the form section below swaps to show the relevant fields. Use conditional rendering based on the selected category slug.

Map category slugs to their field sets:
- `natural_diamond`, `lab_grown_diamond` → Diamond fields
- `gemstone` → Gemstone fields
- `natural_melee`, `lab_grown_melee` → Melee fields
- `engagement_ring` → Engagement ring fields with metals + stones
- `wedding_band` → Wedding band fields with metals
- `tennis_bracelet` → Tennis bracelet fields (SKU only)

- [ ] **Step 4: Create products list component and page**

Follow the established pattern. Columns: Stock ID, Category, Supplier, Price, Active/Inactive, Created date. Filters: Category, Supplier, Active/Inactive.

- [ ] **Step 5: Verify**

Run: `npm run typecheck && npm run build`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(admin): add products CRUD with category-adaptive modal, data layer, and API routes"
```

---

## Task 11: Supabase Realtime Infrastructure

**Files:**
- Create: `supabase/migrations/<timestamp>_enable_realtime.sql`
- Create: `hooks/use-realtime-sync.ts`
- Create: `components/realtime-provider.tsx`
- Create: `components/realtime-status.tsx`

- [ ] **Step 1: Create the Realtime migration**

Run `npm run db:generate` to get the current timestamp format, then create the migration file manually. The file name should follow the existing migration naming pattern in `supabase/migrations/`.

```sql
-- Enable Realtime on tables that affect buyer-facing views

ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_checkouts;
ALTER PUBLICATION supabase_realtime ADD TABLE order_products;
ALTER PUBLICATION supabase_realtime ADD TABLE order_events;
ALTER PUBLICATION supabase_realtime ADD TABLE shortlists;
ALTER PUBLICATION supabase_realtime ADD TABLE shortlist_items;
ALTER PUBLICATION supabase_realtime ADD TABLE invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE ledger_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE diamonds;
ALTER PUBLICATION supabase_realtime ADD TABLE gemstones;
ALTER PUBLICATION supabase_realtime ADD TABLE melee_lots;
ALTER PUBLICATION supabase_realtime ADD TABLE engagement_rings;
ALTER PUBLICATION supabase_realtime ADD TABLE wedding_bands;
ALTER PUBLICATION supabase_realtime ADD TABLE tennis_bracelets;
ALTER PUBLICATION supabase_realtime ADD TABLE product_images;
ALTER PUBLICATION supabase_realtime ADD TABLE cart_items;
```

- [ ] **Step 2: Create `components/realtime-provider.tsx`**

React context that tracks connection state and sync status across the app.

```tsx
"use client"

import { createContext, useState, useCallback, type ReactNode } from "react"

interface RealtimeState {
  isConnected: boolean
  isSyncing: boolean
  setIsConnected: (v: boolean) => void
  setIsSyncing: (v: boolean) => void
  incrementSyncing: () => void
  decrementSyncing: () => void
}

export const RealtimeContext = createContext<RealtimeState>({
  isConnected: false,
  isSyncing: false,
  setIsConnected: () => {},
  setIsSyncing: () => {},
  incrementSyncing: () => {},
  decrementSyncing: () => {},
})

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [syncCount, setSyncCount] = useState(0)

  const incrementSyncing = useCallback(
    () => setSyncCount((c) => c + 1),
    [],
  )
  const decrementSyncing = useCallback(
    () => setSyncCount((c) => Math.max(0, c - 1)),
    [],
  )

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        isSyncing: syncCount > 0,
        setIsConnected,
        setIsSyncing: (v) => setSyncCount(v ? 1 : 0),
        incrementSyncing,
        decrementSyncing,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  )
}
```

- [ ] **Step 3: Create `hooks/use-realtime-sync.ts`**

```tsx
"use client"

import { useEffect, useState, useCallback, useContext, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { RealtimeContext } from "@/components/realtime-provider"

export function useRealtimeSync<T>(
  initialData: T,
  table: string,
  refetchFn: () => Promise<T>,
): T {
  const [data, setData] = useState<T>(initialData)
  const { setIsConnected, incrementSyncing, decrementSyncing } =
    useContext(RealtimeContext)
  const refetchRef = useRef(refetchFn)
  refetchRef.current = refetchFn

  // Reset when initialData changes (e.g., page navigation or user switch)
  useEffect(() => {
    setData(initialData)
  }, [initialData])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        async () => {
          incrementSyncing()
          try {
            const fresh = await refetchRef.current()
            setData(fresh)
          } finally {
            decrementSyncing()
          }
        },
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED")
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, setIsConnected, incrementSyncing, decrementSyncing])

  return data
}
```

- [ ] **Step 4: Create `components/realtime-status.tsx`**

The fixed status pill in the bottom-right corner of the buyer app.

```tsx
"use client"

import { useContext } from "react"
import { RealtimeContext } from "@/components/realtime-provider"
import { IconCheck, IconLoader2 } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

export function RealtimeStatus() {
  const { isConnected, isSyncing } = useContext(RealtimeContext)

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-full border bg-background px-4 py-2 text-xs shadow-sm">
      {/* Connection status */}
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "inline-block h-2 w-2 rounded-full",
            isConnected ? "animate-pulse bg-green-500" : "bg-amber-500",
          )}
        />
        <span className="text-muted-foreground">
          {isConnected ? "Database live" : "Connecting..."}
        </span>
      </div>

      {/* Sync status */}
      <div className="flex items-center gap-1.5">
        {isSyncing ? (
          <>
            <IconLoader2 size={12} className="animate-spin text-green-500" />
            <span className="text-muted-foreground">Syncing...</span>
          </>
        ) : (
          <>
            <IconCheck size={12} className="text-green-500" />
            <span className="text-muted-foreground">Data synced</span>
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Apply the migration and verify**

Run: `npm run db:reset`

Expected: Migration applies, realtime is enabled on the listed tables.

Run: `npm run typecheck`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(realtime): add Supabase Realtime migration, useRealtimeSync hook, provider, and status indicator"
```

---

## Task 12: Wire Up Buyer Pages for Realtime

**Files:**
- Modify: `app/buyer/(shop)/layout.tsx`
- Create: `app/buyer/(shop)/orders/actions.ts`
- Modify: `app/buyer/(shop)/orders/page.tsx` (wrap in realtime)
- Create server actions for each buyer page that needs realtime

This task adds the `RealtimeProvider` and `RealtimeStatus` to the buyer shell, then wraps each buyer page's content in a client component that uses `useRealtimeSync`.

- [ ] **Step 1: Add `RealtimeProvider` and `RealtimeStatus` to `app/buyer/(shop)/layout.tsx`**

```tsx
import { getCurrentUser } from "@/lib/api/users"
import { LayoutBase } from "@/components/layouts/layout-base"
import { RealtimeProvider } from "@/components/realtime-provider"
import { RealtimeStatus } from "@/components/realtime-status"

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  return (
    <RealtimeProvider>
      <LayoutBase user={user}>{children}</LayoutBase>
      <RealtimeStatus />
    </RealtimeProvider>
  )
}
```

- [ ] **Step 2: Create `app/buyer/(shop)/orders/actions.ts` — server action for order refetch**

```tsx
"use server"

import { getCurrentUser } from "@/lib/api/users"
import { fetchOrderList, type Order } from "@/lib/api/orders"
import type { PaginatedResult } from "@/lib/api/helpers"

export async function refetchOrders(options: {
  page: number
  perPage: number
}): Promise<PaginatedResult<Order>> {
  const user = await getCurrentUser()
  return fetchOrderList(user.id, {
    page: options.page,
    perPage: options.perPage,
    perPageOptions: [20, 40, 60, 80, 100],
  })
}
```

- [ ] **Step 3: Wrap the orders page content in a realtime-aware client component**

The exact approach: extract the data-rendering portion of the orders page into a client component that receives the server data as `initialData` and uses `useRealtimeSync` to subscribe to changes.

In the orders page (`app/buyer/(shop)/orders/page.tsx`), keep the Server Component for fetching, but pass data to a new client wrapper component. The client wrapper calls `useRealtimeSync(initialData, "orders", refetchFn)` and renders the table with the live data.

This pattern is repeated for each buyer page. Create server actions and client wrappers for:
- Orders list
- Each product browse page (natural diamonds, lab-grown diamonds, gemstones, natural melee, lab-grown melee)
- Each jewelry browse page (engagement rings, wedding bands, tennis bracelets)
- Shortlists page

The shortlists and product detail pages follow the same pattern: server action for refetch, client wrapper with `useRealtimeSync`.

- [ ] **Step 4: Verify**

Run: `npm run typecheck && npm run build`

Start dev server with two browser tabs:
1. Tab 1: Buyer orders page (logged in as any user)
2. Tab 2: Admin area → create a new order for that user

Expected: After creating the order in admin, the buyer orders page should update within a few seconds without manual refresh. The status pill should briefly show "Syncing..." then return to "Data synced."

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(realtime): wire up buyer pages with realtime sync and status indicator"
```

---

## Task 13: Cross-tab User Switching

**Files:**
- Create: `app/api/v1/admin/impersonate/route.ts`
- Create: `components/admin/user-switcher.tsx`
- Modify: `components/admin/admin-header.tsx`
- Create: `components/broadcast-listener.tsx`
- Modify: `app/buyer/(shop)/layout.tsx`

- [ ] **Step 1: Create `app/api/v1/admin/impersonate/route.ts`**

This endpoint signs in as the target user using the Supabase service role key. It returns session tokens that the buyer tab uses to switch identity.

```tsx
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { withAdminAuth, isAdminAuthError } from "@/lib/api/admin/auth"
import { apiError } from "@/lib/api/response"
import { db } from "@/db/client"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  const auth = await withAdminAuth(request)
  if (isAdminAuthError(auth)) return auth

  const { userId } = (await request.json()) as { userId: string }
  if (!userId) {
    return apiError("INVALID_PARAMS", "userId is required", 400)
  }

  // Look up the target user's authUserId
  const [targetUser] = await db
    .select({ authUserId: users.authUserId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!targetUser?.authUserId) {
    return apiError(
      "NOT_FOUND",
      "User not found or has no auth account",
      404,
    )
  }

  // Use service role to get user details and generate a session
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Generate a magic link / sign-in link for the target user
  const { data, error } =
    await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: (
        await supabaseAdmin.auth.admin.getUserById(targetUser.authUserId)
      ).data.user?.email ?? "",
    })

  if (error || !data) {
    return apiError("INTERNAL", "Failed to generate session", 500)
  }

  return NextResponse.json({
    data: {
      // Return the hashed token for the buyer tab to use
      token_hash: data.properties?.hashed_token,
      email: data.properties?.email_data?.email,
    },
  })
}
```

Note: The exact impersonation mechanism depends on the Supabase Auth setup. The buyer-side component will use the token hash to verify the OTP and establish a session. An alternative approach is to use `supabaseAdmin.auth.admin.generateLink()` with type `magiclink` and then have the buyer tab call `supabase.auth.verifyOtp()` with the token.

- [ ] **Step 2: Create `components/admin/user-switcher.tsx`**

Dropdown in the admin header that selects the "active demo user" and broadcasts to the buyer tab.

```tsx
"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AdminUserItem } from "@/lib/api/admin/users"

interface UserSwitcherProps {
  users: AdminUserItem[]
  currentUserId?: string
}

export function UserSwitcher({ users, currentUserId }: UserSwitcherProps) {
  const [selectedUserId, setSelectedUserId] = useState(
    currentUserId ?? users[0]?.id ?? "",
  )

  function handleChange(userId: string) {
    setSelectedUserId(userId)

    // Broadcast to buyer tab via BroadcastChannel
    try {
      const channel = new BroadcastChannel("minivoda-admin")
      channel.postMessage({ type: "user-switched", userId })
      channel.close()
    } catch {
      // BroadcastChannel not supported — silent fallback
    }
  }

  const selected = users.find((u) => u.id === selectedUserId)

  return (
    <Select value={selectedUserId} onValueChange={handleChange}>
      <SelectTrigger className="w-56">
        <SelectValue>
          {selected
            ? `${selected.name ?? selected.email}`
            : "Select user..."}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            <div className="flex flex-col">
              <span>{user.name ?? user.email}</span>
              {user.name && (
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

- [ ] **Step 3: Update `components/admin/admin-header.tsx` to include the UserSwitcher**

```tsx
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { UserSwitcher } from "@/components/admin/user-switcher"
import type { AdminUserItem } from "@/lib/api/admin/users"

export function AdminHeader({
  userName,
  users,
  currentUserId,
}: {
  userName: string
  users: AdminUserItem[]
  currentUserId?: string
}) {
  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <Link href="/buyer/admin" className="text-lg font-semibold">
          Minivoda
        </Link>
        <Badge variant="secondary">Admin</Badge>
      </div>
      <div className="flex items-center gap-4">
        <UserSwitcher users={users} currentUserId={currentUserId} />
        <span className="text-sm text-muted-foreground">{userName}</span>
      </div>
    </header>
  )
}
```

Update `app/buyer/(admin)/admin/layout.tsx` to fetch users and pass them to AdminHeader.

- [ ] **Step 4: Create `components/broadcast-listener.tsx`**

Client component for the buyer tab that listens for user-switch messages.

```tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function BroadcastListener() {
  const router = useRouter()

  useEffect(() => {
    let channel: BroadcastChannel | null = null

    try {
      channel = new BroadcastChannel("minivoda-admin")
      channel.onmessage = async (event) => {
        if (event.data?.type === "user-switched") {
          const userId = event.data.userId

          // Call impersonate API to switch session
          const res = await fetch("/api/v1/admin/impersonate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.NEXT_PUBLIC_API_KEY ?? "",
            },
            body: JSON.stringify({ userId }),
          })

          if (res.ok) {
            // Force full page refresh to re-run server components with new session
            router.refresh()
          }
        }
      }
    } catch {
      // BroadcastChannel not supported
    }

    return () => {
      channel?.close()
    }
  }, [router])

  return null
}
```

- [ ] **Step 5: Add `BroadcastListener` to `app/buyer/(shop)/layout.tsx`**

Add `<BroadcastListener />` inside the `RealtimeProvider` in the shop layout.

- [ ] **Step 6: Verify**

Run: `npm run typecheck && npm run build`

Test with two tabs:
1. Admin tab: select a different user from the switcher
2. Buyer tab: should refresh and show data for the newly selected user

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(admin): add cross-tab user switching via BroadcastChannel and impersonate API"
```

---

## Task 14: Polish and Documentation

**Files:**
- Modify: `CLAUDE.md`
- Modify: `docs/api/README.md`

- [ ] **Step 1: Update `CLAUDE.md` route structure**

Update the file structure section to reflect the new route groups:

```
app/buyer/
  layout.tsx                  # Shared buyer layout (session only)
  (shop)/
    layout.tsx                # Buyer shell (LayoutBase + RealtimeProvider + RealtimeStatus)
    page.tsx                  # Buyer home
    browse/                   # Product browse pages
    orders/                   # Orders list + detail
    shortlists/               # Shortlists page
    finances/                 # Under construction
    settings/                 # Under construction
    ui-kitchen-sink/          # Component showcase
  (admin)/
    admin/
      layout.tsx              # Admin shell (header + sidebar, god-mode gate)
      page.tsx                # Redirects to /buyer/admin/orders
      orders/page.tsx         # Orders CRUD
      shortlists/page.tsx     # Shortlists CRUD
      invoices/page.tsx       # Invoices CRUD
      products/page.tsx       # Products CRUD
```

Also update the "Current Feature Status" section to list the admin area features as built.

- [ ] **Step 2: Update `docs/api/README.md` with admin endpoints**

Add a new "Admin API" section documenting all `/api/v1/admin/*` endpoints:
- Auth requirements (API key + Bearer token + admin role)
- Endpoints: orders, shortlists, invoices, products, lookups, users, impersonate
- Request/response shapes for each

- [ ] **Step 3: Final verification**

Run: `npm run typecheck && npm run build && npm run lint`

Fix any issues that arise.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md docs/api/README.md
git commit -m "docs: update CLAUDE.md and API docs for admin area"
```
