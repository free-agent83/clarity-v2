import * as React from "react"
import { IconMenu2, IconSearch } from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/atoms/avatar/avatar"
import { Brand } from "@/components/atoms/brand/brand"
import { Button } from "@/components/atoms/button/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/molecules/sheet/sheet"

interface AppShellProps extends Omit<React.ComponentProps<"div">, "className"> {
  full?: boolean
  defaultNavigationOpen?: boolean
  /**
   * Optional page-level banner rendered above the header.
   *
   * Pass a `PageBanner` node. The shell wraps it in a sticky container
   * so the banner pins to the top of the viewport while the page
   * scrolls; the `AppShellHeader` automatically offsets its own
   * sticky `top` so it sits just below the banner (banner first,
   * header second, page content third).
   */
  banner?: React.ReactNode
}

/**
 * Top-level page shell: fixed header + scrolling page area, with a
 * hardcoded search bar and a built-in left navigation sheet.
 *
 * Use as the outermost wrapper of every application surface (internal
 * or external) so that header, branding, search, navigation, and
 * page-content container behaviour stay consistent across Nivoda apps.
 *
 * Pass `full` to remove the main area's max-width constraint. This
 * is an exception escape hatch, not the default for wide content —
 * as a rule, data grids, dashboards, and complex views should still
 * use the constrained width so content stays within comfortable
 * reading and scanning distances. Only pass it when the default
 * width demonstrably breaks the surface, and flag the decision with
 * the design lead.
 *
 * Pass `defaultNavigationOpen` to start with the navigation sheet
 * visible on mount. Intended for Storybook workbench stories where
 * the nav sheet is the subject under inspection — in production
 * surfaces, leave it undefined so the sheet starts closed.
 *
 * Internally wraps its children in a `Sheet` (Radix `Dialog.Root`) so
 * that the hardcoded menu trigger in `AppShellHeader` and the
 * `AppShellNavigationSheet` share open/close state without any
 * consumer wiring. The wrapper emits no DOM — it is purely a context
 * provider — so shells without navigation pay nothing for it.
 *
 * Compose with `AppShellHeader` (hardcoded brand, menu trigger, and
 * search bar — only trailing `AppShellActions` are consumer-owned),
 * `AppShellNavigationSheet`, and `AppShellMain`. Children passed to
 * `AppShellMain` are automatically wrapped in an inner container
 * that enforces the max-width and page padding.
 */
function AppShell({
  full = false,
  defaultNavigationOpen,
  banner,
  children,
  ...props
}: AppShellProps) {
  return (
    <Sheet defaultOpen={defaultNavigationOpen}>
      <div
        data-slot="app-shell"
        data-full={full || undefined}
        data-has-banner={banner ? "" : undefined}
        className="group/app-shell flex min-h-svh flex-col bg-background text-foreground"
        {...props}
      >
        {banner ? (
          <div
            data-slot="app-shell-banner"
            className="sticky top-0 z-40"
          >
            {banner}
          </div>
        ) : null}
        {children}
      </div>
    </Sheet>
  )
}

interface AppShellHeaderProps
  extends Omit<React.ComponentProps<"header">, "onSearch"> {
  onSearch: () => void
}

/**
 * Sticky top bar for the app shell.
 *
 * Renders a `<header>` fixed to the top of the viewport at a
 * standard height, with a bottom border and the app background.
 *
 * The leading region (menu trigger + `Brand` logo) and the middle
 * region (`AppShellSearchBar`) are both hardcoded — neither is a
 * slot, neither can be replaced, and every Nivoda app shell renders
 * them identically. The only composition point on the header is
 * the trailing region, which accepts an optional `AppShellActions`
 * child for per-surface controls.
 *
 * `onSearch` is required: it fires when the user clicks the search
 * bar. How the callback handles the search (opening a Dialog, a
 * command palette, navigating to a search page, etc.) is
 * app-specific.
 *
 * The header is a flex container; the hardcoded brand region sits
 * at `order-1`, the search bar at `order-2 flex-1`, and
 * `AppShellActions` at `order-3` — so trailing children always land
 * on the right regardless of DOM position.
 */
