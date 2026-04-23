# Minivoda REST API

Version: `v1`
Base path: `/api/v1`

---

## Versioning

All endpoints are prefixed with `/api/v1`. Breaking changes will increment the version. Non-breaking additions (new optional fields, new endpoints) are made in-place without a version bump.

---

## Authentication

Every request must include an API key. Some endpoints additionally require a user session token.

### Layer 1 — API key (all endpoints)

```
X-API-Key: <api-key>
```

Missing or invalid key returns `401 INVALID_API_KEY`.

### Layer 2 — Bearer token (user-specific endpoints)

User-specific endpoints (orders, cart, shortlists, me) require a Supabase session token in addition to the API key:

```
Authorization: Bearer <supabase-access-token>
```

Missing or expired token returns `401 UNAUTHORIZED`.

### Which endpoints need which

| Auth level | Endpoints |
|---|---|
| API key only | All catalog endpoints, search, suggest |
| API key + Bearer | Orders, Cart, Shortlists, Me, Addresses |
| API key + Bearer + admin role | All `/admin/*` endpoints |

---

## Response Format

### Success — list with pagination

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "totalItems": 142,
    "totalPages": 8
  }
}
```

### Success — single item or mutation

```json
{
  "data": { ... }
}
```

Mutations that return no meaningful body return `"data": null`.

### Success — created resource (HTTP 201)

```json
{
  "data": { "id": "uuid" },
  "message": "optional message"
}
```

### Error

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description"
  }
}
```

### HTTP status codes

| Status | Meaning |
|---|---|
| `200` | Success |
| `201` | Resource created |
| `400` | Bad request (invalid params, invalid body) |
| `401` | Authentication failure (missing/invalid API key or Bearer token) |
| `404` | Resource not found |

### Error codes

| Code | Meaning |
|---|---|
| `INVALID_API_KEY` | Missing or incorrect `X-API-Key` header |
| `UNAUTHORIZED` | Missing, invalid, or expired Bearer token |
| `NOT_FOUND` | Requested resource does not exist |
| `INVALID_PARAMS` | Query parameter validation failure |
| `INVALID_QUERY` | Search query too short (minimum 2 characters) |
| `INVALID_BODY` | Request body is not valid JSON |

---

## Pagination

Pagination params apply to all list endpoints.

| Param | Type | Default | Max | Description |
|---|---|---|---|---|
| `page` | integer | `1` | — | Page number (1-indexed) |
| `perPage` | integer | `20` | `100` | Items per page |

Response always includes a `pagination` object with `page`, `perPage`, `totalItems`, and `totalPages`.

---

## Filtering

### Multi-value filters

Pass comma-separated values. The filter matches any item that equals one of the supplied values (OR logic).

```
?shape=round,oval&color=D,E,F
```

### Range filters

Pass `{field}_min` and/or `{field}_max`. Both are optional; omitting one side leaves that bound open.

```
?carat_min=1.0&carat_max=2.5&price_min=5000
```

### Sorting

Pass a single `sort` value from the endpoint's documented options. Invalid values return `400 INVALID_PARAMS`.

```
?sort=price_asc
```

---

## Catalog

### Diamonds (Natural)

Both natural and lab-grown diamonds are served by the same unified API module. The `labGrown` field in responses indicates the origin. Natural diamonds are returned from `/api/v1/diamonds`; lab-grown diamonds from `/api/v1/lab-grown-diamonds`.

#### List

```
GET /api/v1/diamonds
```

Auth: API key

**Query params**

| Param | Type | Description |
|---|---|---|
| `shape` | multi | e.g. `round,oval,princess` |
| `color` | multi | e.g. `D,E,F,G` |
| `clarity` | multi | e.g. `VVS1,VVS2,VS1` |
| `cut` | multi | e.g. `Excellent,Very Good` |
| `polish` | multi | e.g. `Excellent,Very Good` |
| `symmetry` | multi | e.g. `Excellent,Very Good` |
| `fluorescence` | multi | e.g. `None,Faint` |
| `certification` | multi | e.g. `GIA,IGI` |
| `carat_min` | number | Minimum carat weight |
| `carat_max` | number | Maximum carat weight |
| `price_min` | number | Minimum price (USD) |
| `price_max` | number | Maximum price (USD) |
| `sort` | string | `price_asc`, `price_desc`, `carat_asc`, `carat_desc`, `newest` |

**Response `data` item shape**

```json
{
  "id": "uuid",
  "shape": "Round",
  "carat": 1.25,
  "color": "E",
  "clarity": "VS1",
  "cut": "Excellent",
  "price": 8500.00,
  "pricePerCarat": 6800.00,
  "image": "https://...",
  "description": "1.25ct Round E VS1"
}
```

