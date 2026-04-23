# Supabase Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add email/password authentication with route protection so only logged-in users can access the app.

**Architecture:** `@supabase/ssr` with three client factories (browser, server, middleware). Next.js middleware protects `/buyer/*` routes. All current pages move under `/buyer/`. Login via Server Action that also auto-creates the application user row.

**Tech Stack:** `@supabase/ssr`, Next.js 16 App Router, Drizzle ORM, Supabase Auth, shadcn/ui

**Spec:** `docs/superpowers/specs/2026-03-24-supabase-auth-design.md`

**Code style note:** All code snippets in this plan follow the project's Prettier config (no semicolons, double quotes, 2-space indent). The existing codebase files use semicolons in some places — `npm run format` in Task 9 will normalize everything. Don't worry about semicolon mismatches during implementation.

---

## File Structure

### New Files

| File | Responsibility |
| ---- | -------------- |
| `lib/supabase/client.ts` | Browser Supabase client (singleton) |
| `lib/supabase/server.ts` | Server Supabase client (per-request) |
| `lib/supabase/middleware.ts` | Middleware Supabase client (token refresh) |
| `middleware.ts` | Route protection + session refresh |
| `app/login/page.tsx` | Login page (Server Component, reads searchParams) |
| `app/login/login-form.tsx` | Login form (Client Component, useActionState) |
| `app/login/actions.ts` | Server Action: sign in + auto-create user |
| `app/page.tsx` | Marketing placeholder (public) |
| `app/buyer/layout.tsx` | Authenticated layout wrapping `LayoutBase` |
| `app/buyer/page.tsx` | Authenticated home (Server Component with client carousel) |
| `app/buyer/not-found.tsx` | 404 within authenticated zone (with app shell) |
| `components/home-carousel.tsx` | Extracted carousel from current home page |
| `components/sign-out-button.tsx` | Sign out with AlertDialog confirmation |

### Modified Files

| File | Change |
| ---- | ------ |
| `app/layout.tsx` | Remove `LayoutBase`, keep bare shell (fonts, theme) |
| `app/not-found.tsx` | Keep as-is (renders in bare root layout for public 404s) |
| `lib/api/users.ts` | Replace `fetchCurrentUser()` with auth-aware `getCurrentUser()` |
| `lib/navigation.ts` | Prefix all `href` values with `/buyer` |
| `components/shell/buyer-nav.tsx` | Logo link → `/buyer/` |
| `components/shell/nav-sheet.tsx` | Wire log out button to use `SignOutButton` component |
| `components/layouts/layout-under-construction.tsx` | Default `backHref` → `/buyer` |
| `app/buyer/orders/[slug]/page.tsx` | Back link `href="/orders"` → `/buyer/orders` |
| `app/buyer/browse/*/[slug]/page.tsx` | Breadcrumb `href` values → `/buyer/browse/...` |
| `app/buyer/browse/*/page.tsx` | Template literal hrefs → `/buyer/browse/...` |
| `app/buyer/finances/page.tsx` | `backHref` → `/buyer/orders` |
| `app/buyer/admin/page.tsx` | `backHref` → `/buyer` |
| `app/buyer/shortlists/page.tsx` | `backHref` → `/buyer` |
| `app/buyer/settings/page.tsx` | `backHref` → `/buyer` |
| `app/buyer/browse/custom-jewellery/page.tsx` | `backHref` → `/buyer/browse/jewelry/engagement-rings` |

### Moved Directories

All page directories under `app/` move to `app/buyer/`:

```
app/browse/         → app/buyer/browse/
app/orders/         → app/buyer/orders/
app/admin/          → app/buyer/admin/
app/finances/       → app/buyer/finances/
app/settings/       → app/buyer/settings/
app/shortlists/     → app/buyer/shortlists/
app/ui-kitchen-sink/ → app/buyer/ui-kitchen-sink/
```

### Removed Files

| File | Reason |
| ---- | ------ |
| `db/supabase.ts` | Replaced by `lib/supabase/*.ts` (no imports exist) |

---

## Task 1: Install `@supabase/ssr`

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the package**

```bash
npm install @supabase/ssr
```

- [ ] **Step 2: Verify installation**

```bash
npm ls @supabase/ssr
```

