# Public REST API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a versioned REST API (`/api/v1/`) that exposes all existing data through Next.js Route Handlers, with filtering, search, and cart/shortlist mutations.

**Architecture:** Route Handlers are thin HTTP wrappers around the existing `lib/api/` layer. Server Components continue calling `lib/api/` directly. Two-layer auth (API key + Supabase session). Server-side pagination replaces client-side fetch-all-then-slice.

**Tech Stack:** Next.js 16 Route Handlers, Drizzle ORM, Supabase Auth, Zod (new dependency for request validation)

**Spec:** `docs/superpowers/specs/2026-03-24-public-api-design.md`

**Testing note:** This project has no test infrastructure (no vitest/jest). Each task uses `npm run typecheck` and `npm run build` for verification, plus manual `curl` commands against the dev server. Adding test infrastructure is out of scope for this plan.

---

## Phase 1: Foundation

Shared utilities that all Route Handlers depend on. Must be completed first.

### Task 1: Install Zod + add API_KEY env var

**Files:**
- Modify: `package.json` (add zod dependency)
- Modify: `.env.example` (add API_KEY)
- Create: `.env.development.local` entry (not committed)

- [ ] **Step 1: Install Zod**

```bash
npm install zod
```

- [ ] **Step 2: Add API_KEY to .env.example**

Add to `.env.example`:
```
API_KEY=your-api-key-here
```

Add to your local `.env.development.local`:
```
API_KEY=dev-api-key-12345
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "chore: add zod dependency and API_KEY env var"
```

---

### Task 2: Response envelope helpers

**Files:**
- Create: `lib/api/response.ts`

- [ ] **Step 1: Create response helpers**

Create `lib/api/response.ts`:

```typescript
import { NextResponse } from "next/server"

export interface ApiPagination {
  page: number
  perPage: number
  totalItems: number
  totalPages: number
}

export function apiSuccess<T>(data: T, pagination?: ApiPagination) {
  const body: { data: T; pagination?: ApiPagination } = { data }
  if (pagination) body.pagination = pagination
  return NextResponse.json(body, { status: 200 })
}

export function apiCreated<T>(data: T, message?: string) {
  const body: { data: T; message?: string } = { data }
  if (message) body.message = message
  return NextResponse.json(body, { status: 201 })
}

export function apiError(
  code: string,
  message: string,
  status: number,
) {
  return NextResponse.json({ error: { code, message } }, { status })
}
```

- [ ] **Step 2: Verify**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add lib/api/response.ts
git commit -m "feat: add API response envelope helpers"
```

---

### Task 3: Supabase API client (Bearer token)

**Files:**
- Create: `lib/supabase/api.ts`

The existing `lib/supabase/server.ts` depends on `cookies()` from `next/headers`. API clients send Bearer tokens instead. This new factory creates a Supabase client that validates a token from the `Authorization` header.

- [ ] **Step 1: Create the API client factory**

Create `lib/supabase/api.ts`:

```typescript
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Creates a Supabase client for API Route Handlers.
 * Unlike the server.ts client, this does NOT depend on cookies.
 * It validates the access token passed via Authorization header.
 */
export function createApiClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

- [ ] **Step 2: Verify**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/api.ts
git commit -m "feat: add Supabase API client factory for Bearer token auth"
```

---

### Task 4: Auth wrapper (withApiAuth)

**Files:**
- Create: `lib/api/auth.ts`

- [ ] **Step 1: Create the two-layer auth wrapper**

Create `lib/api/auth.ts`:

```typescript
import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/db/client"
import { users } from "@/db/schema"
import { createApiClient } from "@/lib/supabase/api"
import { apiError } from "./response"

type AppUser = typeof users.$inferSelect

interface AuthOptions {
  requireUser?: boolean
}

// Overloaded signatures for proper TypeScript narrowing
export async function withApiAuth(
  request: NextRequest,
  options: { requireUser: true },
): Promise<{ user: AppUser } | Response>
export async function withApiAuth(
  request: NextRequest,
  options?: AuthOptions,
): Promise<{ user: AppUser | null } | Response>
export async function withApiAuth(
  request: NextRequest,
  options?: AuthOptions,
): Promise<{ user: AppUser | null } | Response> {
  // Layer 1: API key validation
  const apiKey = request.headers.get("x-api-key")
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return apiError("INVALID_API_KEY", "Valid API key required", 401)
  }

  // Layer 2: User session (if required)
  if (!options?.requireUser) {
    return { user: null }
  }

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

  // Look up app user by auth user ID
  const [appUser] = await db
    .select()
    .from(users)
    .where(eq(users.authUserId, authData.user.id))
    .limit(1)

  if (!appUser) {
    return apiError("UNAUTHORIZED", "User account not found", 401)
  }

  return { user: appUser }
}

/**
 * Type guard: returns true if auth result is a Response (error).
 */
export function isAuthError(
  result: AuthResult | Response,
): result is Response {
  return result instanceof Response
}
```

- [ ] **Step 2: Verify**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add lib/api/auth.ts
git commit -m "feat: add two-layer API auth wrapper (API key + Bearer token)"
```