#### Detail

```
GET /api/v1/diamonds/:id
```

Auth: API key

**Response `data` shape**

```json
{
  "id": "uuid",
  "stockId": "STK-001",
  "shape": "Round",
  "carat": 1.25,
  "color": "E",
  "clarity": "VS1",
  "cut": "Excellent",
  "polish": "Excellent",
  "symmetry": "Excellent",
  "fluorescence": "None",
  "certification": {
    "lab": "GIA",
    "number": "1234567890",
    "pdfUrl": "https://..."
  },
  "dimensions": { "length": 6.98, "width": 6.95, "depth": 4.28 },
  "tablePct": 57.0,
  "depthPct": 61.5,
  "price": 8500.00,
  "pricePerCarat": 6800.00,
  "description": "1.25ct Round E VS1",
  "images": {
    "main": "https://...",
    "additional": ["https://...", "https://..."]
  }
}
```

Note: `certification.pdfUrl` is `null` when no certificate PDF is available. Images are resolved from `productImages`; the thumbnail (`isThumbnail: true`) becomes `main` and remaining images (sorted by `sortOrder`) become `additional`. Images no longer carry an `imageType` field.

**Errors**

| Code | Status | Condition |
|---|---|---|
| `NOT_FOUND` | 404 | No diamond with this ID |

---

### Lab-Grown Diamonds

#### List

```
GET /api/v1/lab-grown-diamonds
```

Auth: API key

Same filter params and sort options as natural diamonds (`shape`, `color`, `clarity`, `cut`, `polish`, `symmetry`, `fluorescence`, `certification`, `carat_min/max`, `price_min/max`).

**Response `data` item shape** — identical to natural diamond list item.

#### Detail

```
GET /api/v1/lab-grown-diamonds/:id
```

Auth: API key

**Response `data` shape** — identical to natural diamond detail shape.

**Errors**

| Code | Status | Condition |
|---|---|---|
| `NOT_FOUND` | 404 | No lab-grown diamond with this ID |

---

### Gemstones

Cut grades, treatments, and origins are stored in gemstone-specific lookup tables (`gemstoneCutGrades`, `gemstoneTreatments`, `gemstoneOrigins`) — not shared with diamond lookups. `pricePerCarat` is sourced from the gemstone detail record, not the product base.

#### List

```
GET /api/v1/gemstones
```

Auth: API key

**Query params**

| Param | Type | Description |
|---|---|---|
| `type` | multi | e.g. `Ruby,Emerald,Sapphire` |
| `shape` | multi | e.g. `oval,cushion` |
| `color` | multi | Free text color values (case-insensitive partial match) |
| `clarity` | multi | Free text clarity values (case-insensitive partial match) |
| `cut` | multi | e.g. `Excellent,Very Good` (matched against `gemstoneCutGrades`) |
| `treatment` | multi | e.g. `None,Heat` (matched against `gemstoneTreatments`) |
| `origin` | multi | e.g. `Burma,Ceylon` (matched against `gemstoneOrigins`) |
| `carat_min` | number | Minimum carat weight |
| `carat_max` | number | Maximum carat weight |
| `price_min` | number | Minimum price (USD) |
| `price_max` | number | Maximum price (USD) |
| `sort` | string | `price_asc`, `price_desc`, `carat_asc`, `carat_desc`, `newest` |

**Response `data` item shape**

```json
{
  "id": "uuid",
  "type": "Ruby",
  "shape": "Oval",
  "carat": 2.10,
  "color": "Vivid Red",
  "clarity": "Eye Clean",
  "cut": "Excellent",
  "price": 12000.00,
  "pricePerCarat": 5714.29,
  "image": "https://...",
  "description": "2.10ct Burma Ruby Oval"
}
```

#### Detail

```
GET /api/v1/gemstones/:id
```

Auth: API key

**Response `data` shape**

```json
{
  "id": "uuid",
  "stockId": "STK-002",
  "type": "Ruby",
  "shape": "Oval",
  "carat": 2.10,
  "color": "Vivid Red",
  "clarity": "Eye Clean",
  "cut": "Excellent",
  "treatment": "None",
  "origin": "Burma",
  "certification": {
    "lab": "GRS",
    "number": "GRS2024-001",
    "pdfUrl": null
  },
  "dimensions": { "length": 9.2, "width": 7.1, "depth": 4.8 },
  "price": 12000.00,
  "pricePerCarat": 5714.29,
  "description": "2.10ct Burma Ruby Oval",
  "images": {
    "main": "https://...",
    "additional": ["https://..."]
  }
}
```

