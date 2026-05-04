"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Slot, Tabs as TabsPrimitive } from "radix-ui"
import { IconChevronRight } from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { useIsTabletUp } from "@/hooks/use-is-tablet-up"
import { Typography } from "@/components/atoms/typography/typography"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/molecules/sheet/sheet"

interface MegamenuGroupContextValue {
  activeId: string | null
  setActiveId: (id: string | null) => void
  anchorY: number
  groupRef: React.RefObject<HTMLElement | null>
}

const MegamenuGroupContext =
  React.createContext<MegamenuGroupContextValue | null>(null)

function useGroupContext(component: string): MegamenuGroupContextValue {
  const ctx = React.useContext(MegamenuGroupContext)
  if (!ctx) {
    throw new Error(`<${component}> must be rendered inside a <MegamenuGroup>.`)
  }
  return ctx
}

interface MegamenuItemContextValue {
  id: string
  contentId: string
  open: boolean
  trigger: "hover" | "click"
  triggerRef: React.RefObject<HTMLElement | null>
  triggerLabel: string | null
  setTriggerLabel: (label: string | null) => void
  scheduleOpen: () => void
  scheduleClose: () => void
  cancelTimers: () => void
  openImmediately: () => void
  closeImmediately: () => void
}

const MegamenuItemContext =
  React.createContext<MegamenuItemContextValue | null>(null)

function useItemContext(component: string): MegamenuItemContextValue {
  const ctx = React.useContext(MegamenuItemContext)
  if (!ctx) {
    throw new Error(`<${component}> must be rendered inside a <Megamenu>.`)
  }
  return ctx
}

interface MegamenuGroupProps extends React.ComponentProps<"nav"> { }

/**
 * Coordinator for a row of `<Megamenu>` instances. Renders a `<nav>`
 * landmark, tracks which megamenu is currently open, and provides the
 * y-anchor used to position the panel under the row.
 *
 * Only one `<Megamenu>` child can be open at a time — opening one closes
 * any sibling that was open. Cross-megamenu handoff is instant (no
 * `openDelay` is applied when another megamenu is already open).
 *
 * Non-`<Megamenu>` children render as-is and are ignored by the
 * coordinator. Provide your own row-item component (a styled `<a>` /
 * `<button>`) and use it both standalone for plain links and inside
 * `<MegamenuTrigger asChild>` for megamenu items.
 */
function MegamenuGroup({
  className,
  children,
  ...props
}: MegamenuGroupProps) {
  const groupRef = React.useRef<HTMLElement | null>(null)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [anchorY, setAnchorY] = React.useState<number>(0)

  React.useLayoutEffect(() => {
    const el = groupRef.current
    if (!el) return
    const update = () => {
      const rect = el.getBoundingClientRect()
      setAnchorY(rect.bottom)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      ro.disconnect()
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  const contextValue = React.useMemo(
    () => ({ activeId, setActiveId, anchorY, groupRef }),
    [activeId, anchorY]
  )

  return (
    <MegamenuGroupContext.Provider value={contextValue}>
      <nav
        ref={groupRef}
        data-slot="megamenu-group"
        className={cn("relative flex items-center", className)}
        {...props}
      >
        {children}
      </nav>
    </MegamenuGroupContext.Provider>
  )
}

interface MegamenuProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: "hover" | "click"
  openDelay?: number
  closeDelay?: number
  children: React.ReactNode
}

/**
 * Root for a single megamenu instance. Holds open state and timing
 * configuration; the actual trigger and content live in
 * `<MegamenuTrigger>` and `<MegamenuContent>` children.
 *
 * Below the `lg` breakpoint (1024px), the `trigger` prop is ignored —
 * activation is implicit click and the panel renders inside a Sheet.
 *
 * @param trigger    Activation mode. `"hover"` (default) opens after `openDelay`
 *                   on pointer-enter; `"click"` opens only on click.
 * @param openDelay  Delay (ms) before hover opens. Default 100. Skipped
 *                   when another megamenu in the group is already open.
 * @param closeDelay Grace period (ms) before mouseout closes. Default 150.
 */
function Megamenu({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  trigger = "hover",
  openDelay = 100,
  closeDelay = 150,
  children,
}: MegamenuProps) {
  const id = React.useId()
  const contentId = `${id}-content`
  const group = useGroupContext("Megamenu")

  const [openState, setOpenState] = React.useState(defaultOpen)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : openState

  const triggerRef = React.useRef<HTMLElement | null>(null)
  const [triggerLabel, setTriggerLabel] = React.useState<string | null>(null)
  const openTimerRef = React.useRef<number | null>(null)
  const closeTimerRef = React.useRef<number | null>(null)

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setOpenState(next)
      onOpenChange?.(next)
      if (next) {
        group.setActiveId(id)
      } else if (group.activeId === id) {
        group.setActiveId(null)
      }
    },
    [isControlled, onOpenChange, group, id]
  )

  const cancelTimers = React.useCallback(() => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const openImmediately = React.useCallback(() => {
    cancelTimers()
    setOpen(true)
  }, [cancelTimers, setOpen])

  const closeImmediately = React.useCallback(() => {
    cancelTimers()
    setOpen(false)
  }, [cancelTimers, setOpen])

  const scheduleOpen = React.useCallback(() => {
    cancelTimers()
    if (group.activeId !== null && group.activeId !== id) {
      openImmediately()
      return
    }
    openTimerRef.current = window.setTimeout(() => {
      setOpen(true)
    }, openDelay)
  }, [cancelTimers, group.activeId, id, openImmediately, openDelay, setOpen])

  const scheduleClose = React.useCallback(() => {
    cancelTimers()
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false)
    }, closeDelay)
  }, [cancelTimers, closeDelay, setOpen])

  React.useEffect(() => {
    if (open && group.activeId !== null && group.activeId !== id) {
      cancelTimers()
      if (!isControlled) setOpenState(false)
      onOpenChange?.(false)
    }
  }, [group.activeId, open, id, isControlled, onOpenChange, cancelTimers])

  React.useEffect(() => () => cancelTimers(), [cancelTimers])

  const contextValue = React.useMemo(
    () => ({
      id,
      contentId,
      open,
      trigger,
      triggerRef,
      triggerLabel,
      setTriggerLabel,
      scheduleOpen,
      scheduleClose,
      cancelTimers,
      openImmediately,
      closeImmediately,
    }),
    [
      id,
      contentId,
      open,
      trigger,
      triggerLabel,
      scheduleOpen,
      scheduleClose,
      cancelTimers,
      openImmediately,
      closeImmediately,
    ]
  )

  return (
    <MegamenuItemContext.Provider value={contextValue}>
      {children}
    </MegamenuItemContext.Provider>
  )
}