---

### Task 5: Pagination and filter utilities

**Files:**
- Modify: `lib/api/helpers.ts` (add server-side pagination types)
- Create: `lib/api/filters.ts`

- [ ] **Step 1: Add server-side pagination types to helpers.ts**

Add to `lib/api/helpers.ts` (keep existing `paginate` for backwards compatibility with Server Components that still use it):

```typescript
import { z } from "zod"

// ... existing PaginatedResult, PaginatedOptions, paginate() unchanged ...

/** Server-side pagination params parsed from query string */
export interface ServerPaginationParams {
  page: number
  perPage: number
  offset: number
}

/** Parse and validate pagination from URL search params */
export function parsePagination(
  searchParams: URLSearchParams,
): ServerPaginationParams | { error: string } {
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const rawPerPage = Number(searchParams.get("perPage"))
  const perPage = Number.isFinite(rawPerPage) ? Math.floor(rawPerPage) : 20

  if (perPage > 100) {
    return { error: "perPage must not exceed 100" }
  }
  if (perPage < 1) {
    return { error: "perPage must be at least 1" }
  }

  return {
    page,
    perPage,
    offset: (page - 1) * perPage,
  }
}
```

- [ ] **Step 2: Create lib/api/filters.ts**

Create `lib/api/filters.ts`:

```typescript
import { NextRequest } from "next/server"
import { apiError } from "./response"
import {
  parsePagination,
  type ServerPaginationParams,
} from "./helpers"

export interface FilterDefinition {
  /** Multi-value filter (comma-separated): shape=round,oval */
  multi?: string[]
  /** Range filter (min/max): carat_min=1.0&carat_max=2.0 */
  range?: string[]
  /** Sort values: price_asc, price_desc, newest */
  sortOptions?: string[]
}

export interface ParsedFilters {
  filters: Record<string, string | string[] | { min?: number; max?: number }>
  sort: string | null
  pagination: ServerPaginationParams
}

/**
 * Parse query params into validated filters + pagination.
 * Returns a Response (error) if validation fails.
 */
export function parseListParams(
  request: NextRequest,
  definition: FilterDefinition,
): ParsedFilters | Response {
  const sp = request.nextUrl.searchParams
  const pagination = parsePagination(sp)

  if ("error" in pagination) {
    return apiError("INVALID_PARAMS", pagination.error, 400)
  }

  const filters: ParsedFilters["filters"] = {}

  // Multi-value filters
  for (const key of definition.multi ?? []) {
    const value = sp.get(key)
    if (value) {
      filters[key] = value.split(",").map((v) => v.trim())
    }
  }

  // Range filters
  for (const key of definition.range ?? []) {
    const min = sp.get(`${key}_min`)
    const max = sp.get(`${key}_max`)
    if (min || max) {
      filters[key] = {
        min: min ? Number(min) : undefined,
        max: max ? Number(max) : undefined,
      }
    }
  }

  // Sort
  let sort: string | null = null
  const sortParam = sp.get("sort")
  if (sortParam) {
    if (definition.sortOptions?.includes(sortParam)) {
      sort = sortParam
    } else {
      return apiError(
        "INVALID_PARAMS",
        `Invalid sort option: ${sortParam}. Valid options: ${definition.sortOptions?.join(", ")}`,
        400,
      )
    }
  }

  return { filters, sort, pagination }
}
```

- [ ] **Step 3: Verify**

```bash
npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add lib/api/helpers.ts lib/api/filters.ts
git commit -m "feat: add server-side pagination and filter parsing utilities"
```

---

## Phase 2: Schema Changes + Jewelry Generalisation

### Task 6: Redefine jewelry_types with slug column

**Files:**
- Modify: `db/schema/lookups.ts` (remove `jewelryTypes` from generic lookup, define separately)
- Create migration via `npm run db:generate`
- Modify: `supabase/seed.sql` (add slug values)

- [ ] **Step 1: Redefine jewelry_types table**

In `db/schema/lookups.ts`, remove `jewelryTypes` from the generic `lookupTable()` exports and define it separately at the bottom of the file:

```typescript
import { pgTable, uuid, text, integer } from "drizzle-orm/pg-core"

// ... existing lookupTable helper and other exports unchanged ...

// Remove this line:
// export const jewelryTypes = lookupTable("jewelry_types")

// Add this separate definition:
export const jewelryTypes = pgTable("jewelry_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  value: text("value").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull(),
})
```

- [ ] **Step 2: Update seed.sql with slug values**

Update the `jewelry_types` inserts in `supabase/seed.sql` to include the slug column:

```sql
INSERT INTO public.jewelry_types VALUES ('a1000016-0001-4000-8000-000000000001', 'Engagement Ring', 'engagement-rings', 1);
INSERT INTO public.jewelry_types VALUES ('a1000016-0001-4000-8000-000000000002', 'Wedding Band', 'wedding-bands', 2);
INSERT INTO public.jewelry_types VALUES ('a1000016-0001-4000-8000-000000000003', 'Cocktail Ring', 'cocktail-rings', 3);
INSERT INTO public.jewelry_types VALUES ('a1000016-0001-4000-8000-000000000004', 'Eternity Ring', 'eternity-rings', 4);
INSERT INTO public.jewelry_types VALUES ('a1000016-0001-4000-8000-000000000005', 'Pendant', 'pendants', 5);
INSERT INTO public.jewelry_types VALUES ('a1000016-0001-4000-8000-000000000006', 'Earrings', 'earrings', 6);
INSERT INTO public.jewelry_types VALUES ('a1000016-0001-4000-8000-000000000007', 'Bracelet', 'bracelets', 7);
```

- [ ] **Step 3: Generate and apply migration**

```bash
npm run db:generate
npm run db:reset
```

Verify `db:reset` completes successfully (migrations + seed).

- [ ] **Step 4: Commit**

```bash
git add db/schema/lookups.ts supabase/migrations/ supabase/seed.sql
git commit -m "feat: add slug column to jewelry_types table"
```

---

### Task 7: Split jewelry API into subcategory modules

**Files:**
- Create: `lib/api/jewelry/shared.ts`
- Create: `lib/api/jewelry/engagement-rings.ts`
- Create: `lib/api/jewelry/index.ts`
- Delete: `lib/api/jewelry.ts` (replaced by directory)

The current `JewelryItem` interface nests images and prices inside `ring`. The new `JewelryItemBase` pulls them to the top level. This is a breaking change for the frontend pages (fixed in the next task).

- [ ] **Step 1: Create lib/api/jewelry/ directory and shared.ts**

Create `lib/api/jewelry/shared.ts` with the base type and shared image resolver:

```typescript
export interface JewelryItemBase {
  id: string
  sku: string
  description: string
  images: Record<string, string>
  naturalVariantPrice: number
  labgrownVariantPrice: number
}

/** Map image rows into a Record<string, string> keyed by imageType */
export function resolveImages(
  images: { imageType: string; url: string }[],
): Record<string, string> {
  const map: Record<string, string> = {}
  for (const img of images) {
    map[img.imageType] = img.url
  }
  return map
}
```

- [ ] **Step 2: Create lib/api/jewelry/engagement-rings.ts**

Move the engagement ring–specific logic from the old `lib/api/jewelry.ts` into this file. Key changes:
- Import `JewelryItemBase` and `resolveImages` from `./shared`
- Define `EngagementRingItem extends JewelryItemBase` with `bandStyle`, `isLabgrown`, `mounts`, `ring`
- Filter `resolveAll()` to only load items where `jewelryType.slug === "engagement-rings"`
- Pull `images`, `naturalVariantPrice`, `labgrownVariantPrice` up to the base level (out of `ring`)

The `resolveAll()` function body stays largely the same — the main change is the type restructuring and the jewelry type filter.

Exports:
- `EngagementRingItem` type
- `fetchEngagementRingList(options: PaginatedOptions)`
- `fetchEngagementRingItem(id: string)`
- `fetchRelatedEngagementRings(excludeId: string, limit?: number)`

- [ ] **Step 3: Create lib/api/jewelry/index.ts**

```typescript
export * from "./shared"
export * from "./engagement-rings"
```

- [ ] **Step 4: Delete lib/api/jewelry.ts**

Remove the old monolithic file now that it's been replaced by the directory.

- [ ] **Step 5: Update jewelry frontend pages for new types**

These pages import from `@/lib/api/jewelry` and must be updated simultaneously to avoid a broken build.

In `app/buyer/browse/jewelry/engagement-rings/page.tsx`:
- Change import from `JewelryItem` to `EngagementRingItem`
- Change `fetchJewelryList` to `fetchEngagementRingList`
- Update references to `item.ring.images` → `item.images`
- Update price references: `item.ring.naturalVariantPrice` → `item.naturalVariantPrice`

In `app/buyer/browse/jewelry/engagement-rings/[slug]/page.tsx`:
- Change imports to `fetchEngagementRingItem`, `fetchRelatedEngagementRings`, `EngagementRingItem`
- Update image/price references to top-level

Note: `jewelry-configuration.tsx` and `included-in-mount.tsx` do NOT import from `@/lib/api/jewelry` directly — they receive primitive props from the parent page. Confirm they still compile, but they should not need changes.

- [ ] **Step 6: Verify everything passes**

```bash
npm run typecheck
npm run build
```

- [ ] **Step 7: Commit as a single atomic change**

```bash
git add lib/api/jewelry/ app/buyer/browse/jewelry/
git rm lib/api/jewelry.ts
git commit -m "feat: split jewelry API into subcategory modules, update pages"
```

---

## Phase 3: First Catalog Endpoint (Template Pattern)

Build the complete pattern with diamonds, then replicate for other product types.

### Task 9: Refactor diamonds for server-side pagination + filters