Note: `pricePerCarat` is sourced from `gemstones.pricePerCaratUsd` (not `products.priceUsd`).

**Errors**

| Code | Status | Condition |
|---|---|---|
| `NOT_FOUND` | 404 | No gemstone with this ID |

---

### Natural Melee

Both natural and lab-grown melee are served by the same unified melee API module. Natural melee is returned from `/api/v1/natural-melee`; lab-grown melee from `/api/v1/lab-grown-melee`.

#### List

```
GET /api/v1/natural-melee
```

Auth: API key

**Query params**

| Param | Type | Description |
|---|---|---|
| `shape` | multi | e.g. `Round,Princess` |
| `sizeRange` | multi | Free text size range values (case-insensitive partial match) |
| `colorRange` | multi | Free text color range values (case-insensitive partial match) |
| `clarityRange` | multi | Free text clarity range values (case-insensitive partial match) |
| `cut` | multi | e.g. `Excellent,Very Good` |
| `price_min` | number | Minimum total price (USD) |
| `price_max` | number | Maximum total price (USD) |
| `sort` | string | `price_asc`, `price_desc`, `newest` |

**Response `data` item shape**

```json
{
  "id": "uuid",
  "shape": "Round",
  "sizeRange": "1.3-1.4mm",
  "colorRange": "D-F",
  "clarityRange": "VVS",
  "cut": "Excellent",
  "totalCaratWeight": 1.50,
  "pricePerCarat": 800.00,
  "totalPrice": 1200.00,
  "image": "https://...",
  "description": "Natural Melee Round 1.3-1.4mm D-F VVS"
}
```

#### Detail

```
GET /api/v1/natural-melee/:id
```

Auth: API key

**Response `data` shape**

```json
{
  "id": "uuid",
  "stockId": "STK-003",
  "shape": "Round",
  "sizeRange": "1.3-1.4mm",
  "colorRange": "D-F",
  "clarityRange": "VVS",
  "cut": "Excellent",
  "quantity": 100,
  "totalCaratWeight": 1.50,
  "pricePerCarat": 800.00,
  "totalPrice": 1200.00,
  "description": "Natural Melee Round 1.3-1.4mm D-F VVS",
  "images": {
    "main": "https://...",
    "additional": []
  }
}
```

Note: `pricePerCarat` is derived at query time as `priceUsd / totalCaratWeight`. It is not stored on the product record.

**Errors**

| Code | Status | Condition |
|---|---|---|
| `NOT_FOUND` | 404 | No natural melee lot with this ID |

---

### Lab-Grown Melee

#### List

```
GET /api/v1/lab-grown-melee
```

Auth: API key

Same filter params and sort options as natural melee (`shape`, `sizeRange`, `colorRange`, `clarityRange`, `cut`, `price_min/max`).

**Response `data` item shape** — identical to natural melee list item.

#### Detail

```
GET /api/v1/lab-grown-melee/:id
```

Auth: API key

**Response `data` shape** — identical to natural melee detail shape.

**Errors**

| Code | Status | Condition |
|---|---|---|
| `NOT_FOUND` | 404 | No lab-grown melee lot with this ID |

---

### Engagement Rings

#### List

```
GET /api/v1/jewelry/engagement-rings
```

Auth: API key

**Query params**

| Param | Type | Description |
|---|---|---|
| `metal` | multi | e.g. `14k_yellow_gold,18k_white_gold,950_platinum` |
| `stoneShape` | multi | e.g. `round,oval,cushion` |
| `bandStyle` | multi | e.g. `Solitaire,Pave` |
| `price_min` | number | Minimum price (USD) |
| `price_max` | number | Maximum price (USD) |
| `sort` | string | `price_asc`, `price_desc`, `newest` |

Note: `metal` and `stoneShape` are many-to-many filters — a ring qualifies if it has any matching available option, not just its default configuration.

**Response `data` item shape**

```json
{
  "id": "uuid",
  "sku": "ER-001",
  "description": "Classic Solitaire Engagement Ring",
  "bandStyle": "Solitaire",
  "image": "https://...",
  "minPriceUsd": 2500.00,
  "availableMetalTypes": [],
  "availableStoneShapes": []
}
```

Note: `availableMetalTypes` and `availableStoneShapes` are populated in the full detail response. The list response returns empty arrays for these fields to keep the list query lightweight. `minPriceUsd` is the base product price. There is no longer a `naturalVariantPrice` / `labgrownVariantPrice` split — pricing is per metal configuration (see detail).

#### Detail