interface MegamenuTriggerProps extends React.ComponentProps<"button"> {
  asChild?: boolean
}

/**
 * Behavior + ARIA wrapper for the element that opens a megamenu.
 *
 * Unstyled by design — matches the Radix `Sheet.Trigger` /
 * `Dialog.Trigger` / `Tooltip.Trigger` pattern. Default rendering is a
 * bare `<button type="button">` with no styling. Production usage is
 * almost always `asChild`, wrapping the consumer's row-item component.
 *
 * The trigger automatically receives:
 *   - `aria-expanded`, `aria-controls`, `aria-haspopup="true"`
 *   - `data-state="open" | "closed"` for CSS attribute styling
 *   - pointer/click/keyboard handlers wired to the parent `<Megamenu>`
 */
function MegamenuTrigger({
  asChild = false,
  className,
  onPointerEnter,
  onPointerLeave,
  onClick,
  onFocus,
  onKeyDown,
  children,
  ...props
}: MegamenuTriggerProps) {
  const item = useItemContext("MegamenuTrigger")
  const isTabletUp = useIsTabletUp()
  const effectiveTrigger = isTabletUp ? item.trigger : "click"

  const setRefs = React.useCallback(
    (node: HTMLElement | null) => {
      item.triggerRef.current = node
      if (typeof node?.textContent === "string") {
        const label = node.textContent.trim()
        if (label && label !== item.triggerLabel) {
          item.setTriggerLabel(label)
        }
      }
    },
    [item]
  )

  const handlePointerEnter = (e: React.PointerEvent<HTMLButtonElement>) => {
    onPointerEnter?.(e)
    if (e.defaultPrevented) return
    if (e.pointerType !== "mouse") return
    if (effectiveTrigger !== "hover") return
    item.scheduleOpen()
  }

  const handlePointerLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
    onPointerLeave?.(e)
    if (e.defaultPrevented) return
    if (e.pointerType !== "mouse") return
    if (effectiveTrigger !== "hover") return
    item.scheduleClose()
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    if (e.defaultPrevented) return
    if (item.open) {
      item.closeImmediately()
    } else {
      item.openImmediately()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented) return
    if (e.key === "Escape" && item.open) {
      e.preventDefault()
      item.closeImmediately()
    }
  }

  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      ref={setRefs}
      type={asChild ? undefined : "button"}
      data-slot="megamenu-trigger"
      data-state={item.open ? "open" : "closed"}
      aria-expanded={item.open}
      aria-controls={item.contentId}
      aria-haspopup="true"
      className={className}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      onFocus={onFocus}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </Comp>
  )
}