function AppShellHeader({
  className,
  onSearch,
  children,
  ...props
}: AppShellHeaderProps) {
  return (
    <header
      data-slot="app-shell-header"
      className={cn(
        "sticky top-0 z-40 flex h-18 w-full items-center gap-4 border-b border-border bg-background px-4 group-data-has-banner/app-shell:top-11 md:px-6",
        className,
      )}
      {...props}
    >
      <div
        data-slot="app-shell-brand"
        className="order-1 flex shrink-0 items-center gap-3"
      >
        <AppShellNavTrigger />
        <Brand className="h-6 mr-2" />
      </div>
      <AppShellSearchBar onClick={onSearch} />
      {children}
    </header>
  )
}

/**
 * Hardcoded search bar in `AppShellHeader`.
 *
 * A `<button>` visually styled like an `Input` with a leading
 * search icon and fixed placeholder text. Clicking it fires the
 * `onSearch` callback plumbed through `AppShellHeader` — the
 * component is deliberately not an actual input, so search
 * handling (dialogs, command palettes, route changes) stays entirely
 * app-specific.
 *
 * Not exported. The header owns it; consumers cannot replace it or
 * add a second one.
 */
function AppShellSearchBar({
  onClick,
}: {
  onClick: () => void
}) {
  return (
    <button
      type="button"
      data-slot="app-shell-search-bar"
      onClick={onClick}
      // clarity-v2: token-gap — bg-stone-50 / hover:bg-stone-100 are direct Tailwind palette references, not DS semantic tokens; pending a semantic token for the search bar surface fill
      className="order-2 flex h-11 flex-1 items-center gap-2 rounded-md bg-stone-50 px-2.5 py-1 text-left text-base text-muted-foreground transition-[color,background] outline-none hover:bg-stone-100 hover:cursor-pointer focus-visible:border-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
    >
      <IconSearch className="size-4 shrink-0 opacity-50" />
      <span>Search Nivoda…</span>
    </button>
  )
}

interface AppShellActionsProps extends React.ComponentProps<"div"> {}

/**
 * Trailing region of the header for miscellaneous controls.
 *
 * Intended for user menus, notifications, app switchers, and similar
 * secondary actions. Uses `order-3` so it always renders to the
 * right of the hardcoded search bar regardless of DOM position
 * inside `AppShellHeader`.
 */
function AppShellActions({ className, ...props }: AppShellActionsProps) {
  return (
    <div
      data-slot="app-shell-actions"
      className={cn("order-3 flex shrink-0 items-center gap-2", className)}
      {...props}
    />
  )
}

/**
 * Hardcoded menu trigger rendered at the start of `AppShellHeader`.
 *
 * A fixed ghost `Button` at the default size with an `IconMenu2`
 * and the label "Menu". Wires itself to the nav sheet via the
 * `Sheet` provider that `AppShell` wraps its children in, so no
 * state management is required.
 *
 * Not exported. The header owns it; consumers cannot replace it,
 * reposition it, or add a second one. Every Nivoda app shell opens
 * its navigation with this exact button.
 */
function AppShellNavTrigger() {
  return (
    <SheetTrigger asChild>
      <Button
        data-slot="app-shell-nav-trigger"
        variant="ghost"
        size="default"
      >
        <IconMenu2 />
        Menu
      </Button>
    </SheetTrigger>
  )
}

interface AppShellNavigationSheetUser {
  name: string
  email?: string
  avatarSrc?: string
}

interface AppShellNavigationSheetProps
  extends Omit<React.ComponentProps<typeof SheetContent>, "side" | "title"> {
  title: React.ReactNode
  heading: React.ReactNode
  user: AppShellNavigationSheetUser
  onLogout: () => void
}

function computeInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ""
  if (words.length === 1) return words[0]!.charAt(0).toUpperCase()
  return (
    words[0]!.charAt(0).toUpperCase() +
    words[words.length - 1]!.charAt(0).toUpperCase()
  )
}