Expected: `@supabase/ssr@<version>` listed without errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install @supabase/ssr for auth"
```

---

## Task 2: Create Supabase Client Factories

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/middleware.ts`
- Remove: `db/supabase.ts`

- [ ] **Step 1: Create the browser client**

Create `lib/supabase/client.ts`:

```ts
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

- [ ] **Step 2: Create the server client**

Create `lib/supabase/server.ts`:

```ts
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // The `setAll` method is called from a Server Component.
            // This can be ignored if middleware refreshes sessions.
          }
        },
      },
    },
  )
}
```

- [ ] **Step 3: Create the middleware client**

Create `lib/supabase/middleware.ts`:

```ts
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    const next = url.pathname + url.search
    url.pathname = "/login"
    url.searchParams.set("next", next)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

- [ ] **Step 4: Delete `db/supabase.ts`**

```bash
rm db/supabase.ts
```

- [ ] **Step 5: Verify typecheck passes**

```bash
npm run typecheck
```

Expected: No errors related to `db/supabase`.

- [ ] **Step 6: Commit**

```bash
git add lib/supabase/ && git rm db/supabase.ts
git commit -m "feat: add Supabase SSR client factories, remove old client"
```

---

## Task 3: Create Middleware

**Files:**
- Create: `middleware.ts` (project root)

- [ ] **Step 1: Create the middleware file**

Create `middleware.ts`:

```ts
import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: ["/buyer/:path*"],
}
```

- [ ] **Step 2: Verify typecheck passes**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat: add middleware for auth session refresh and route protection"
```

---

## Task 4: Create Login Server Action

**Files:**
- Create: `app/login/actions.ts`
- Modify: `lib/api/users.ts`

This task creates both the login Server Action (which handles sign-in + auto-create user) and the `getCurrentUser()` helper.

- [ ] **Step 1: Update `lib/api/users.ts` with `getCurrentUser()`**

Replace the entire contents of `lib/api/users.ts`:

```ts
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { db } from "@/db/client"
import { users } from "@/db/schema"
import { createClient } from "@/lib/supabase/server"

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect("/login")
  }

  const appUser = await db.query.users.findFirst({
    where: eq(users.authUserId, authUser.id),
  })

  if (!appUser) {
    throw new Error(
      `No application user found for auth user ${authUser.id}. ` +
        `This indicates a data integrity issue — the auto-create flow may have failed.`,
    )
  }

  return appUser
}
```

- [ ] **Step 2: Create `app/login/actions.ts`**

```ts
"use server"

import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { db } from "@/db/client"
import { users } from "@/db/schema"
import { currencies } from "@/db/schema/lookups"
import { createClient } from "@/lib/supabase/server"

const COMPANY_NAMES = [
  "Diamond & Co.",
  "Prestige Gems Ltd.",
  "Crown Jewellers",
  "Brilliance Fine Jewellery",
  "Azure Diamonds",
  "Sterling Stone Co.",
  "Radiant Luxe",
  "Heritage Gems",
  "Lumina Jewellers",
  "Sapphire & Gold",
]

function randomCompanyName() {
  return COMPANY_NAMES[Math.floor(Math.random() * COMPANY_NAMES.length)]
}

function randomPhone() {
  const digits = Array.from({ length: 10 }, () =>
    Math.floor(Math.random() * 10),
  ).join("")
  return `+1${digits}`
}

async function ensureUserRow(authUserId: string, email: string, name: string) {
  const existing = await db.query.users.findFirst({
    where: eq(users.authUserId, authUserId),
  })

  if (existing) return

  const usdCurrency = await db.query.currencies.findFirst({
    where: eq(currencies.value, "USD"),
  })

  if (!usdCurrency) {
    throw new Error("USD currency not found in lookup table")
  }

  await db.insert(users).values({
    authUserId,
    email,
    name,
    companyName: randomCompanyName(),
    phone: randomPhone(),
    currencyId: usdCurrency.id,
  })
}