**Files:**
- Modify: `lib/api/diamonds.ts`

This is the most complex task — converting `resolveAll()` (fetch-all-then-slice) to a server-side paginated, filterable query. The approach: use a subquery to filter and paginate product IDs, then load the full resolved shape for just those IDs.

- [ ] **Step 1: Define diamond filter constants**

Add to `lib/api/diamonds.ts`:

```typescript
import type { FilterDefinition } from "./filters"

export const DIAMOND_FILTERS: FilterDefinition = {
  multi: ["shape", "color", "clarity", "cut", "polish", "symmetry", "fluorescence", "certification"],
  range: ["carat", "price"],
  sortOptions: ["price_asc", "price_desc", "carat_asc", "carat_desc", "newest"],
}
```

- [ ] **Step 2: Add a slim DiamondListItem type**

```typescript
export interface DiamondListItem {
  id: string
  shape: string
  carat: number
  color: string
  clarity: string
  cut: string
  price: number
  pricePerCarat: number
  image: string
  description: string
}
```

- [ ] **Step 3: Implement fetchDiamondListFiltered()**

Add a new function that uses Drizzle's `select()` builder with explicit joins for filtering and LIMIT/OFFSET pagination. Keep the existing `fetchDiamondList()` working for Server Components that still use it (backwards compatibility during migration).

The function signature:

```typescript
export async function fetchDiamondListFiltered(
  filters: ParsedFilters["filters"],
  sort: string | null,
  pagination: ServerPaginationParams,
): Promise<{ items: DiamondListItem[]; totalItems: number }>
```

Implementation approach:
1. Start with `db.select().from(products)` joined to `diamonds`, `shapes`, `diamondColors`, `clarityGrades`, `cutGrades`, plus `productImages` for the main image
2. Add `.where()` clauses dynamically based on which filters are present
3. For multi-value filters (e.g., `shape=round,oval`), use `inArray()` on the lookup value
4. For range filters (e.g., `carat_min=1.0`), use `gte()`/`lte()` on the numeric column
5. Add `.orderBy()` based on `sort` param
6. Get total count with a separate count query (same where clauses, no limit/offset)
7. Apply `.limit(pagination.perPage).offset(pagination.offset)`
8. Map rows to `DiamondListItem`

- [ ] **Step 4: Verify**

```bash
npm run typecheck
```

- [ ] **Step 5: Commit**

```bash
git add lib/api/diamonds.ts
git commit -m "feat: add server-side filtered pagination for diamonds"
```

---

### Task 10: Diamonds Route Handlers

**Files:**
- Create: `app/api/v1/diamonds/route.ts`
- Create: `app/api/v1/diamonds/[id]/route.ts`

- [ ] **Step 1: Create the list handler**

Create `app/api/v1/diamonds/route.ts`:

```typescript
import { NextRequest } from "next/server"
import { withApiAuth, isAuthError } from "@/lib/api/auth"
import { parseListParams } from "@/lib/api/filters"
import { apiSuccess } from "@/lib/api/response"
import {
  fetchDiamondListFiltered,
  DIAMOND_FILTERS,
} from "@/lib/api/diamonds"

export async function GET(request: NextRequest) {
  const auth = await withApiAuth(request)
  if (isAuthError(auth)) return auth

  const parsed = parseListParams(request, DIAMOND_FILTERS)
  if (parsed instanceof Response) return parsed

  const { items, totalItems } = await fetchDiamondListFiltered(
    parsed.filters,
    parsed.sort,
    parsed.pagination,
  )

  return apiSuccess(items, {
    page: parsed.pagination.page,
    perPage: parsed.pagination.perPage,
    totalItems,
    totalPages: Math.ceil(totalItems / parsed.pagination.perPage),
  })
}
```

- [ ] **Step 2: Create the detail handler**

Create `app/api/v1/diamonds/[id]/route.ts`:

```typescript
import { NextRequest } from "next/server"
import { withApiAuth, isAuthError } from "@/lib/api/auth"
import { apiSuccess, apiError } from "@/lib/api/response"
import { fetchDiamondItem } from "@/lib/api/diamonds"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withApiAuth(request)
  if (isAuthError(auth)) return auth

  const { id } = await params
  const item = await fetchDiamondItem(id)

  if (!item) {
    return apiError("NOT_FOUND", "Diamond not found", 404)
  }

  return apiSuccess(item)
}
```

- [ ] **Step 3: Verify with dev server**

```bash
npm run dev
```

In another terminal:
```bash
# Should return 401 (no API key)
curl http://localhost:3000/api/v1/diamonds

# Should return data
curl -H "X-API-Key: dev-api-key-12345" http://localhost:3000/api/v1/diamonds
```

- [ ] **Step 4: Typecheck + build**

```bash
npm run typecheck && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add app/api/v1/diamonds/
git commit -m "feat: add diamonds API route handlers (list + detail)"
```

---

## Phase 4: Remaining Catalog Endpoints