/**
 * Left-anchored navigation sheet for the app shell.
 *
 * Wraps `SheetContent` with `side="left"` locked — per the design
 * system, the application's main navigation is always on the left.
 * Opens when an `AppShellNavTrigger` in the header is activated, or
 * on mount when `AppShell`'s `defaultNavigationOpen` is true.
 *
 * The sheet owns its own three-region layout: a fixed header at the
 * top, a scrollable body in the middle, and a fixed footer at the
 * bottom with user identity and sign-out. Only the body is
 * consumer-populated — children render as the main navigation.
 *
 * ### Accessibility
 *
 * `title` is rendered in a visually-hidden `SheetTitle` so Radix can
 * wire the dialog's accessible name. It never appears on screen; the
 * visible header is the `heading` prop.
 *
 * ### Header
 *
 * `heading` renders inside the fixed top region. Pass a brand mark,
 * a page heading like "Supplier Area", or any other layout as a
 * `ReactNode`. The region's padding, border, and alignment are
 * owned by the component.
 *
 * ### Body
 *
 * `children` render inside the scrollable middle region. Compose the
 * body freely from `<nav>`, headings, and system components like
 * `Button` and `Separator`. Content primitives (sections, labels,
 * items, active state, badges) will land in a follow-up pass.
 *
 * ### Footer
 *
 * `user` and `onLogout` drive the fixed bottom region:
 *
 * - `user.name` and (optional) `user.email` render as a two-line
 *   identity block.
 * - `user.avatarSrc` (optional) populates an `AvatarImage`; the
 *   `AvatarFallback` is auto-computed from `user.name` ("John
 *   Appleseed" → "JA").
 * - `onLogout` is wired to a full-width outline "Log out" button.
 *
 * The footer is entirely structural — its layout, labels, and
 * component choices are a design ruling and cannot be overridden.
 * Surfaces that need a different footer are not app shells and
 * should use `Sheet` directly.
 */
function AppShellNavigationSheet({
  title,
  heading,
  user,
  onLogout,
  className,
  children,
  ...props
}: AppShellNavigationSheetProps) {
  return (
    <SheetContent
      data-slot="app-shell-navigation-sheet"
      side="left"
      className={cn("flex h-full flex-col gap-0 p-0", className)}
      {...props}
    >
      <SheetHeader className="sr-only">
        <SheetTitle>{title}</SheetTitle>
        <SheetDescription>
          Primary navigation for this Nivoda app.
        </SheetDescription>
      </SheetHeader>
      <div
        data-slot="app-shell-navigation-sheet-header"
        className="flex flex-none items-center gap-3 border-b border-border px-6 py-6"
      >
        {heading}
      </div>
      <div
        data-slot="app-shell-navigation-sheet-body"
        className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-6"
      >
        {children}
      </div>
      <div
        data-slot="app-shell-navigation-sheet-footer"
        className="flex flex-none flex-col gap-4 border-t border-border px-6 py-6"
      >
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            {user.avatarSrc ? (
              <AvatarImage src={user.avatarSrc} alt={user.name} />
            ) : null}
            <AvatarFallback>{computeInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{user.name}</span>
            {user.email ? (
              <span className="truncate text-sm text-muted-foreground">
                {user.email}
              </span>
            ) : null}
          </div>
        </div>
        <Button variant="outline" onClick={onLogout} block>
          Log out
        </Button>
      </div>
    </SheetContent>
  )
}

interface AppShellMainProps extends React.ComponentProps<"main"> {}

/**
 * Main page area below the header.
 *
 * Renders a `<main>` that fills the remaining viewport height and
 * wraps its children in an inner container that constrains
 * max-width and applies consistent page padding. The inner
 * container's max-width is controlled by the `full` prop on the
 * parent `AppShell` — when `full` is set, the inner container
 * stretches edge-to-edge; otherwise it caps at a standard content
 * width.
 */
function AppShellMain({ className, children, ...props }: AppShellMainProps) {
  return (
    <main
      data-slot="app-shell-main"
      className={cn("flex flex-1 flex-col", className)}
      {...props}
    >
      <div
        data-slot="app-shell-main-container"
        className="mx-auto w-full max-w-384 px-6 py-6 group-data-[full=true]/app-shell:max-w-none"
      >
        {children}
      </div>
    </main>
  )
}

export {
  AppShell,
  AppShellHeader,
  AppShellActions,
  AppShellNavigationSheet,
  AppShellMain,
}
export type {
  AppShellProps,
  AppShellHeaderProps,
  AppShellActionsProps,
  AppShellNavigationSheetProps,
  AppShellNavigationSheetUser,
  AppShellMainProps,
}