```
GET /api/v1/jewelry/engagement-rings/:id
```

Auth: API key

**Response `data` shape**

```json
{
  "id": "uuid",
  "sku": "ER-001",
  "description": "Classic Solitaire Engagement Ring",
  "images": [
    { "url": "https://...", "sortOrder": 0, "isThumbnail": true },
    { "url": "https://...", "sortOrder": 1, "isThumbnail": false }
  ],
  "bandStyle": { "id": "uuid", "value": "Solitaire" },
  "ringWidthMm": 2.0,
  "availableMetals": [
    {
      "id": "uuid",
      "metal": { "id": "uuid", "value": "18k_yellow_gold" },
      "priceUsd": 2500.00
    },
    {
      "id": "uuid",
      "metal": { "id": "uuid", "value": "18k_white_gold" },
      "priceUsd": 2600.00
    },
    {
      "id": "uuid",
      "metal": { "id": "uuid", "value": "950_platinum" },
      "priceUsd": 3200.00
    }
  ],
  "compatibleStones": [
    {
      "id": "uuid",
      "shape": { "id": "uuid", "value": "Round" },
      "maxCarat": 2.0
    },
    {
      "id": "uuid",
      "shape": { "id": "uuid", "value": "Oval" },
      "maxCarat": 1.5
    }
  ]
}
```

**Fields removed from previous version:** `mounts`, `ringConfigurations`, `naturalVariantPrice`, `labgrownVariantPrice`, `isLabgrown`, `ring.availableMetalTypes`, `ring.availableStoneShapes`, `ring.color`, `ring.metalType`, `ring.metalQuality`, `ring.stoneShape`, `ring.ringWidth`, `stones`, `configurationImages`.

**Fields added:** `availableMetals` (array of per-configuration price entries), `compatibleStones` (stone shape + maxCarat filter rules), `ringWidthMm`.

**Errors**

| Code | Status | Condition |
|---|---|---|
| `NOT_FOUND` | 404 | No engagement ring with this ID |

---

### Wedding Bands

Wedding bands are a standalone catalog category backed by the `wedding_bands` table (previously a subcategory under the `jewelry` parent table, which has been dropped).

```
GET /api/v1/jewelry/wedding-bands
GET /api/v1/jewelry/wedding-bands/:id
```

Auth: API key

Available metals are stored in the `wedding_band_available_metals` junction table. Response shapes follow the same pattern as engagement rings: list returns a lightweight summary; detail returns the full record with `availableMetals` and product images.

**`productCategory` slug:** `wedding_band`

---

### Tennis Bracelets

Tennis bracelets are a standalone catalog category backed by the `tennis_bracelets` table.

```
GET /api/v1/jewelry/tennis-bracelets
GET /api/v1/jewelry/tennis-bracelets/:id
```

Auth: API key

**`productCategory` slug:** `tennis_bracelet`

---

## Search

### Typeahead / Suggest

```
GET /api/v1/search/suggest
```

Auth: API key. Optionally include a Bearer token to include order results for the authenticated user.

**Query params**

| Param | Type | Required | Description |
|---|---|---|---|
| `q` | string | Yes | Search query (minimum 2 characters) |
| `limit` | integer | No | Max results per category (default `8`, max `20`) |

**Response `data` shape**

```json
{
  "products": [
    {
      "id": "uuid",
      "title": "1.25ct Round E VS1",
      "subtitle": "Diamond — $8,500.00",
      "category": "Diamond",
      "image": "https://..."
    }
  ],
  "orders": [
    {
      "id": "uuid",
      "title": "Order ORD-2024-001",
      "status": "shipped"
    }
  ]
}
```

Orders are only returned when a valid Bearer token is present. When unauthenticated, `orders` is always `[]`.

**`category` values in product results**

| `productCategory` (DB slug) | `category` label |
|---|---|
| `natural_diamond` | `Diamond` |
| `lab_grown_diamond` | `Lab-Grown Diamond` |
| `gemstone` | `Gemstone` |
| `natural_melee` | `Melee` |
| `lab_grown_melee` | `Lab-Grown Melee` |
| `engagement_ring` | `Engagement Ring` |
| `wedding_band` | `Wedding Band` |
| `tennis_bracelet` | `Tennis Bracelet` |

Note: product categories are now stored in the `product_categories` lookup table (FK `product_category_id` on `products`). The old `productTypeEnum` has been removed.

**Errors**

| Code | Status | Condition |
|---|---|---|
| `INVALID_QUERY` | 400 | Query is shorter than 2 characters |

---

### Full Search

```
GET /api/v1/search
```