Each task follows the same pattern as Task 9-10: add filter constants + `ListItem` type + `fetchListFiltered()` to the API module, then create route handlers.

**Important:** All tasks in this phase depend on the Drizzle query pattern established in Task 9. If the join/filter approach needs adjustment during Task 9 implementation, propagate the fix to all subsequent tasks. While these tasks touch independent modules, they are NOT safe to parallelise until Task 9's pattern is proven and stable.

### Task 11: Lab-grown diamonds API + routes

**Files:**
- Modify: `lib/api/lab-grown-diamonds.ts` — add `LAB_GROWN_DIAMOND_FILTERS`, `LabGrownDiamondListItem`, `fetchLabGrownDiamondListFiltered()`
- Create: `app/api/v1/lab-grown-diamonds/route.ts`
- Create: `app/api/v1/lab-grown-diamonds/[id]/route.ts`

Same filter set as natural diamonds. Same route handler pattern. Commit after verification.

---

### Task 12: Gemstones API + routes

**Files:**
- Modify: `lib/api/gemstones.ts` — add `GEMSTONE_FILTERS`, `GemstoneListItem`, `fetchGemstoneListFiltered()`
- Create: `app/api/v1/gemstones/route.ts`
- Create: `app/api/v1/gemstones/[id]/route.ts`

Filter set: type, shape, color, clarity, cut, treatment, origin, carat range, price range.

---

### Task 13: Natural melee API + routes

**Files:**
- Modify: `lib/api/natural-melee.ts` — add `NATURAL_MELEE_FILTERS`, `NaturalMeleeListItem`, `fetchNaturalMeleeListFiltered()`
- Create: `app/api/v1/natural-melee/route.ts`
- Create: `app/api/v1/natural-melee/[id]/route.ts`

Filter set: shape, size range, color range, clarity range, cut, price range.

---

### Task 14: Lab-grown melee API + routes

**Files:**
- Modify: `lib/api/lab-grown-melee.ts` — add `LAB_GROWN_MELEE_FILTERS`, `LabGrownMeleeListItem`, `fetchLabGrownMeleeListFiltered()`
- Create: `app/api/v1/lab-grown-melee/route.ts`
- Create: `app/api/v1/lab-grown-melee/[id]/route.ts`

Same filter set as natural melee.

---

### Task 15: Jewelry engagement rings API routes

**Files:**
- Modify: `lib/api/jewelry/engagement-rings.ts` — add `ENGAGEMENT_RING_FILTERS`, `EngagementRingListItem`, `fetchEngagementRingListFiltered()`
- Create: `app/api/v1/jewelry/engagement-rings/route.ts`
- Create: `app/api/v1/jewelry/engagement-rings/[id]/route.ts`

Filter set: metal type, metal color, stone shape, band style, price range.

---

### Task 16: Catalog phase verification + commit

- [ ] **Step 1: Full verification**

```bash
npm run typecheck && npm run build
```

- [ ] **Step 2: Smoke test all catalog endpoints**

```bash
API_KEY="dev-api-key-12345"
for path in diamonds lab-grown-diamonds gemstones natural-melee lab-grown-melee jewelry/engagement-rings; do
  echo "--- $path ---"
  curl -s -H "X-API-Key: $API_KEY" "http://localhost:3000/api/v1/$path?perPage=2" | head -c 200
  echo
done
```

---

## Phase 5: User-Scoped Endpoints

### Task 17: Fix orders to accept userId + server-side pagination + route handlers

**Files:**
- Modify: `lib/api/orders.ts` — add `userId` parameter, add `fetchOrderListFiltered()` with server-side pagination
- Create: `app/api/v1/orders/route.ts`
- Create: `app/api/v1/orders/[id]/route.ts`

- [ ] **Step 1: Add userId filtering to existing functions**

Modify `fetchOrderList` and `fetchOrder` to accept a `userId` parameter and add `eq(orders.userId, userId)` to the WHERE clause. This fixes the existing Server Component usage.

- [ ] **Step 2: Add fetchOrderListFiltered() with server-side pagination**

Add a new function analogous to the product modules:

```typescript
export async function fetchOrderListFiltered(
  userId: string,
  filters: ParsedFilters["filters"],
  sort: string | null,
  pagination: ServerPaginationParams,
): Promise<{ items: Order[]; totalItems: number }>
```

This uses LIMIT/OFFSET at the DB level rather than the client-side `paginate()` helper. Support filtering by `status` (multi-value) and `date_range` (min/max on `orderDate`).

- [ ] **Step 3: Update all Server Component callers**

Find all pages that call `fetchOrderList()` and `fetchOrder()` and pass the current user's ID. Check: `app/buyer/orders/page.tsx` and `app/buyer/orders/[slug]/page.tsx`.

- [ ] **Step 4: Create order route handlers**

`app/api/v1/orders/route.ts` — uses `fetchOrderListFiltered()` with server-side pagination.
`app/api/v1/orders/[id]/route.ts` — uses `fetchOrder(id, auth.user.id)`.

