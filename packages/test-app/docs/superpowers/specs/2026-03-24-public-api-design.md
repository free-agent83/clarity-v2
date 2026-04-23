# Public REST API — Design Spec

**Date:** 2026-03-24
**Status:** Draft

## Overview

A versioned REST API (`/api/v1/`) exposed via Next.js Route Handlers that wraps the existing `lib/api/` data-access layer. Server Components continue calling `lib/api/` directly for SSR performance. The API serves client-side interactive features (search-as-you-type, filtering, cart mutations) and future clients (mobile app). Designed for eventual extraction into a standalone service.

### Versioning policy

The API is versioned via URL prefix (`/v1/`). Non-breaking changes (new fields, new optional params, new endpoints) are added to the current version without a bump. A `v2` is only created if a breaking change is unavoidable (removed fields, renamed endpoints, changed response shapes). For a prototype this is unlikely — the policy exists so consumers know what to expect.

## URL structure

All endpoints are prefixed with `/api/v1/`.

### URL parameter: `:id`

All detail endpoints use `:id` as the URL parameter. This is a UUID — the `products` table has no human-readable slug column. The Next.js dynamic segment is `[id]`, matching the existing page routes (which currently name their segment `[slug]` but pass a UUID). Example: `GET /api/v1/diamonds/a1b2c3d4-...`.

If human-readable slugs are added to the `products` table later, the API can accept either format and resolve accordingly. For now, it is always a UUID.

### Catalog (API key only)

```
GET /api/v1/diamonds?page=1&perPage=20
GET /api/v1/diamonds/:id

GET /api/v1/lab-grown-diamonds?page=1&perPage=20
GET /api/v1/lab-grown-diamonds/:id

GET /api/v1/gemstones?page=1&perPage=20
GET /api/v1/gemstones/:id

GET /api/v1/natural-melee?page=1&perPage=20
GET /api/v1/natural-melee/:id

GET /api/v1/lab-grown-melee?page=1&perPage=20
GET /api/v1/lab-grown-melee/:id

GET /api/v1/jewelry/engagement-rings?page=1&perPage=20
GET /api/v1/jewelry/engagement-rings/:id
GET /api/v1/jewelry/wedding-bands?page=1&perPage=20
GET /api/v1/jewelry/wedding-bands/:id
(additional subcategories follow the same pattern)
```

**Note on auth for catalog:** Catalog endpoints require only the API key, not a user session. This is intentional — product data is not user-specific. The web app's `/buyer/*` routes still enforce a session via middleware, but the API treats catalog data as accessible to any authenticated client application. This allows future consumers (public storefront, mobile app) to browse without a user login.

### Search (API key + session)

```
GET /api/v1/search/suggest?q=round+brilliant&limit=8
GET /api/v1/search?q=round+brilliant&type=all&sort=relevance&page=1&perPage=20
```

### Orders (API key + session)

```
GET /api/v1/orders?page=1&perPage=20
GET /api/v1/orders/:id
```

### Cart (API key + session)

```
GET    /api/v1/cart
POST   /api/v1/cart/items              { productId, quantity }
PATCH  /api/v1/cart/items/:id          { quantity }
DELETE /api/v1/cart/items/:id
DELETE /api/v1/cart/items?productId=x   (convenience: remove by product ID)
```

### Shortlists (API key + session)

```
GET    /api/v1/shortlists
POST   /api/v1/shortlists/items              { productId }
DELETE /api/v1/shortlists/items/:id
DELETE /api/v1/shortlists/items?productId=x   (convenience: remove by product ID)
```

### User-scoping rule

All session-authenticated endpoints are scoped to the authenticated user. The user ID from the session is passed to every `lib/api/` function and used in the `WHERE` clause. A user can never see or mutate another user's orders, cart, or shortlists. This requires modifying existing functions:

- `fetchOrderList()` and `fetchOrder()` — currently fetch all orders with no user filter. Must add `userId` parameter and filter on `orders.userId`.
- `fetchCart()` — already accepts `userId`. No change needed.
- `fetchShortlist()` — already accepts `userId`. No change needed.

### Cart and shortlist GET response shapes

The existing `fetchCart()` and `fetchShortlist()` return raw item references (just `productId`, `quantity`, `addedAt`) with no resolved product data. For the API to be useful to a UI, the GET endpoints must return resolved product information alongside each item:

```json
{
  "data": {
    "id": "cart-uuid",
    "items": [
      {
        "id": "cart-item-uuid",
        "quantity": 1,
        "addedAt": "2026-03-20T...",
        "product": {
          "id": "product-uuid",
          "title": "1.5ct Round Brilliant D VVS1",
          "image": "https://...",
          "price": 8500,
          "category": "diamonds"
        }
      }
    ]
  }
}
```

Shortlists follow the same pattern (minus `quantity`). This means `fetchCart()` and `fetchShortlist()` must be updated to join product data — at minimum the same slim shape used by list endpoints (title, primary image, price, category).

### New mutation functions needed

The existing `lib/api/` layer only has read functions for cart and shortlists. The following are net-new work (not wrappers around existing functions):

- **Cart:** `addCartItem(userId, productId, quantity)`, `updateCartItem(userId, itemId, quantity)`, `removeCartItem(userId, itemId)`, `removeCartItemByProduct(userId, productId)`. Includes auto-creating the cart if one does not exist for the user.
- **Shortlists:** `addShortlistItem(userId, productId)`, `removeShortlistItem(userId, itemId)`, `removeShortlistItemByProduct(userId, productId)`.

### User (API key + session)

```
GET /api/v1/me
GET /api/v1/me/addresses
```

## Authentication

Two-layer model. Every request requires both layers where applicable.

### Layer 1 — API key (every request)

Identifies the client application. Passed via `X-API-Key` header.

- Stored as an environment variable (`API_KEY`) for now.
- Missing or invalid key returns `401 { error: { code: "INVALID_API_KEY", message: "Valid API key required" } }`.
- When the API is extracted into its own service, this evolves into a table of keys with client metadata, rate limits, and scopes.

### Layer 2 — User session (authenticated endpoints)

Identifies the user. Passed via `Authorization: Bearer <supabase-access-token>`.

- Reuses the existing Supabase Auth flow. The client obtains the access token from the Supabase JS SDK and passes it in the header.
- Missing or invalid session on a protected endpoint returns `401 { error: { code: "UNAUTHORIZED", message: "Authentication required" } }`.

### Implementation

A shared `withApiAuth()` utility that every Route Handler calls:

```typescript
// Public endpoint (API key only)
const auth = await withApiAuth(request)

// User endpoint (API key + session)
const auth = await withApiAuth(request, { requireUser: true })
```

Returns `{ user: null }` for public endpoints or `{ user: AppUser }` for authenticated endpoints, or short-circuits with an error response.

Lives in `lib/api/auth.ts`.

**Important:** The existing `createClient()` in `lib/supabase/server.ts` reads the session from HTTP-only cookies set during the browser-based Supabase Auth flow. API clients (mobile, external) send a Bearer token in the `Authorization` header instead — they do not have these cookies. Therefore, `withApiAuth` cannot reuse the cookie-based client directly. Instead, it must:

1. Extract the access token from the `Authorization: Bearer <token>` header.
2. Create a Supabase client with the anon key and call `supabase.auth.getUser(accessToken)` to validate the token and retrieve the auth user.
3. Look up the corresponding app user in the `users` table by `authUserId`, reusing the same logic as `getCurrentUser()` but without cookie dependency.

This means a new Supabase client factory in `lib/supabase/api.ts` (or similar) that does not depend on `cookies()` from `next/headers`. The cookie-based client remains unchanged for Server Components.

## Response format

Consistent JSON envelope across all endpoints.

### Pagination constraints

- `perPage` has a maximum of 100. Requests exceeding this receive a `400` error.
- `perPage` defaults to 20 if omitted.
- `page` defaults to 1 if omitted. Values less than 1 are clamped to 1 silently (harmless correction). `perPage` over 100 returns a hard error rather than silent clamping, because silently returning fewer results than requested would confuse the client.

### Success — list

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "totalItems": 142,
    "totalPages": 8
  }
}
```

### Success — single item

```json
{
  "data": {}
}
```

### Success — mutation

```json
{
  "data": { "id": "..." },
  "message": "Item added to cart"
}
```

### Error

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Diamond not found"
  }
}
```

### HTTP status codes

| Status | When |
|--------|------|
| 200 | Successful read |
| 201 | Successful create (POST) |
| 400 | Bad request (invalid params, validation) |
| 401 | Not authenticated or invalid API key |
| 403 | Authenticated but not authorised |
| 404 | Resource not found |
| 500 | Unexpected server error |