interface MegamenuContentProps extends React.ComponentProps<"div"> {
  /**
   * Override for the panel's accessible label. Defaults to the trigger's
   * text content.
   */
  "aria-label"?: string
}

/**
 * Panel content for a megamenu. Renders via portal to `document.body`
 * on `lg` and up; renders inside a bottom Sheet below `lg`.
 *
 * Free-form children — typically composed of `<MegamenuTabs>`,
 * `<MegamenuLink>`, and `<MegamenuFooter>`, with consumer-supplied
 * markup for sections / headings / grids.
 */
function MegamenuContent({
  className,
  children,
  "aria-label": ariaLabel,
  ...props
}: MegamenuContentProps) {
  const item = useItemContext("MegamenuContent")
  const group = useGroupContext("MegamenuContent")
  const isTabletUp = useIsTabletUp()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!item.open || !isTabletUp) return
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null
      if (!target) return
      if (item.triggerRef.current?.contains(target)) return
      const portalEl = document.getElementById(item.contentId)
      if (portalEl?.contains(target)) return
      item.closeImmediately()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        item.closeImmediately()
        item.triggerRef.current?.focus()
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [item, isTabletUp])

  const label = ariaLabel ?? item.triggerLabel ?? undefined

  if (!isTabletUp) {
    return (
      <Sheet
        open={item.open}
        onOpenChange={(next) => {
          if (!next) item.closeImmediately()
        }}
      >
        <SheetContent
          side="bottom"
          data-slot="megamenu-content"
          className={cn(
            "max-h-[85vh] overflow-y-auto px-0 py-0",
            className
          )}
          aria-label={label}
          {...props}
        >
          <SheetTitle className="sr-only">{label ?? "Menu"}</SheetTitle>
          <SheetDescription className="sr-only">
            Navigation menu
          </SheetDescription>
          <div
            data-slot="megamenu-content-inner"
            className="flex flex-col gap-6 p-6"
          >
            {children}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  if (!mounted || !item.open) return null

  return createPortal(
    <div
      id={item.contentId}
      role="region"
      aria-label={label}
      data-slot="megamenu-content"
      data-state={item.open ? "open" : "closed"}
      className={cn(
        "fixed inset-x-0 z-50 duration-100",
        "data-open:animate-in data-open:fade-in-0",
        "data-closed:animate-out data-closed:fade-out-0",
        "motion-reduce:animate-none",
        className
      )}
      style={{ top: group.anchorY }}
      onPointerEnter={() => {
        if (item.trigger === "hover") item.cancelTimers()
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return
        if (item.trigger === "hover") item.scheduleClose()
      }}
      {...props}
    >
      <div className="mx-auto w-full max-w-7xl px-4 pt-1">
        <div
          data-slot="megamenu-content-inner"
          className="rounded-xl border border-border bg-popover text-popover-foreground shadow-lg"
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

interface MegamenuLinkProps
  extends Omit<React.ComponentProps<"a">, "title"> {
  href: string
  title: React.ReactNode
  description?: React.ReactNode
  leading?: React.ReactNode
  asChild?: boolean
}

/**
 * Atomic item inside a megamenu panel. Layout is leading content (left)
 * + text stack (title above optional description).
 *
 * Clicking the link closes the megamenu — set `data-keep-open` on the
 * anchor (or call `event.preventDefault()` from `onClick`) if you need
 * to suppress that behavior for non-navigation actions.
 */
function MegamenuLink({
  href,
  title,
  description,
  leading,
  asChild = false,
  className,
  onClick,
  children,
  ...props
}: MegamenuLinkProps) {
  const item = useItemContext("MegamenuLink")
  const Comp = asChild ? Slot.Root : "a"

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented) return
    const target = e.currentTarget
    if (target.dataset.keepOpen !== undefined) return
    item.closeImmediately()
  }

  const inner = (
    <>
      {leading ? (
        <div
          data-slot="megamenu-link-leading"
          aria-hidden="true"
          className="self-center"
        >
          {leading}
        </div>
      ) : null}
      <span
        data-slot="megamenu-link-text"
        className="flex min-w-0 flex-1 flex-col gap-0.5"
      >
        <Typography
          as="span"
          variant="body-2"
          data-slot="megamenu-link-title"
          className="text-foreground group-hover:text-accent-foreground"
        >
          {title}
        </Typography>
        {description ? (
          <Typography
            as="span"
            variant="caption"
            data-slot="megamenu-link-description"
            className="text-muted-foreground"
          >
            {description}
          </Typography>
        ) : null}
      </span>
    </>
  )

  return (
    <Comp
      data-slot="megamenu-link"
      href={asChild ? undefined : href}
      className={cn(
        "group flex items-start gap-3 rounded-md px-3 py-2 outline-none transition-colors",
        "hover:bg-accent focus-visible:bg-accent",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {asChild ? children : inner}
    </Comp>
  )
}

/**
 * Footer strip across the bottom of a megamenu panel. Free-form
 * children (typically a CTA + supporting text).
 */
function MegamenuFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="megamenu-footer"
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/40 px-4 py-3",
        className
      )}
      {...props}
    />
  )
}