- [ ] **Step 5: Verify + commit**

```bash
npm run typecheck && npm run build
git add lib/api/orders.ts app/api/v1/orders/ app/buyer/orders/
git commit -m "feat: add user-scoped order API endpoints"
```

---

### Task 18: User + addresses route handlers

**Files:**
- Create: `app/api/v1/me/route.ts`
- Create: `app/api/v1/me/addresses/route.ts`

- [ ] **Step 1: Create /api/v1/me handler**

Returns the authenticated user's profile (excluding sensitive fields like authUserId).

```typescript
export async function GET(request: NextRequest) {
  const auth = await withApiAuth(request, { requireUser: true })
  if (isAuthError(auth)) return auth

  const { authUserId, ...profile } = auth.user
  return apiSuccess(profile)
}
```

- [ ] **Step 2: Create /api/v1/me/addresses handler**

```typescript
export async function GET(request: NextRequest) {
  const auth = await withApiAuth(request, { requireUser: true })
  if (isAuthError(auth)) return auth

  const addresses = await fetchAddresses(auth.user.id)
  return apiSuccess(addresses)
}
```

- [ ] **Step 3: Verify + commit**

```bash
npm run typecheck
git add app/api/v1/me/
git commit -m "feat: add user profile and addresses API endpoints"
```

---

### Task 19: Cart mutations + route handlers

**Files:**
- Modify: `lib/api/cart.ts` — add mutation functions, update `fetchCart` to resolve product data
- Create: `app/api/v1/cart/route.ts`
- Create: `app/api/v1/cart/items/route.ts`
- Create: `app/api/v1/cart/items/[id]/route.ts`

- [ ] **Step 1: Add cart mutation functions to lib/api/cart.ts**

Add these functions:

```typescript
export async function addCartItem(
  userId: string,
  productId: string,
  quantity: number,
): Promise<{ id: string }>

export async function updateCartItem(
  userId: string,
  itemId: string,
  quantity: number,
): Promise<void>

export async function removeCartItem(
  userId: string,
  itemId: string,
): Promise<void>

export async function removeCartItemByProduct(
  userId: string,
  productId: string,
): Promise<void>
```

`addCartItem` must auto-create the cart if one doesn't exist for the user (upsert pattern: find or insert cart, then insert item).

- [ ] **Step 2: Update fetchCart to resolve product data**

The existing `fetchCart` returns raw `cartItems` with just `productId`. Update it to join product data (at minimum: title via `products.description`, primary image URL, price, and product type/category).

- [ ] **Step 3: Create route handlers**

`app/api/v1/cart/route.ts` — GET handler (returns cart with resolved items)
`app/api/v1/cart/items/route.ts` — POST handler (add item) + DELETE handler (remove by productId query param)
`app/api/v1/cart/items/[id]/route.ts` — PATCH handler (update quantity) + DELETE handler (remove by item ID)

Use Zod for request body validation:
```typescript
import { z } from "zod"

const addItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
})

const updateItemSchema = z.object({
  quantity: z.number().int().positive(),
})
```

- [ ] **Step 4: Verify + commit**

```bash
npm run typecheck && npm run build
git add lib/api/cart.ts app/api/v1/cart/
git commit -m "feat: add cart API with mutations (add, update, remove)"
```

---

### Task 20: Shortlist mutations + route handlers

**Files:**
- Modify: `lib/api/shortlists.ts` — add mutation functions, update `fetchShortlist` to resolve product data
- Create: `app/api/v1/shortlists/route.ts`
- Create: `app/api/v1/shortlists/items/route.ts`
- Create: `app/api/v1/shortlists/items/[id]/route.ts`

Same pattern as cart but simpler (no quantity). Note: there is no `shortlists` container table in the schema — `shortlistItems` is a flat table with a direct `userId` FK. The `GET /api/v1/shortlists` response wraps these into a synthetic container: `{ data: { items: [...] } }` (no container ID).

- [ ] **Step 1: Add shortlist mutation functions**

```typescript
export async function addShortlistItem(userId: string, productId: string): Promise<{ id: string }>
export async function removeShortlistItem(userId: string, itemId: string): Promise<void>
export async function removeShortlistItemByProduct(userId: string, productId: string): Promise<void>
```

- [ ] **Step 2: Update fetchShortlist to resolve product data**

Same approach as cart — join product data for each shortlist item.

- [ ] **Step 3: Create route handlers**

Follow the same pattern as cart handlers.

- [ ] **Step 4: Verify + commit**

```bash
npm run typecheck && npm run build
git add lib/api/shortlists.ts app/api/v1/shortlists/
git commit -m "feat: add shortlist API with mutations (add, remove)"
```

---

## Phase 6: Search

### Task 21: Search suggest implementation

**Files:**
- Create: `lib/api/search.ts`
- Create: `app/api/v1/search/suggest/route.ts`

- [ ] **Step 1: Create lib/api/search.ts with searchSuggest()**