Auth: API key. Optionally include a Bearer token to include order results.

**Query params**

| Param | Type | Required | Description |
|---|---|---|---|
| `q` | string | Yes | Search query (minimum 2 characters) |
| `type` | string | No | `all` (default), `products`, or `orders` |
| `page` | integer | No | Page number (default `1`) |
| `perPage` | integer | No | Items per page (default `20`, max `100`) |

When `type=orders` and no Bearer token is present, results are empty (orders require authentication).

When `type=all`, products appear first in the virtual result set, followed by orders.

**Response `data` item shapes**

Product result:

```json
{
  "resultType": "product",
  "data": {
    "id": "uuid",
    "description": "1.25ct Round E VS1",
    "productCategory": "natural_diamond",
    "category": "Diamond",
    "priceUsd": 8500.00,
    "image": "https://..."
  }
}
```

Order result:

```json
{
  "resultType": "order",
  "data": {
    "id": "uuid",
    "orderNumber": 1001,
    "currentStatus": "shipped"
  }
}
```

Note: The order result field is `currentStatus` (not `status`). `currentStatus` is the raw value stored on the order record; it may be `null` if no status has been set. `orderNumber` is an integer (trigger-assigned).

**`productCategory` values**

`natural_diamond`, `lab_grown_diamond`, `gemstone`, `natural_melee`, `lab_grown_melee`, `engagement_ring`, `wedding_band`, `tennis_bracelet`

**Errors**

| Code | Status | Condition |
|---|---|---|
| `INVALID_QUERY` | 400 | Query is shorter than 2 characters |
| `INVALID_PARAMS` | 400 | Invalid `type` value or pagination error |

---

## Orders

All order endpoints require API key + Bearer token.

### List

```
GET /api/v1/orders
```

Auth: API key + Bearer

**Query params**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number |
| `perPage` | integer | `20` | Items per page (max `100`) |