### Implementation

Shared helpers in `lib/api/response.ts`:

- `apiSuccess(data, pagination?)` — wraps data in the success envelope.
- `apiCreated(data, message)` — 201 response with optional message.
- `apiError(code, message, status)` — wraps error in the error envelope.

## List vs detail response shapes

List endpoints and detail endpoints return different shapes for the same entity.

- **List (slim):** Only the fields needed to render a product card — id, title/description, primary image, price, key spec highlights (e.g., shape, carat, color for diamonds). This avoids eagerly loading all relations for every item in a paginated list.
- **Detail (full):** The complete resolved shape — all specs, all images, related configuration data. This is the existing `DiamondItem`, `GemstoneItem`, etc. shape that detail pages already consume.

Each `lib/api/` module defines both a `ListItem` type and a full `Item` type. The list query selects fewer columns and skips expensive joins (e.g., certifications, related items). The detail query loads everything.

This distinction improves list endpoint performance after the LIMIT/OFFSET migration and reduces payload sizes for mobile clients.

## Related items

The existing `fetchRelatedDiamonds(excludeId, limit)` pattern (present in every product module) is not exposed as a standalone API endpoint. Related items are a presentational concern served by the detail page's Server Component, which calls the function directly. If client-side navigation requires related items in the future, a `?related_to=<id>&limit=4` query param can be added to the list endpoint.

## Search

### Typeahead — `GET /api/v1/search/suggest`

Fires on keystrokes (debounced client-side, 200–300ms). Returns results grouped by entity type.

**Query params:**

| Param | Required | Description |
|-------|----------|-------------|
| `q` | Yes | Search term, min 2 characters. Missing or too-short `q` returns `400 { error: { code: "INVALID_QUERY", message: "Search query must be at least 2 characters" } }` |
| `limit` | No | Max results per entity type. Defaults to 8 |

**Response:**

```json
{
  "data": {
    "products": [
      { "id": "...", "title": "1.5ct Round Brilliant D VVS1", "subtitle": "GIA Certified", "category": "diamonds", "image": "...", "id": "..." }
    ],
    "orders": [
      { "id": "...", "title": "Order #12345", "status": "shipped", "id": "..." }
    ]
  }
}
```

Each entity type returns a slim, uniform shape — just enough to render a result row with a link. The typeahead UI groups these with section headers.

**Implementation:** `lib/api/search.ts` exposes `searchSuggest(query, limit)` which fans out queries to each entity's search logic in parallel and merges results. Each entity module exposes a lightweight search function (SQL `ILIKE` for phase 1).

### Full search — `GET /api/v1/search`

Hit when the user commits to a search (presses Enter, clicks "Search"). Returns rich results suitable for a dedicated search results page.

**Query params:**

| Param | Required | Description |
|-------|----------|-------------|
| `q` | Yes | Search term, min 2 characters. Same validation as typeahead. |
| `type` | No | Scope: `all` (default), `products`, `orders`. Future: `invoices`, etc. |
| `category` | No | When `type=products`, scope to a product category (e.g., `diamonds`) |
| `sort` | No | Sort order (e.g., `relevance`, `price_asc`, `price_desc`, `newest`) |
| `page` | No | Defaults to 1 |
| `perPage` | No | Defaults to 20 |

When scoped to `products`, the same category-specific filter params from the PLP endpoints apply. When scoped to `orders`, order-specific filters apply (status, date range).

**Response:** Same envelope as list endpoints — `data` array + `pagination`. Items use the full resolved shape for their entity type.

**Implementation:** `lib/api/search.ts` exposes `searchFull(query, type, filters, pagination)` which delegates to the appropriate entity module based on `type`.

### Extensibility

When new entities arrive (invoices, holds, memos), each registers a search function. The suggest endpoint adds a new section in the grouped response; the full search adds a new `type` value. The contract does not break.

## Filtering and sorting

All list endpoints accept filter and sort params as query parameters.

### Filter types by category

| Category | Filterable fields |
|----------|-------------------|
| Diamonds (natural + lab-grown) | shape, color, clarity, cut, polish, symmetry, fluorescence, carat range, price range, certification |
| Gemstones | type, shape, color, clarity, cut, treatment, origin, carat range, price range |
| Melee (natural + lab-grown) | shape, size range, color range, clarity range, cut, price range |
| Jewelry (engagement rings) | metal type, metal color, stone shape, band style, price range |