```typescript
import { db } from "@/db/client"
import { products, orders } from "@/db/schema"
import { ilike, and, isNull, eq } from "drizzle-orm"

interface SuggestResult {
  products: { id: string; title: string; subtitle: string; category: string; image: string }[]
  orders: { id: string; title: string; status: string }[]
}

export async function searchSuggest(
  query: string,
  userId: string | null,
  limit: number = 8,
): Promise<SuggestResult> {
  const pattern = `%${query}%`

  // Search products by description (always available)
  const productResults = await db
    .select({
      id: products.id,
      description: products.description,
      productType: products.productType,
    })
    .from(products)
    .where(
      and(
        ilike(products.description, pattern),
        isNull(products.deletedAt),
        eq(products.isActive, true),
      ),
    )
    .limit(limit)

  // Search orders by order number (only if user is authenticated)
  let orderResults: typeof orders.$inferSelect[] = []
  if (userId) {
    orderResults = await db
      .select()
      .from(orders)
      .where(
        and(
          ilike(orders.orderNumber, pattern),
          eq(orders.userId, userId),
          isNull(orders.deletedAt),
        ),
      )
      .limit(limit)
  }

  return {
    products: productResults.map((p) => ({
      id: p.id,
      title: p.description,
      subtitle: "",
      category: p.productType,
      image: "",
    })),
    orders: orderResults.map((o) => ({
      id: o.id,
      title: `Order #${o.orderNumber}`,
      status: o.status,
    })),
  }
}
```

Note: the product suggest results are slim — we join product images in a follow-up query or accept the performance trade-off for the suggest endpoint. For phase 1, returning the description and product type is sufficient.

- [ ] **Step 2: Create route handler**

`app/api/v1/search/suggest/route.ts`:

The suggest endpoint requires only the API key — product search is public. If a valid user session is also present, order results are included. This matches catalog endpoints being API-key-only.

```typescript
export async function GET(request: NextRequest) {
  // API key only — session is optional (for order search)
  const auth = await withApiAuth(request)
  if (isAuthError(auth)) return auth

  // Optionally extract user for order search
  const userId = await extractOptionalUserId(request) // helper that returns string | null

  const q = request.nextUrl.searchParams.get("q") ?? ""
  if (q.length < 2) {
    return apiError("INVALID_QUERY", "Search query must be at least 2 characters", 400)
  }

  const limit = Number(request.nextUrl.searchParams.get("limit")) || 8
  const results = await searchSuggest(q, userId, limit)

  return apiSuccess(results)
}
```

Add `extractOptionalUserId(request)` as a helper in `lib/api/auth.ts` — tries to read and validate the Bearer token, returns the user ID if valid, `null` if missing or invalid (never errors).

- [ ] **Step 3: Verify + commit**

```bash
npm run typecheck
git add lib/api/search.ts app/api/v1/search/
git commit -m "feat: add search suggest endpoint (ILIKE across products and orders)"
```

---

### Task 22: Search full implementation + route handler

**Files:**
- Modify: `lib/api/search.ts` — add `searchFull()`
- Create: `app/api/v1/search/route.ts`

- [ ] **Step 1: Add searchFull() to lib/api/search.ts**

```typescript
interface SearchFullResult {
  items: Array<
    | { resultType: "product"; data: DiamondListItem | GemstoneListItem | /* etc */ }
    | { resultType: "order"; data: Order }
  >
  totalItems: number
}

export async function searchFull(
  query: string,
  userId: string | null,
  type: "all" | "products" | "orders",
  category: string | null,
  sort: string | null,
  pagination: ServerPaginationParams,
): Promise<SearchFullResult>
```

**When `type === "products"` (or `type === "all"`):**
- If `category` is specified (e.g., `diamonds`), call the corresponding module's `fetchListFiltered()` with the search query added as an extra filter on `products.description ILIKE pattern`
- If `category` is null, search across all product types using a unified query on the `products` table, returning the slim `ListItem` shape for each
- Apply LIMIT/OFFSET pagination

**When `type === "orders"` (or `type === "all"`):**
- Requires `userId` (skip if null — unauthenticated users get no order results)
- Search by `orderNumber ILIKE pattern`
- Return full `Order` shape
- Apply LIMIT/OFFSET pagination

**When `type === "all"` — cross-entity pagination strategy:**
- Run two count queries in parallel: total matching products + total matching orders
- `totalItems` = sum of both counts
- For pagination, products come first. If `offset < totalProducts`, fetch products with adjusted limit. Fill remaining slots with orders.
- This produces stable, predictable pagination where products always precede orders.
- Each result item is tagged with `resultType` so the client knows how to render it.

- [ ] **Step 2: Create route handler**

`app/api/v1/search/route.ts`:
- Parse `q`, `type` (default: `all`), `category`, `sort`, `page`, `perPage` from query params
- Validate: `q` length >= 2, `type` is one of `all|products|orders`
- API-key-only auth; optionally extract user ID for order search (same pattern as suggest)
- Call `searchFull()` with all parsed params
- Return with standard pagination envelope

- [ ] **Step 3: Verify + commit**

```bash
npm run typecheck && npm run build
git add lib/api/search.ts app/api/v1/search/route.ts
git commit -m "feat: add full search endpoint with cross-entity pagination"
```

---

## Phase 7: Documentation + Project Config

### Task 23: Update CLAUDE.md with API documentation rule

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add API documentation section to CLAUDE.md**

Add after the "Database Workflow" section:

```markdown
## API Documentation