export async function login(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const next = formData.get("next") as string | null

  const supabase = await createClient()

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  const authUser = data.user
  const name =
    authUser.user_metadata?.full_name ||
    authUser.user_metadata?.name ||
    email.split("@")[0]

  await ensureUserRow(authUser.id, email, name)

  redirect(next || "/buyer/")
}
```

- [ ] **Step 3: Verify typecheck passes**

```bash
npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add lib/api/users.ts app/login/actions.ts
git commit -m "feat: add login server action with auto-create user, add getCurrentUser helper"
```

---

## Task 5: Create Login Page

**Files:**
- Create: `app/login/page.tsx` (Server Component — reads `searchParams`, passes `next` to form)
- Create: `app/login/login-form.tsx` (Client Component — form with `useActionState`)

The login page is split into a Server Component (reads the `searchParams` prop) and a Client Component (the form). This avoids using `useSearchParams()` in a Client Component without a `<Suspense>` boundary.

- [ ] **Step 1: Create the login form client component**

Create `app/login/login-form.tsx`:

```tsx
"use client"

import { useActionState } from "react"
import { login } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({ next }: { next: string | null }) {
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          disabled={isPending}
        />
      </div>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  )
}
```

- [ ] **Step 2: Create the login page server component**

Create `app/login/page.tsx`:

```tsx
import { LoginForm } from "./login-form"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Minivoda
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        <LoginForm next={next ?? null} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify typecheck passes**

```bash
npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add app/login/page.tsx app/login/login-form.tsx
git commit -m "feat: add login page with email/password form"
```

---

## Task 6: Create Sign Out Button

**Files:**
- Create: `components/sign-out-button.tsx`

Check if `alert-dialog` is already installed. It is (found at `components/ui/alert-dialog.tsx`).

- [ ] **Step 1: Create the sign-out button component**

Create `components/sign-out-button.tsx`:

```tsx
"use client"

import { useState } from "react"
import { IconLogout } from "@tabler/icons-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSignOut() {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="w-full" size="lg">
          Log out
          <IconLogout size={20} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to sign out?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSignOut} disabled={isLoading}>
            {isLoading ? "Signing out..." : "Sign out"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add components/sign-out-button.tsx
git commit -m "feat: add sign-out button with confirmation dialog"
```

---

## Task 7: Move Routes Under `/buyer/` and Update Layouts

This is the largest task. It moves all app page directories under `app/buyer/`, updates the root layout to a bare shell, creates the buyer layout, and creates the marketing placeholder.

**Files:**
- Modify: `app/layout.tsx`
- Create: `app/buyer/layout.tsx`
- Create: `app/page.tsx` (marketing placeholder, replaces current)
- Create: `app/buyer/page.tsx` (authenticated home)
- Create: `app/buyer/not-found.tsx`
- Create: `components/home-carousel.tsx`
- Move: all page directories into `app/buyer/`

- [ ] **Step 1: Move all page directories into `app/buyer/`**

```bash
mkdir -p app/buyer
mv app/browse app/buyer/browse
mv app/orders app/buyer/orders
mv app/admin app/buyer/admin
mv app/finances app/buyer/finances
mv app/settings app/buyer/settings
mv app/shortlists app/buyer/shortlists
mv app/ui-kitchen-sink app/buyer/ui-kitchen-sink
```

- [ ] **Step 2: Strip `LayoutBase` from root layout**

Edit `app/layout.tsx` — remove the `LayoutBase` import and wrapper, keeping only the bare shell:

```tsx
import type { Metadata, Viewport } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://www.minivoda.com"),
  description:
    "The global marketplace for diamonds, gemstones, and jewelry. Source ethically, buy competitively.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Minivoda",
  },
  robots: {
    index: true,
    follow: true,
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Create `app/buyer/layout.tsx`**

```tsx
import { LayoutBase } from "@/components/layouts/layout-base"

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <LayoutBase>{children}</LayoutBase>
}
```

- [ ] **Step 4: Create marketing placeholder at `app/page.tsx`**

Replace the current `app/page.tsx` (which was the authenticated home) with a marketing placeholder:

```tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function MarketingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Minivoda
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          The global marketplace for diamonds, gemstones, and jewelry.
        </p>
      </div>
      <Button asChild size="lg">
        <Link href="/login">Sign in</Link>
      </Button>
    </div>
  )
}
```

- [ ] **Step 5: Extract the carousel into `components/home-carousel.tsx`**

Create `components/home-carousel.tsx` — extract the carousel logic from the current home page (which is a `"use client"` component):

```tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
} from "@/components/ui/carousel"

const HERO_SLIDES = [
  { label: "Slide 1", className: "bg-violet-100 text-violet-500" },
  { label: "Slide 2", className: "bg-sky-100 text-sky-500" },
  { label: "Slide 3", className: "bg-amber-100 text-amber-500" },
]