**Response `data` item shape** — see [Order object](#order-object) below. List returns the same full shape as detail.

### Detail

```
GET /api/v1/orders/:id
```

Auth: API key + Bearer

The `:id` parameter is the **order UUID**, not the order number.

Only returns the order if it belongs to the authenticated user (verified through the `orderCheckouts` → `userId` relationship).

**Errors**

| Code | Status | Condition |
|---|---|---|
| `NOT_FOUND` | 404 | Order not found or belongs to a different user |

### Order object

```json
{
  "id": "uuid",
  "orderNumber": 1001,
  "currentStatus": { "id": "uuid", "value": "shipped" },
  "estimatedDelivery": "2024-03-20",
  "deliveryAddress": {
    "name": "Jane Smith",
    "street": "123 Jewellery Lane",
    "city": "SW1A 1AA London",
    "state": null,
    "postalCode": "SW1A 1AA",
    "country": "United Kingdom"
  },
  "shippingCost": 0.00,
  "vatAmount": 0.00,
  "finalPriceUsd": 8500.00,
  "canTrack": true,
  "canPayInvoice": false,
  "paymentTerm": { "id": "uuid", "value": "Net 30" },
  "products": [
    {
      "id": "uuid",
      "productId": "uuid",
      "snapshot": { "shape": "Round", "carat": "1.25", "color": "E" },
      "priceUsd": 8500.00
    }
  ],
  "events": [
    {
      "id": "uuid",
      "eventType": { "id": "uuid", "value": "order_confirmed" },
      "occurredAt": "2024-03-11T09:30:00.000Z"
    }
  ],
  "exchangeRates": [
    {
      "currency": { "id": "uuid", "value": "EUR" },
      "rate": 0.92
    }
  ]
}
```

**Fields removed from previous version:** `invoiceNumber`, `status` (string), `statusDetail`, `statusMessage`, `item`, `finalPriceEur`, `progress`, `itemDetails`, `payment`, `updates`, `summary`, `checkoutOrderParentNumber`.

**Fields added:** `currentStatus` (object with `id` + `value`), `paymentTerm` (object with `id` + `value`, from `payment_terms` lookup table), `products` (array of `orderProducts` with JSONB snapshot), `events` (replacing `progress` and `updates`), `exchangeRates`, `shippingCost`, `vatAmount`.

**`orderNumber`** is an integer assigned automatically by a database trigger (`trg_checkout_order_number`). For display purposes, format it as a composed string (e.g. `ORD-2025-1001`). It is not used as an API identifier — always use the UUID.

**`currentStatus` values**

`currentStatus` is an object `{ id, value }` or `null` if no status has been recorded. The `value` string comes from the `orderStatusTypes` lookup table; representative values include:

`requested`, `confirmed`, `manufacturing`, `shipped`, `out_for_delivery`, `delivered`, `returned`, `cancelled`, `delayed`, `sold_out`

**`products[].snapshot`**

`snapshot` is a JSONB field that captures the product's attribute values at the time the order was placed. Its shape depends on the product type but is not schema-enforced — consumers should treat it as `Record<string, unknown>`.

**`events[].eventType.value`**

Representative values: `order_requested`, `order_confirmed`, `order_shipped`, `order_delivered`, `order_cancelled`. Events are returned in descending `occurredAt` order (most recent first).

Note: `events` objects no longer carry `message` or `description` fields. These were removed from the `order_events` table in the schema refinement.

---

## Cart

All cart endpoints require API key + Bearer token.

The cart is assembled directly from cart items — there is no cart-level entity. `GET /api/v1/cart` always returns a result (never `null`).

### Get cart

```
GET /api/v1/cart
```

Auth: API key + Bearer

**Response `data` shape**

```json
{
  "items": [
    {
      "id": "uuid",
      "quantity": 1,
      "addedAt": "2024-03-15T10:00:00.000Z",
      "product": {
        "id": "uuid",
        "title": "1.25ct Round E VS1",
        "image": "https://...",
        "price": "8500.00",
        "category": "diamond"
      },
      "config": {
        "metal": "18k_yellow_gold",
        "ringSize": 6.5,
        "braceletLength": null,
        "engravingText": null
      }
    }
  ]
}
```

`config` is `null` for items that have no jewelry configuration (e.g. loose stones). When present, any field within `config` may be `null` if that option was not set. `centerStone` is not surfaced in the response; it is stored internally as `centerStoneProductId`.

**`product.category`** reflects the `product_categories` slug: `natural_diamond`, `lab_grown_diamond`, `gemstone`, `natural_melee`, `lab_grown_melee`, `engagement_ring`, `wedding_band`, `tennis_bracelet`.

### Add item

```
POST /api/v1/cart/items
```

Auth: API key + Bearer

**Request body**

```json
{
  "productId": "uuid",
  "quantity": 1
}
```

`quantity` defaults to `1` if omitted. Must be a positive integer.

Optional `config` object for jewelry items:

```json
{
  "productId": "uuid",
  "quantity": 1,
  "config": {
    "metalId": "uuid",
    "centerStoneProductId": "uuid",
    "ringSize": "6.5",
    "braceletLength": null,
    "engravingText": "Always & Forever"
  }
}
```

All `config` fields are optional. Pass only the fields relevant to the item being configured.

**Response** — `201 Created`

```json
{
  "data": { "id": "uuid" }
}
```

**Errors**

| Code | Status | Condition |
|---|---|---|
| `INVALID_BODY` | 400 | Body is not valid JSON |
| `INVALID_PARAMS` | 400 | `productId` is not a valid UUID or `quantity` fails validation |

### Remove item by product

```
DELETE /api/v1/cart/items?productId=<uuid>
```

Auth: API key + Bearer

Removes all cart items for the given product from the authenticated user's cart. No-op if the product is not in the cart.

**Query params**

| Param | Type | Required | Description |
|---|---|---|---|
| `productId` | UUID | Yes | Product to remove from cart |

**Response** — `200`

```json
{ "data": null }
```

**Errors**

| Code | Status | Condition |
|---|---|---|
| `INVALID_PARAMS` | 400 | `productId` missing or not a valid UUID |

### Update item quantity

```
PATCH /api/v1/cart/items/:id
```

Auth: API key + Bearer

Updates the quantity of a specific cart item by its cart item ID.

**Request body**

```json
{
  "quantity": 2
}
```

Must be a positive integer.

**Response** — `200`

```json
{ "data": null }
```

**Errors**

| Code | Status | Condition |
|---|---|---|
| `INVALID_BODY` | 400 | Body is not valid JSON |
| `INVALID_PARAMS` | 400 | `quantity` is not a positive integer |

### Remove item by ID

```
DELETE /api/v1/cart/items/:id
```

Auth: API key + Bearer

Removes a specific cart item by its cart item ID. Scoped to the authenticated user — no-op if the item belongs to a different user.

**Response** — `200`

```json
{ "data": null }
```

---

## Shortlists

All shortlist endpoints require API key + Bearer token.

Shortlists are named collections. A user may have multiple shortlists. Items belong to a specific shortlist identified by its ID.

### List shortlists

```
GET /api/v1/shortlists
```

Auth: API key + Bearer

Returns all shortlists for the authenticated user, including their items.

**Response `data` shape**

```json
[
  {
    "id": "uuid",
    "name": "My Favourites",
    "itemCount": 2,
    "items": [
      {
        "id": "uuid",
        "addedAt": "2024-03-15T10:00:00.000Z",
        "product": {
          "id": "uuid",
          "title": "1.25ct Round E VS1",
          "image": "https://...",
          "price": "8500.00",
          "category": "diamond"
        }
      }
    ]
  }
]
```

### Add item to shortlist

```
POST /api/v1/shortlists/items
```

Auth: API key + Bearer

**Request body**

```json
{
  "productId": "uuid"
}
```

**Response** — `201 Created`

```json
{
  "data": { "id": "uuid" }
}
```

**Errors**

| Code | Status | Condition |
|---|---|---|
| `INVALID_BODY` | 400 | Body is not valid JSON |
| `INVALID_PARAMS` | 400 | `productId` is not a valid UUID |

### Remove item by product

```
DELETE /api/v1/shortlists/items?productId=<uuid>
```

Auth: API key + Bearer

Removes all shortlist entries for the given product. No-op if the product is not shortlisted.

**Query params**

| Param | Type | Required | Description |
|---|---|---|---|
| `productId` | UUID | Yes | Product to remove from shortlists |

**Response** — `200`

```json
{ "data": null }
```

**Errors**

| Code | Status | Condition |
|---|---|---|
| `INVALID_PARAMS` | 400 | `productId` missing or not a valid UUID |

### Remove item by ID

```
DELETE /api/v1/shortlists/items/:id
```

Auth: API key + Bearer

Removes a specific shortlist item by its shortlist item ID. Scoped to the authenticated user — no-op if the item belongs to a different user.

**Response** — `200`

```json
{ "data": null }
```

---

## Invoices

The invoice data layer (`lib/api/invoices.ts`) is implemented but **no route handlers exist yet** for invoice endpoints. Invoices are not yet publicly accessible via the REST API.

When route handlers are added, the expected shape is:

### Invoice object (future)

```json
{
  "id": "uuid",
  "invoiceNumber": "INV-2024-001",
  "paymentMethod": { "id": "uuid", "value": "Net 30" },
  "issueDate": "2024-03-15",
  "dueDate": "2024-04-14",
  "totalAmountUsd": 8500.00,
  "currentStatus": { "id": "uuid", "value": "paid" },
  "ledgerEntries": [
    {
      "id": "uuid",
      "type": { "id": "uuid", "value": "order_charge" },
      "orderId": "uuid",
      "description": "1.25ct Round E VS1",
      "amountUsd": 8500.00,
      "occurredAt": "2024-03-15T00:00:00.000Z",
      "exchangeRates": [
        { "currency": { "id": "uuid", "value": "EUR" }, "rate": 0.92 }
      ]
    }
  ]
}
```

Note: `invoiceNumber` is no longer a field on the Order object. Invoices are a separate entity linked to orders via `ledgerEntries[].orderId`.

---

## User

### Profile

```
GET /api/v1/me
```

Auth: API key + Bearer

Returns the profile of the authenticated user. The internal `authUserId` field is excluded from the response.

**Response `data` shape**

```json
{
  "id": "uuid",
  "email": "jane@jeweller.com",
  "name": "Jane Smith",
  "companyName": "Smith Jewellers",
  "phone": "+44 20 7946 0958",
  "currencyId": "uuid",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-03-15T10:00:00Z",
  "deletedAt": null
}
```

### Addresses

```
GET /api/v1/me/addresses
```

Auth: API key + Bearer

Returns all delivery addresses for the authenticated user. Soft-deleted addresses are excluded.

**Response `data` shape**

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "name": "Jane Smith",
    "street": "123 Jewellery Lane",
    "city": "London",
    "state": null,
    "postalCode": "SW1A 1AA",
    "countryId": "uuid",
    "isDefault": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-03-15T10:00:00Z",
    "deletedAt": null
  }
]
```

---

## Admin

Admin endpoints are intended for external tooling and automated pipelines. The admin UI itself uses Next.js Server Actions and does not go through these routes.

### Authentication

All admin endpoints require:

1. API key header (same as all other endpoints): `X-API-Key: <api-key>`
2. Bearer token: `Authorization: Bearer <supabase-access-token>`
3. The authenticated user must have `app_metadata.role === "admin"` in Supabase Auth

Any request that fails the role check returns `403 FORBIDDEN`.

### Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/admin/orders` | List all orders (paginated) |
| `POST` | `/api/v1/admin/orders` | Create a new order |
| `GET` | `/api/v1/admin/orders/:id` | Get order by ID |
| `PATCH` | `/api/v1/admin/orders/:id` | Update order |
| `DELETE` | `/api/v1/admin/orders/:id` | Delete order (cascade) |
| `GET` | `/api/v1/admin/shortlists` | List all shortlists (paginated) |
| `POST` | `/api/v1/admin/shortlists` | Create a new shortlist |
| `GET` | `/api/v1/admin/shortlists/:id` | Get shortlist by ID |
| `PATCH` | `/api/v1/admin/shortlists/:id` | Update shortlist |
| `DELETE` | `/api/v1/admin/shortlists/:id` | Delete shortlist (cascade) |
| `GET` | `/api/v1/admin/invoices` | List all invoices (paginated) |
| `POST` | `/api/v1/admin/invoices` | Create a new invoice |
| `GET` | `/api/v1/admin/invoices/:id` | Get invoice by ID |
| `PATCH` | `/api/v1/admin/invoices/:id` | Update invoice |
| `DELETE` | `/api/v1/admin/invoices/:id` | Delete invoice (cascade) |
| `GET` | `/api/v1/admin/products` | List all products (paginated, all categories) |
| `POST` | `/api/v1/admin/products` | Create a new product |
| `GET` | `/api/v1/admin/products/:id` | Get product by ID |
| `PATCH` | `/api/v1/admin/products/:id` | Update product |
| `DELETE` | `/api/v1/admin/products/:id` | Delete product (cascade) |
| `GET` | `/api/v1/admin/lookups` | Get all lookup table data |
| `GET` | `/api/v1/admin/users` | List all users |
| `POST` | `/api/v1/admin/impersonate` | Switch active session to another user |