Any change to files in `app/api/` or `lib/api/` must include a corresponding update to the API documentation in `docs/api/`. This includes:
- New endpoints
- Changed request/response shapes
- Modified error codes
- Changed authentication requirements

The API documentation is the contract for mobile and external consumers. Keeping it in sync is not optional.
```

- [ ] **Step 2: Add API route structure to the file structure section**

Update the file structure in CLAUDE.md to include:

```
app/
  api/
    v1/
      diamonds/             # GET list + GET [id] detail
      lab-grown-diamonds/   #   "
      gemstones/            #   "
      natural-melee/        #   "
      lab-grown-melee/      #   "
      jewelry/
        engagement-rings/   # GET list + GET [id] detail
      orders/               # GET list + GET [id] detail (authenticated)
      cart/                 # GET + POST/PATCH/DELETE items (authenticated)
      shortlists/           # GET + POST/DELETE items (authenticated)
      search/               # GET full search
        suggest/            # GET typeahead
      me/                   # GET profile
        addresses/          # GET addresses
```

- [ ] **Step 3: Add to the architecture section**

Add note about the API layer:
```markdown
- **REST API** — Versioned under `/api/v1/`. Route Handlers in `app/api/` are thin wrappers around `lib/api/` functions. Two-layer auth: API key (`X-API-Key` header) on every request, Supabase Bearer token for user-specific endpoints. Server Components continue calling `lib/api/` directly.
```

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add API documentation requirements and route structure to CLAUDE.md"
```

---

### Task 24: Create initial API documentation

**Files:**
- Create: `docs/api/README.md`

- [ ] **Step 1: Write API docs**

Create `docs/api/README.md` documenting:
- Base URL and versioning
- Authentication (API key + Bearer token)
- Response format (success, error, pagination)
- All endpoints with request/response examples
- Filter parameters per category
- Error codes

This is a markdown document (not OpenAPI for now).

**Zod-to-OpenAPI evaluation (spec requirement):** The spec asked whether to use `zod-to-openapi` for auto-generated specs. Trade-offs:
- **Pro:** Keeps request validation and docs in sync automatically; eliminates drift risk.
- **Con:** Requires defining all request/response shapes as Zod schemas (significant upfront work); adds a build step; the API is still evolving rapidly and schema changes would need updating in two places (Drizzle types + Zod schemas).
- **Decision:** Start with manual markdown documentation for phase 1. Once the API shape stabilises (after all endpoints are built and tested), evaluate adding Zod schemas for request validation (which is valuable independently) and then layering `zod-to-openapi` on top. This avoids premature investment in auto-generation while the API is still in flux.

- [ ] **Step 2: Commit**

```bash
git add docs/api/
git commit -m "docs: add initial REST API documentation"
```

- [ ] **Step 3: Final verification**

```bash
npm run typecheck && npm run build && npm run lint
```

Note: The API uses Bearer tokens, not cookies, so the middleware matcher stays as `/buyer/:path*` only — no changes needed to `middleware.ts`.

---

## Task Dependency Graph

```
Phase 1 (Foundation):
  Task 1 (Zod + env) ──┐
  Task 2 (response) ───┤
  Task 3 (supabase) ───┼── Task 4 (auth) ── Task 5 (filters)
                        │
Phase 2 (Schema + Jewelry):
  Task 6 (jewelry_types slug) ── Task 7 (split jewelry + fix pages)
                        │
Phase 3 (Template):     │
  Task 5 ───── Task 9 (diamonds refactor) ── Task 10 (diamonds routes)
                        │
Phase 4 (Catalog):      │
  Task 9 pattern proven ─── Tasks 11-15 (remaining products, sequential)
                             Task 16 (verification)
                        │
Phase 5 (User-scoped):  │
  Task 4 ──── Task 17 (orders) ── Task 18 (user) ── Task 19 (cart) ── Task 20 (shortlists)
                        │
Phase 6 (Search):       │
  Task 4 + Task 9 ── Task 21 (suggest) ── Task 22 (full search)
                        │
Phase 7 (Docs):         │
  All above ── Task 23 (CLAUDE.md) ── Task 24 (API docs + final check)
```

**Parallelisation notes:**
- Tasks 11–15 touch independent modules but ALL depend on the Drizzle query pattern from Task 9. Run them sequentially until the pattern is proven, then they can be parallelised.
- Phase 2 and Phase 1 can run in parallel (no dependencies between them), but Phase 2 alone does not produce a testable API endpoint.
- Phases 5 and 6 can run in parallel with Phase 4 (different endpoint domains).