const AUTOPLAY_INTERVAL = 5000

function CarouselControls() {
  const { api, scrollPrev, scrollNext } = useCarousel()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) return
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())
    const onSelect = () => setCurrent(api.selectedScrollSnap())
    api.on("select", onSelect)
    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  React.useEffect(() => {
    if (!api) return
    const interval = setInterval(() => api.scrollNext(), AUTOPLAY_INTERVAL)
    const stop = () => clearInterval(interval)
    api.on("pointerDown", stop)
    return () => {
      clearInterval(interval)
      api.off("pointerDown", stop)
    }
  }, [api])

  return (
    <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
      <CarouselPrevious
        className="static size-8 translate-y-0 bg-background/80 backdrop-blur-sm"
        onClick={scrollPrev}
      />
      <div className="flex gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              "size-2 rounded-full transition-colors",
              i === current ? "bg-foreground" : "bg-foreground/25",
            )}
            onClick={() => api?.scrollTo(i)}
          />
        ))}
      </div>
      <CarouselNext
        className="static size-8 translate-y-0 bg-background/80 backdrop-blur-sm"
        onClick={scrollNext}
      />
    </div>
  )
}

export function HomeCarousel() {
  return (
    <Carousel className="overflow-hidden rounded-xl" opts={{ loop: true }}>
      <CarouselContent className="ml-0">
        {HERO_SLIDES.map((slide, i) => (
          <CarouselItem key={i} className="pl-0">
            <div
              className={cn(
                "flex h-100 items-center justify-center",
                slide.className,
              )}
            >
              {slide.label}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselControls />
    </Carousel>
  )
}
```

- [ ] **Step 6: Create authenticated home at `app/buyer/page.tsx`**

This is a Server Component that calls `getCurrentUser()` and passes data to the client carousel:

```tsx
import Link from "next/link"
import { getCurrentUser } from "@/lib/api/users"
import { HomeCarousel } from "@/components/home-carousel"

const HOME_CATEGORIES = [
  { label: "Engagement rings", slug: "engagement-rings", badge: "New" },
  { label: "Wedding bands", slug: "wedding-bands", badge: "New" },
  { label: "Natural diamonds", slug: "natural-diamonds", badge: null },
  { label: "Lab grown diamonds", slug: "lab-grown-diamonds", badge: null },
  { label: "Gemstones", slug: "gemstones", badge: null },
  { label: "Natural melee", slug: "natural-melee", badge: null },
  { label: "Lab grown melee", slug: "lab-grown-melee", badge: null },
]

export default async function BuyerHomePage() {
  const user = await getCurrentUser()

  return (
    <div className="flex flex-col gap-8 pb-16 pt-1">
      <h2 className="text-center text-2xl font-semibold leading-9">
        Nice to see you again, {user.name}!
      </h2>

      <HomeCarousel />

      <h3 className="text-4xl font-medium leading-10 text-foreground">
        All product categories
      </h3>
      <div className="grid grid-cols-4 gap-8">
        {HOME_CATEGORIES.map((cat) => (
          <Link
            key={cat.label}
            href={`/buyer/browse/${cat.slug}`}
            className="flex flex-col gap-3"
          >
            <div className="relative aspect-square overflow-hidden rounded-xl bg-stone-300">
              {cat.badge && (
                <span className="absolute right-3 top-3 rounded-full bg-stone-100 px-1.5 py-0.5 text-xs text-violet-700">
                  {cat.badge}
                </span>
              )}
            </div>
            <p className="text-xl font-medium leading-8 text-foreground">
              {cat.label}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Create `app/buyer/not-found.tsx`**

Copy the existing `app/not-found.tsx` to `app/buyer/not-found.tsx` so that 404s within the authenticated zone render with the app shell (via `app/buyer/layout.tsx`):

```bash
cp app/not-found.tsx app/buyer/not-found.tsx
```

- [ ] **Step 8: Verify the file moves are correct**

```bash
ls app/buyer/
```

Expected: `browse/`, `orders/`, `admin/`, `finances/`, `settings/`, `shortlists/`, `ui-kitchen-sink/`, `layout.tsx`, `page.tsx`, `not-found.tsx`

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: restructure routes under /buyer/, split layouts, add marketing page"
```

---

## Task 8: Update All Hardcoded Route Paths

**Files:**
- Modify: `lib/navigation.ts`
- Modify: `components/shell/buyer-nav.tsx`
- Modify: `components/shell/nav-sheet.tsx`
- Modify: `components/layouts/layout-under-construction.tsx`
- Modify: `app/buyer/orders/[slug]/page.tsx`
- Modify: `app/buyer/finances/page.tsx`, `app/buyer/admin/page.tsx`, `app/buyer/shortlists/page.tsx`, `app/buyer/settings/page.tsx`, `app/buyer/browse/custom-jewellery/page.tsx`
- Audit: all `app/buyer/**/*.tsx` files for hrefs (JSX attributes, object properties, template literals, backHref props)

- [ ] **Step 1: Update `lib/navigation.ts`**

Prefix all `href` values with `/buyer`:

In `lib/navigation.ts`, update `productCategories`:
- `"/browse/jewelry/engagement-rings"` → `"/buyer/browse/jewelry/engagement-rings"`
- `"/browse/natural-diamonds"` → `"/buyer/browse/natural-diamonds"`
- `"/browse/lab-grown-diamonds"` → `"/buyer/browse/lab-grown-diamonds"`
- `"/browse/gemstones"` → `"/buyer/browse/gemstones"`
- `"/browse/natural-melee"` → `"/buyer/browse/natural-melee"`
- `"/browse/lab-grown-melee"` → `"/buyer/browse/lab-grown-melee"`
- `"/browse/custom-jewellery"` → `"/buyer/browse/custom-jewellery"`

Update `myListItems`:
- `"/orders"` → `"/buyer/orders"`
- `"/finances"` → `"/buyer/finances"`
- `"/shortlists"` → `"/buyer/shortlists"`

Update `adminItems`:
- `"/admin"` → `"/buyer/admin"`
- `"/settings"` → `"/buyer/settings"`

- [ ] **Step 2: Update `components/shell/buyer-nav.tsx`**

Change the logo link from `href="/"` to `href="/buyer"`. No other changes needed — the sign-out button lives in the NavSheet only (placing a full-width button in the compact header bar would look inconsistent).

- [ ] **Step 3: Update `components/shell/nav-sheet.tsx`**

In the footer section (around line 188), replace the existing static "Log out" button with the `SignOutButton` component:

Replace:
```tsx
<Button variant="outline" className="mt-4 w-full" size="lg">
  Log out
  <IconLogout size={20} />
</Button>
```

With:
```tsx
<div className="mt-4">
  <SignOutButton />
</div>
```

Add the import:
```tsx
import { SignOutButton } from "@/components/sign-out-button"
```

Remove the unused `IconLogout` import if it's no longer used elsewhere in the file.

- [ ] **Step 4: Update `app/buyer/orders/[slug]/page.tsx`**

Change line 309 from:
```tsx
href="/orders"
```
to:
```tsx
href="/buyer/orders"
```

- [ ] **Step 5: Audit template literal hrefs in browse pages**

These files have `href={`/browse/...`}` patterns that need updating to `/buyer/browse/...`:

- `app/buyer/browse/natural-diamonds/page.tsx` — `href={`/browse/natural-diamonds/${item.id}`}` → `href={`/buyer/browse/natural-diamonds/${item.id}`}`
- `app/buyer/browse/lab-grown-diamonds/page.tsx` — same pattern
- `app/buyer/browse/gemstones/page.tsx` — same pattern
- `app/buyer/browse/natural-melee/page.tsx` — same pattern
- `app/buyer/browse/lab-grown-melee/page.tsx` — same pattern
- `app/buyer/browse/jewelry/engagement-rings/page.tsx` — same pattern
- `app/buyer/orders/page.tsx` — `href={`/orders/${order.id}`}` → `href={`/buyer/orders/${order.id}`}`

For each file, search for `href={` and add the `/buyer` prefix to any path.

- [ ] **Step 6: Update breadcrumb `href` values in detail pages**

Detail pages (`[slug]/page.tsx`) contain breadcrumb objects with `href: "/browse/..."` (object property syntax, not JSX attribute). These need the `/buyer` prefix too:

- `app/buyer/browse/natural-diamonds/[slug]/page.tsx` — breadcrumb `href: "/browse/natural-diamonds"` and any template literal hrefs
- `app/buyer/browse/lab-grown-diamonds/[slug]/page.tsx` — same pattern
- `app/buyer/browse/gemstones/[slug]/page.tsx` — same pattern
- `app/buyer/browse/natural-melee/[slug]/page.tsx` — same pattern
- `app/buyer/browse/lab-grown-melee/[slug]/page.tsx` — same pattern
- `app/buyer/browse/jewelry/engagement-rings/[slug]/page.tsx` — has breadcrumbs for `"/browse/jewelry"`, `"/browse/jewelry/engagement-rings"`, plus template literals

Also check breadcrumbs in list pages (e.g., `natural-diamonds/page.tsx` may have `href: "/browse/natural-diamonds"` in breadcrumb data).

Search for these with:
```bash
grep -rn 'href: "/' app/buyer/ --include="*.tsx"
```

- [ ] **Step 7: Update `backHref` values in under-construction pages**

Several pages use `backHref` props pointing to old routes:

- `app/buyer/finances/page.tsx` — `backHref="/orders"` → `backHref="/buyer/orders"`
- `app/buyer/admin/page.tsx` — `backHref="/"` → `backHref="/buyer"`
- `app/buyer/shortlists/page.tsx` — `backHref="/"` → `backHref="/buyer"`
- `app/buyer/settings/page.tsx` — `backHref="/"` → `backHref="/buyer"`
- `app/buyer/browse/custom-jewellery/page.tsx` — `backHref="/browse/jewelry/engagement-rings"` → `backHref="/buyer/browse/jewelry/engagement-rings"`

Also update the default parameter in `components/layouts/layout-under-construction.tsx`:
- Change `backHref = "/"` to `backHref = "/buyer"`

Search for these with:
```bash
grep -rn 'backHref\|backHref' app/buyer/ components/layouts/ --include="*.tsx"
```

- [ ] **Step 8: Final grep audit**

Run a comprehensive search for any remaining old paths. This covers JSX attributes, object properties, template literals, and prop values:

```bash
grep -rn '"/\(browse\|orders\|finances\|settings\|admin\|shortlists\|ui-kitchen-sink\)' app/buyer/ components/ lib/ --include="*.tsx" --include="*.ts"
```

Expected: No results (every occurrence should already have the `/buyer/` prefix).

Also check for bare `"/"` routes that should now be `/buyer` or `/buyer/`:

```bash
grep -rn 'Href="/"' app/buyer/ components/ --include="*.tsx"
```

Expected: No results.

Also check template literals:

```bash
grep -rn 'href={`/' app/buyer/ --include="*.tsx" | grep -v '/buyer'
```

Expected: No results.

- [ ] **Step 9: Verify typecheck passes**

```bash
npm run typecheck
```

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: update all route paths to /buyer/ prefix"
```

---

## Task 9: Verify and Test

- [ ] **Step 1: Start Supabase locally**

```bash
npm run db:start
```

- [ ] **Step 2: Reset database (apply migrations + seed)**

```bash
npm run db:reset
```

- [ ] **Step 3: Create a test auth user**

Use the Supabase Dashboard at `http://127.0.0.1:54323` → Authentication → Add User → enter an email and password.

Alternatively via CLI:

```bash
npx supabase auth admin create-user --email test@minivoda.com --password testpass123 --email-confirm
```

- [ ] **Step 4: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 5: Test the auth flow**

1. Visit `http://localhost:3000` → should see marketing page with "Sign in" link
2. Visit `http://localhost:3000/buyer` → should redirect to `/login`
3. Visit `http://localhost:3000/buyer/browse/natural-diamonds` → should redirect to `/login?next=/buyer/browse/natural-diamonds`
4. Sign in with the test user credentials → should redirect to `/buyer/`
5. Verify the greeting shows the user's name (not "John")
6. Navigate to browse pages, orders, etc. — all should work
7. Click "Log out" → confirmation dialog → sign out → redirected to `/login`
8. Try visiting `/buyer/` again → should redirect to `/login`

- [ ] **Step 6: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 7: Run lint and typecheck**

```bash
npm run lint && npm run typecheck
```

- [ ] **Step 8: Format code**

```bash
npm run format
```

- [ ] **Step 9: Final commit (if formatting changed anything)**

```bash
git add -A
git diff --cached --quiet || git commit -m "style: format code"
```