### Error codes (admin-specific)

| Code | Status | Condition |
|---|---|---|
| `FORBIDDEN` | 403 | Authenticated user lacks `admin` role |

Standard error codes (`INVALID_API_KEY`, `UNAUTHORIZED`, `NOT_FOUND`, `INVALID_PARAMS`, `INVALID_BODY`) apply to admin endpoints in the same way as all other endpoints.

### Notes

- All delete operations are hard deletes that cascade to related records (order products, events, shortlist items, invoice ledger entries, product images, etc.).
- `GET /api/v1/admin/lookups` returns a single object containing all lookup tables (metal types, stone shapes, band styles, order status types, payment terms, currencies, countries, and product categories) for use when building create/edit forms.
- `POST /api/v1/admin/impersonate` sets the active buyer session to the target user via BroadcastChannel — this is a UI-level switch, not a Supabase session swap.
- Product create/update bodies are category-specific. The `productCategorySlug` field in the request body determines which subcategory table is written to.

---

### Admin Shortlists

#### List

```
GET /api/v1/admin/shortlists
```

Auth: API key + Admin secret

**Query params**

| Param | Type | Description |
|---|---|---|
| `page` | integer | Page number (default 1) |
| `perPage` | integer | Items per page (default 20, max 100) |
| `search` | string | Filter by shortlist name or user name |
| `userId` | UUID | Filter by user |