interface MegamenuTabsProps
  extends React.ComponentProps<typeof TabsPrimitive.Root> { }

/**
 * Vertical tabs internal to a megamenu panel — tabs on the left,
 * content on the right. Active tab follows hover/focus on its trigger.
 *
 * On collapsed layouts (below `lg`), the tablist is hidden and each
 * tab's panel is rendered as a section with the tab's label as a
 * heading. Consumers don't need to handle this — the component does it
 * via `data-slot` selectors and CSS.
 */
function MegamenuTabs({
  className,
  orientation = "vertical",
  children,
  ...props
}: MegamenuTabsProps) {
  return (
    <TabsPrimitive.Root
      data-slot="megamenu-tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "group/megamenu-tabs flex flex-col lg:flex-row",
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Root>
  )
}

/**
 * Container for the tab triggers. Hidden on collapsed layouts.
 */
function MegamenuTabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="megamenu-tabs-list"
      className={cn(
        "hidden flex-col gap-1 border-r border-border p-4 lg:flex lg:w-70 lg:shrink-0",
        className
      )}
      {...props}
    />
  )
}

type MegamenuTabsTriggerProps = React.ComponentProps<
  typeof TabsPrimitive.Trigger
> & {
  /**
   * Optional content rendered before the label — typically an icon, but
   * accepts any node.
   */
  leading?: React.ReactNode
}

/**
 * A single tab trigger inside `<MegamenuTabsList>`. Activates on hover
 * and focus.
 */
function MegamenuTabsTrigger({
  className,
  onPointerEnter,
  leading,
  children,
  ...props
}: MegamenuTabsTriggerProps) {
  const handlePointerEnter = (e: React.PointerEvent<HTMLButtonElement>) => {
    onPointerEnter?.(e)
    if (e.defaultPrevented) return
    if (e.pointerType !== "mouse") return
    e.currentTarget.focus()
  }

  return (
    <TabsPrimitive.Trigger
      data-slot="megamenu-tabs-trigger"
      onPointerEnter={handlePointerEnter}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors cursor-pointer",
        "hover:bg-muted hover:text-foreground",
        "focus-visible:bg-muted focus-visible:text-foreground focus-visible:outline-none",
        "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
        className
      )}
      {...props}
    >
      {leading ? (
        <span
          data-slot="megamenu-tabs-trigger-leading"
          aria-hidden="true"
          className="shrink-0"
        >
          {leading}
        </span>
      ) : null}
      {children}
      <IconChevronRight
        aria-hidden="true"
        className="ml-auto size-4 shrink-0 text-muted-foreground/30"
      />
    </TabsPrimitive.Trigger>
  )
}

/**
 * Panel rendered when its sibling `<MegamenuTabsTrigger value>` is
 * active. On collapsed layouts the panel is unwrapped and every
 * `MegamenuTabsPanel` renders, prefixed by its `tabLabel`.
 */
function MegamenuTabsPanel({
  className,
  tabLabel,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content> & {
  /**
   * Heading shown above this panel on collapsed layouts. Defaults to
   * the `value`. Ignored on `lg+`.
   */
  tabLabel?: React.ReactNode
}) {
  const fallbackLabel =
    typeof props.value === "string" ? props.value : undefined
  const label = tabLabel ?? fallbackLabel
  return (
    <TabsPrimitive.Content
      data-slot="megamenu-tabs-panel"
      forceMount
      className={cn(
        "flex-1 outline-none",
        "data-[state=inactive]:hidden lg:data-[state=inactive]:hidden",
        "group-data-[orientation=vertical]/megamenu-tabs:max-lg:!block",
        className
      )}
      {...props}
    >
      {label !== undefined ? (
        <h3
          data-slot="megamenu-tabs-panel-label"
          className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase lg:hidden"
        >
          {label}
        </h3>
      ) : null}
      {props.children}
    </TabsPrimitive.Content>
  )
}

export {
  MegamenuGroup,
  Megamenu,
  MegamenuTrigger,
  MegamenuContent,
  MegamenuLink,
  MegamenuFooter,
  MegamenuTabs,
  MegamenuTabsList,
  MegamenuTabsTrigger,
  MegamenuTabsPanel,
}
export type {
  MegamenuGroupProps,
  MegamenuProps,
  MegamenuTriggerProps,
  MegamenuContentProps,
  MegamenuLinkProps,
  MegamenuTabsProps,
}