### Conventions

- **Multi-value filters** use comma-separated values: `color=D,E,F` means "D or E or F".
- **Range filters** use `_min` / `_max` suffixes: `carat_min=1.0&carat_max=2.0`.
- **Sorting** via a `sort` param: `price_asc`, `price_desc`, `carat_asc`, `carat_desc`, `newest`. Defaults to `newest` if omitted.

### Implementation

- A shared `parseFilters(searchParams, allowedFilters)` utility validates and sanitises filter params per category. Lives in `lib/api/filters.ts`.
- Filtering happens at the database level via Drizzle `where` clauses.
- Pagination moves from client-side (fetch-all-then-slice) to server-side (`LIMIT`/`OFFSET` in SQL). This is the largest refactoring effort — every product module's `resolveAll()` function must be rewritten to accept filters and pagination params and push them into the query.

## Jewelry generalisation

### Current state

The `jewelry` table already has a `jewelryTypeId` foreign key to the `jewelry_types` lookup, which is seeded with 7 types (Engagement Ring, Wedding Band, Cocktail Ring, Eternity Ring, Pendant, Earrings, Bracelet). However, the API layer (`lib/api/jewelry.ts`) and resolved type (`JewelryItem`) are hardcoded to engagement ring concerns.

### Schema changes

- Add a `slug` column to the `jewelry_types` lookup table (e.g., `"engagement-rings"`, `"wedding-bands"`). This maps URL segments to types without hardcoding UUIDs. Note: the current `lookupTable()` helper in `db/schema/lookups.ts` only generates `id`, `value`, and `sortOrder` columns. Since `slug` is only needed on `jewelry_types` (not all lookups), define the `jewelry_types` table separately rather than modifying the generic helper.
- Ring-specific tables (`ringConfigurations`, `jewelryAvailableShapes`) remain as-is — they are only populated for ring-type jewelry.
- Future subcategory-specific tables (e.g., `pendantDetails`, `braceletDetails`) follow the same pattern: optional one-to-many from `jewelry`, populated only for the relevant type.

### API layer refactoring

**Base type (slim):**

```typescript
interface JewelryItemBase {
  id: string
  sku: string
  description: string
  images: Record<string, string>  // deliberately loose — different jewelry types have different image sets
  naturalVariantPrice: number
  labgrownVariantPrice: number
}
```

**Subcategory extensions:**

```typescript
interface EngagementRingItem extends JewelryItemBase {
  bandStyle: { id: string; value: string }
  isLabgrown: boolean
  mounts: { id: string; metalWeight: number; metalKarat: string }[]
  ring: {
    color: { id: string; value: string }
    metalType: { id: string; value: string }
    metalQuality: { id: string; value: string }
    stoneShape: { id: string; value: string }
    ringWidth: number | null
    availableMetalTypes: { id: string; value: string; colors: { id: string; value: string }[] }[]
    availableStoneShapes: { id: string; value: string }[]
  }
}
```

Additional subcategory types (e.g., `WeddingBandItem`) extend `JewelryItemBase` with their own fields as they are built.

**Breaking change from current type:** The current `JewelryItem` interface nests `images` and prices inside the `ring` object. The new `JewelryItemBase` pulls them up to the top level, since images and prices are common to all jewelry, not ring-specific. This is an intentional restructuring. The existing Server Component pages under `app/buyer/browse/jewelry/engagement-rings/` must be updated to consume the new `EngagementRingItem` shape. This is part of the migration, not a separate task.

**Module structure:**

```
lib/api/jewelry/
  shared.ts              — base resolver, shared types, JewelryItemBase
  engagement-rings.ts    — EngagementRingItem type, ring-specific resolver
  wedding-bands.ts       — (future) WeddingBandItem type
  index.ts               — re-exports
```

Each subcategory module's `fetchList` function filters by `jewelryTypeSlug` and eagerly loads only the relations relevant to that type.

### Route structure

```
app/api/v1/jewelry/engagement-rings/
  route.ts               — GET handler for list
  [id]/route.ts          — GET handler for detail

app/api/v1/jewelry/wedding-bands/
  route.ts               — (future)
  [id]/route.ts          — (future)
```

## New shared utilities