**Response `data` item shape**

```json
{
  "id": "uuid",
  "name": "Wedding Collection",
  "userName": "Jane Smith",
  "userId": "uuid",
  "itemCount": 4,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Create

```
POST /api/v1/admin/shortlists
```

Auth: API key + Admin secret

**Request body**

```json
{
  "userId": "uuid",
  "name": "Wedding Collection",
  "items": [
    { "productId": "uuid" }
  ]
}
```

**Response** — `201 Created`

```json
{
  "data": { "id": "uuid" }
}
```

#### Detail

```
GET /api/v1/admin/shortlists/:id
```

Auth: API key + Admin secret

**Response `data` shape**

```json
{
  "id": "uuid",
  "name": "Wedding Collection",
  "userId": "uuid",
  "items": [
    { "id": "uuid", "productId": "uuid" }
  ]
}
```

**Errors**

| Code | Status | Condition |
|---|---|---|
| `NOT_FOUND` | 404 | No shortlist with this ID |

#### Update

```
PATCH /api/v1/admin/shortlists/:id
```

Auth: API key + Admin secret

**Request body** (all fields optional)

```json
{
  "name": "Updated Name",
  "items": [
    { "productId": "uuid" }
  ]
}
```

If `items` is provided, the existing items are replaced entirely.

**Response** — `200`

```json
{
  "data": { "id": "uuid" }
}
```

#### Delete

```
DELETE /api/v1/admin/shortlists/:id
```

Auth: API key + Admin secret

Deletes the shortlist and all its items.

**Response** — `200`

```json
{
  "data": { "id": "uuid" }
}
```