| File | Purpose |
|------|---------|
| `lib/api/response.ts` | `apiSuccess()`, `apiCreated()`, `apiError()` — response envelope helpers |
| `lib/api/auth.ts` | `withApiAuth()` — two-layer auth wrapper |
| `lib/api/filters.ts` | `parseFilters()` — validates and sanitises filter query params per category |
| `lib/api/search.ts` | `searchSuggest()`, `searchFull()` — global search orchestration |

## Documentation

### Format

OpenAPI 3.1 specification as the source of truth, living at `docs/api/openapi.yaml`.

### What gets documented per endpoint

- URL, method, description
- Query params / request body with types and validation rules
- Response shape (success + error cases)
- Auth requirements (API key only vs API key + session)
- Example request and response

### Interactive docs

Swagger UI or Scalar served at `/api/docs` in development, generated from the OpenAPI spec.

### Enforcement

A CLAUDE.md rule requiring that any change to files in `app/api/` or `lib/api/` must include a corresponding update to the API documentation. This covers new endpoints, changed request/response shapes, and modified error codes.

### Sustainability for a solo developer

Manually maintaining an OpenAPI spec alongside code is high-friction. Consider generating the spec from TypeScript types using a pipeline like Zod schemas (for request validation) → `zod-to-openapi` (for spec generation). This would:

- Keep request validation and documentation in sync automatically.
- Eliminate the risk of the spec drifting from the implementation.
- Make Zod the single source of truth for request shapes, alongside Drizzle for database shapes.

The implementation plan should evaluate this approach versus manual maintenance and choose one.

## Key implementation notes

### Server-side pagination migration

The current `resolveAll()` → `paginate()` pattern fetches all rows into memory and slices. This must be replaced with proper SQL `LIMIT`/`OFFSET` queries with Drizzle `where` clauses for filters. This is the single largest piece of implementation work and affects every product module.

**Drizzle complexity note:** The current code uses `db.query.xxx.findMany({ with: { ... } })` — Drizzle's relational query builder. This supports `limit` and `offset`, but filtering on fields from eagerly-loaded relations (e.g., filtering diamonds by `shape.value = "Round"` where `shape` is a joined lookup table) is not straightforward with `findMany`. The likely approach is:

1. Switch to Drizzle's `select()` builder with explicit `innerJoin`/`leftJoin` for filtered list queries, keeping `findMany` for detail queries where you need full relation loading.
2. Alternatively, use a subquery to filter and paginate product IDs first, then load the full resolved shape for just those IDs.

Either approach is more code than a simple swap of `paginate()` for `LIMIT`/`OFFSET`. The implementation plan should account for this.

### Route Handler pattern

Each Route Handler is a thin wrapper:

```typescript
export async function GET(request: NextRequest) {
  const auth = await withApiAuth(request)
  if (auth instanceof Response) return auth

  const params = parseFilters(request.nextUrl.searchParams, DIAMOND_FILTERS)
  if (params instanceof Response) return params

  const result = await fetchDiamondList(params.filters, params.pagination)
  return apiSuccess(result.items, result.pagination)
}
```

No business logic in the handler. All logic stays in `lib/api/`.

### Dual consumption

Server Components call `lib/api/` directly (no HTTP overhead). Client components and external clients call the Route Handlers. Both paths use the same underlying functions. There is no logic duplication.

### CORS

If the API is consumed from a different origin (e.g., a separate mobile web view or a standalone frontend deployment), CORS headers are needed. Next.js Route Handlers do not set them by default.

For phase 1, the only consumer is the same-origin Next.js app, so CORS is not required. When an external consumer is added, CORS headers should be configured in a shared middleware or in a `route.ts` wrapper that sets `Access-Control-Allow-Origin`, `Access-Control-Allow-Headers` (including `X-API-Key` and `Authorization`), and `Access-Control-Allow-Methods`. This is deferred until needed.

### Rate limiting

No rate limiting in phase 1. The API key is a single shared value and the only consumers are first-party clients. When the API is extracted or opened to additional clients, rate limiting should be added per API key — either at the middleware level (Next.js middleware or a reverse proxy) or in the standalone service. The response envelope supports a future `429 Too Many Requests` status code.

### Extraction path

When the API is extracted into a standalone service:

1. `lib/api/` moves wholesale into the new service.
2. `db/schema/` and `db/client.ts` move with it.
3. Route Handlers are replaced by the new service's HTTP framework (Express, Hono, etc.).
4. The Next.js app switches from direct `lib/api/` calls to HTTP calls against the extracted service.
5. Auth moves from Supabase cookies to token-based verification.
