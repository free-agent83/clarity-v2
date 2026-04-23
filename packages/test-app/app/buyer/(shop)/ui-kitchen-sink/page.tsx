"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  IconSun,
  IconMoon,
  IconBell,
  IconTrash,
  IconUser,
  IconSettings,
  IconAlertTriangle,
  IconInfoCircle,
  IconCheck,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

// ─── Layout helpers ────────────────────────────────────────────────────────────

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <Separator className="mt-3" />
      </div>
      {children}
    </section>
  );
}

function Sub({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── Color swatch ─────────────────────────────────────────────────────────────

function Swatch({
  name,
  cssVar,
  on,
}: {
  name: string;
  cssVar: string;
  on?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="h-14 w-full rounded-lg ring-1 ring-foreground/10"
        style={{ background: `var(${cssVar})` }}
      />
      <p className="text-xs font-medium">{name}</p>
      <p className="font-mono text-[10px] text-muted-foreground">{cssVar}</p>
      {on && (
        <div
          className="flex h-6 items-center justify-center rounded text-[10px] font-medium ring-1 ring-foreground/10"
          style={{ background: `var(${cssVar})`, color: `var(${on})` }}
        >
          Aa
        </div>
      )}
    </div>
  );
}

// ─── Radius swatch ────────────────────────────────────────────────────────────

function RadiusSwatch({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="h-16 w-16 bg-primary/20 ring-1 ring-primary/30"
        style={{ borderRadius: `var(${value})` }}
      />
      <p className="text-xs font-medium">{name}</p>
      <p className="font-mono text-[10px] text-muted-foreground">{value}</p>
    </div>
  );
}

// ─── Table data ───────────────────────────────────────────────────────────────

const tableRows = [
  {
    id: "INV-001",
    name: "Aurora Ltd",
    status: "Paid",
    amount: "$1,250.00",
    date: "Jan 2 2026",
  },
  {
    id: "INV-002",
    name: "Kestrel Inc",
    status: "Pending",
    amount: "$840.50",
    date: "Jan 9 2026",
  },
  {
    id: "INV-003",
    name: "Merlin Corp",
    status: "Overdue",
    amount: "$3,200.00",
    date: "Dec 28 2025",
  },
  {
    id: "INV-004",
    name: "Wren Studio",
    status: "Paid",
    amount: "$560.00",
    date: "Jan 14 2026",
  },
];

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  Paid: "default",
  Pending: "secondary",
  Overdue: "destructive",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KitchenSinkPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [sliderValue, setSliderValue] = React.useState([40]);
  const [rangeValue, setRangeValue] = React.useState([20, 70]);
  const [radio, setRadio] = React.useState("option-1");

  const navItems = [
    { id: "colours", label: "Colours" },
    { id: "typography", label: "Typography" },
    { id: "spacing", label: "Spacing & Radius" },
    { id: "buttons", label: "Buttons" },
    { id: "badges", label: "Badges" },
    { id: "forms", label: "Form Inputs" },
    { id: "selection", label: "Selection" },
    { id: "data", label: "Data Display" },
    { id: "feedback", label: "Feedback" },
    { id: "navigation", label: "Navigation" },
    { id: "disclosure", label: "Disclosure" },
    { id: "overlays", label: "Overlays" },
  ];

  return (
    <TooltipProvider>
      {/* Sticky header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div>
            <h1 className="text-base font-semibold">UI Kitchen Sink</h1>
            <p className="text-xs text-muted-foreground">
              Design system reference — all tokens, typography, and components
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
                aria-label="Toggle dark mode"
              >
                {resolvedTheme === "dark" ? (
                  <IconSun className="size-4" />
                ) : (
                  <IconMoon className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Toggle {resolvedTheme === "dark" ? "light" : "dark"} mode
              <span className="ml-1.5 opacity-60">(D)</span>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Section nav */}
        <div className="mx-auto max-w-7xl overflow-x-auto px-6">
          <div className="flex gap-1 pb-0.5">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="shrink-0 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-16 px-6 py-12">
        {/* ── 1. Colours ─────────────────────────────────────────────────────── */}
        <Section id="colours" title="Colour Tokens">
          <Sub title="Semantic surfaces">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              <Swatch
                name="Background"
                cssVar="--background"
                on="--foreground"
              />
              <Swatch
                name="Foreground"
                cssVar="--foreground"
                on="--background"
              />
              <Swatch name="Card" cssVar="--card" on="--card-foreground" />
              <Swatch
                name="Popover"
                cssVar="--popover"
                on="--popover-foreground"
              />
              <Swatch name="Border" cssVar="--border" />
              <Swatch name="Input" cssVar="--input" />
            </div>
          </Sub>

          <Sub title="Brand & action">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              <Swatch
                name="Primary"
                cssVar="--primary"
                on="--primary-foreground"
              />
              <Swatch
                name="Primary Foreground"
                cssVar="--primary-foreground"
                on="--primary"
              />
              <Swatch
                name="Secondary"
                cssVar="--secondary"
                on="--secondary-foreground"
              />
              <Swatch
                name="Secondary Foreground"
                cssVar="--secondary-foreground"
                on="--secondary"
              />
              <Swatch
                name="Accent"
                cssVar="--accent"
                on="--accent-foreground"
              />
              <Swatch name="Destructive" cssVar="--destructive" />
            </div>
          </Sub>

          <Sub title="Muted & ring">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              <Swatch name="Muted" cssVar="--muted" on="--muted-foreground" />
              <Swatch
                name="Muted Foreground"
                cssVar="--muted-foreground"
                on="--muted"
              />
              <Swatch name="Ring" cssVar="--ring" />
            </div>
          </Sub>

          <Sub title="Chart palette">
            <div className="grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <Swatch key={n} name={`Chart ${n}`} cssVar={`--chart-${n}`} />
              ))}
            </div>
          </Sub>

          <Sub title="Sidebar">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              <Swatch
                name="Sidebar"
                cssVar="--sidebar"
                on="--sidebar-foreground"
              />
              <Swatch
                name="Sidebar Primary"
                cssVar="--sidebar-primary"
                on="--sidebar-primary-foreground"
              />
              <Swatch
                name="Sidebar Accent"
                cssVar="--sidebar-accent"
                on="--sidebar-accent-foreground"
              />
              <Swatch name="Sidebar Border" cssVar="--sidebar-border" />
              <Swatch name="Sidebar Ring" cssVar="--sidebar-ring" />
            </div>
          </Sub>
        </Section>

        {/* ── 2. Typography ───────────────────────────────────────────────────── */}
        <Section id="typography" title="Typography">
          <Sub title="Font families">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card size="sm">
                <CardHeader>
                  <CardTitle>Sans — Inter</CardTitle>
                  <CardDescription className="font-mono text-xs">
                    --font-sans
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-sans text-sm">
                    The quick brown fox jumps over the lazy dog. 0123456789.
                  </p>
                </CardContent>
              </Card>
              <Card size="sm">
                <CardHeader>
                  <CardTitle>Mono — Geist Mono</CardTitle>
                  <CardDescription className="font-mono text-xs">
                    --font-mono
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-mono text-sm">
                    The quick brown fox jumps over the lazy dog. 0123456789.
                  </p>
                </CardContent>
              </Card>
            </div>
          </Sub>

          <Sub title="Scale">
            <div className="space-y-3 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
              {[
                { cls: "text-4xl font-bold", label: "text-4xl / 36px" },
                { cls: "text-3xl font-bold", label: "text-3xl / 30px" },
                { cls: "text-2xl font-semibold", label: "text-2xl / 24px" },
                { cls: "text-xl font-semibold", label: "text-xl / 20px" },
                { cls: "text-lg font-medium", label: "text-lg / 18px" },
                { cls: "text-base", label: "text-base / 16px" },
                { cls: "text-sm", label: "text-sm / 14px" },
                { cls: "text-xs", label: "text-xs / 12px" },
              ].map(({ cls, label }) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-4"
                >
                  <span className={cls}>Display heading</span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </Sub>

          <Sub title="Weights">
            <div className="flex flex-wrap gap-6 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
              {[
                ["font-normal", "Normal 400"],
                ["font-medium", "Medium 500"],
                ["font-semibold", "Semibold 600"],
                ["font-bold", "Bold 700"],
              ].map(([cls, label]) => (
                <div key={cls} className="space-y-0.5">
                  <p className={`${cls} text-base`}>{label}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {cls}
                  </p>
                </div>
              ))}
            </div>
          </Sub>

          <Sub title="Text colours">
            <div className="flex flex-wrap gap-6 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
              {[
                ["text-foreground", "Foreground"],
                ["text-muted-foreground", "Muted foreground"],
                ["text-primary", "Primary"],
                ["text-destructive", "Destructive"],
              ].map(([cls, label]) => (
                <div key={cls} className="space-y-0.5">
                  <p className={`${cls} text-sm font-medium`}>{label}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {cls}
                  </p>
                </div>
              ))}
            </div>
          </Sub>
        </Section>

        {/* ── 3. Spacing & Radius ─────────────────────────────────────────────── */}
        <Section id="spacing" title="Spacing & Radius">
          <Sub title="Border radius tokens">
            <div className="flex flex-wrap items-end gap-6 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
              <RadiusSwatch name="sm" value="--radius-sm" />
              <RadiusSwatch name="md" value="--radius-md" />
              <RadiusSwatch name="lg" value="--radius-lg" />
              <RadiusSwatch name="xl" value="--radius-xl" />
              <RadiusSwatch name="2xl" value="--radius-2xl" />
              <RadiusSwatch name="3xl" value="--radius-3xl" />
              <RadiusSwatch name="4xl" value="--radius-4xl" />
            </div>
          </Sub>

          <Sub title="Spacing scale (Tailwind 4-based)">
            <div className="space-y-1.5 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
              {[1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24].map((n) => (
                <div key={n} className="flex items-center gap-3">
                  <span className="w-10 shrink-0 font-mono text-xs text-muted-foreground">
                    {n}
                  </span>
                  <div
                    className="h-4 rounded-sm bg-primary/30"
                    style={{ width: `${n * 4}px` }}
                  />
                  <span className="font-mono text-xs text-muted-foreground">
                    {n * 4}px
                  </span>
                </div>
              ))}
            </div>
          </Sub>
        </Section>

        {/* ── 4. Buttons ──────────────────────────────────────────────────────── */}
        <Section id="buttons" title="Buttons">
          <Sub title="Variants">
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
          </Sub>

          <Sub title="Sizes">
            <div className="flex flex-wrap items-center gap-2">
              <Button size="xs">Extra Small</Button>
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </Sub>

          <Sub title="Icon buttons">
            <div className="flex flex-wrap items-center gap-2">
              <Button size="icon-xs" variant="outline" aria-label="Settings XS">
                <IconSettings />
              </Button>
              <Button size="icon-sm" variant="outline" aria-label="Settings SM">
                <IconSettings />
              </Button>
              <Button size="icon" variant="outline" aria-label="Settings">
                <IconSettings />
              </Button>
              <Button size="icon-lg" variant="outline" aria-label="Settings LG">
                <IconSettings />
              </Button>
            </div>
          </Sub>

          <Sub title="With icons">
            <div className="flex flex-wrap gap-2">
              <Button>
                <IconBell data-icon="inline-start" />
                Notifications
              </Button>
              <Button variant="outline">
                Settings
                <IconSettings data-icon="inline-end" />
              </Button>
              <Button variant="destructive">
                <IconTrash data-icon="inline-start" />
                Delete
              </Button>
            </div>
          </Sub>

          <Sub title="States">
            <div className="flex flex-wrap gap-2">
              <Button disabled>Disabled</Button>
              <Button variant="outline" disabled>
                Disabled outline
              </Button>
              <Button>
                <Spinner className="size-4" />
                Loading
              </Button>
            </div>
          </Sub>
        </Section>

        {/* ── 5. Badges ───────────────────────────────────────────────────────── */}
        <Section id="badges" title="Badges">
          <Sub title="Variants">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="ghost">Ghost</Badge>
            </div>
          </Sub>

          <Sub title="With icons">
            <div className="flex flex-wrap gap-2">
              <Badge>
                <IconCheck data-icon="inline-start" />
                Verified
              </Badge>
              <Badge variant="destructive">
                <IconAlertTriangle data-icon="inline-start" />
                Overdue
              </Badge>
              <Badge variant="secondary">
                <IconBell data-icon="inline-start" />
                Notifications
              </Badge>
            </div>
          </Sub>
        </Section>

        {/* ── 6. Form Inputs ──────────────────────────────────────────────────── */}
        <Section id="forms" title="Form Inputs">
          <div className="grid gap-8 sm:grid-cols-2">
            <Sub title="Text inputs">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ks-default">Default</Label>
                  <Input id="ks-default" placeholder="Enter value…" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ks-disabled">Disabled</Label>
                  <Input id="ks-disabled" placeholder="Cannot edit" disabled />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ks-invalid">Invalid</Label>
                  <Input
                    id="ks-invalid"
                    aria-invalid="true"
                    placeholder="Error state"
                    defaultValue="Bad input"
                  />
                </div>
              </div>
            </Sub>

            <Sub title="Textarea">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ks-textarea">Default</Label>
                  <Textarea
                    id="ks-textarea"
                    placeholder="Enter longer text…"
                    rows={3}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ks-textarea-disabled">Disabled</Label>
                  <Textarea
                    id="ks-textarea-disabled"
                    placeholder="Read only"
                    disabled
                    rows={3}
                  />
                </div>
              </div>
            </Sub>

            <Sub title="Select">
              <div className="space-y-1.5">
                <Label>Framework</Label>
                <Select defaultValue="next">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a framework" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="next">Next.js</SelectItem>
                    <SelectItem value="remix">Remix</SelectItem>
                    <SelectItem value="astro">Astro</SelectItem>
                    <SelectItem value="sveltekit" disabled>
                      SvelteKit (disabled)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Sub>

            <Sub title="Input sizes">
              <div className="space-y-2">
                <Input className="h-8 text-sm" placeholder="Small (h-8)" />
                <Input placeholder="Default (h-9)" />
              </div>
            </Sub>
          </div>
        </Section>

        {/* ── 7. Selection Controls ───────────────────────────────────────────── */}
        <Section id="selection" title="Selection Controls">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Sub title="Checkbox">
              <div className="space-y-2.5">
                {[
                  { id: "c1", label: "Checked", defaultChecked: true },
                  { id: "c2", label: "Unchecked", defaultChecked: false },
                  {
                    id: "c3",
                    label: "Disabled",
                    defaultChecked: false,
                    disabled: true,
                  },
                  {
                    id: "c4",
                    label: "Checked + disabled",
                    defaultChecked: true,
                    disabled: true,
                  },
                ].map(({ id, label, defaultChecked, disabled }) => (
                  <div key={id} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      defaultChecked={defaultChecked}
                      disabled={disabled}
                    />
                    <Label
                      htmlFor={id}
                      className={disabled ? "opacity-50" : ""}
                    >
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </Sub>

            <Sub title="Radio">
              <RadioGroup value={radio} onValueChange={setRadio}>
                {["option-1", "option-2", "option-3"].map((val) => (
                  <div key={val} className="flex items-center gap-2">
                    <RadioGroupItem value={val} id={val} />
                    <Label htmlFor={val}>
                      {val
                        .replace("-", " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Label>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="option-4" id="option-4" disabled />
                  <Label htmlFor="option-4" className="opacity-50">
                    Option 4 (disabled)
                  </Label>
                </div>
              </RadioGroup>
            </Sub>

            <Sub title="Switch">
              <div className="space-y-3">
                {[
                  { id: "s1", label: "Default (sm)", size: "sm" as const },
                  { id: "s2", label: "Default", size: "default" as const },
                ].map(({ id, label, size }) => (
                  <div key={id} className="flex items-center gap-2">
                    <Switch id={id} defaultChecked size={size} />
                    <Label htmlFor={id}>{label}</Label>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Switch id="s-off" />
                  <Label htmlFor="s-off">Off</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="s-dis" disabled defaultChecked />
                  <Label htmlFor="s-dis" className="opacity-50">
                    Disabled
                  </Label>
                </div>
              </div>
            </Sub>

            <Sub title="Slider">
              <div className="space-y-6 pt-1">
                <div className="space-y-2">
                  <Label>
                    Single value:{" "}
                    <span className="font-mono text-xs">{sliderValue[0]}</span>
                  </Label>
                  <Slider
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    min={0}
                    max={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Range:{" "}
                    <span className="font-mono text-xs">
                      {rangeValue[0]}–{rangeValue[1]}
                    </span>
                  </Label>
                  <Slider
                    value={rangeValue}
                    onValueChange={setRangeValue}
                    min={0}
                    max={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="opacity-50">Disabled</Label>
                  <Slider defaultValue={[60]} disabled />
                </div>
              </div>
            </Sub>
          </div>
        </Section>

        {/* ── 8. Data Display ─────────────────────────────────────────────────── */}
        <Section id="data" title="Data Display">
          <Sub title="Table">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-xs">
                          {row.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {row.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={statusVariant[row.status] ?? "outline"}
                          >
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{row.amount}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {row.date}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Sub>

          <Sub title="Cards">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Default card</CardTitle>
                  <CardDescription>
                    A standard card with header, content and footer.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Cards are the primary surface for grouping related content.
                  </p>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button size="sm" variant="outline">
                    Action
                  </Button>
                </CardFooter>
              </Card>

              <Card size="sm">
                <CardHeader>
                  <CardTitle>Small card</CardTitle>
                  <CardDescription>
                    Uses size=&quot;sm&quot; prop.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={65} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>With avatar</CardTitle>
                  <CardDescription>Avatars in a card context.</CardDescription>
                </CardHeader>
                <CardContent>
                  <AvatarGroup>
                    <Avatar>
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarFallback>KL</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarFallback>MN</AvatarFallback>
                    </Avatar>
                    <AvatarGroupCount>+4</AvatarGroupCount>
                  </AvatarGroup>
                </CardContent>
              </Card>
            </div>
          </Sub>

          <Sub title="Avatars">
            <div className="flex flex-wrap items-end gap-8 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Sizes</p>
                <div className="flex items-end gap-3">
                  <Avatar size="sm">
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>
                  <Avatar size="default">
                    <AvatarFallback>MD</AvatarFallback>
                  </Avatar>
                  <Avatar size="lg">
                    <AvatarFallback>LG</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">With badge</p>
                <div className="flex items-end gap-3">
                  <Avatar size="default">
                    <AvatarFallback>AB</AvatarFallback>
                    <AvatarBadge />
                  </Avatar>
                  <Avatar size="lg">
                    <AvatarFallback>CD</AvatarFallback>
                    <AvatarBadge />
                  </Avatar>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Group</p>
                <AvatarGroup>
                  <Avatar>
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>B</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>C</AvatarFallback>
                  </Avatar>
                  <AvatarGroupCount>+7</AvatarGroupCount>
                </AvatarGroup>
              </div>
            </div>
          </Sub>

          <Sub title="Progress">
            <div className="space-y-4 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
              {[10, 33, 65, 90, 100].map((v) => (
                <div key={v} className="flex items-center gap-4">
                  <span className="w-8 shrink-0 font-mono text-xs text-muted-foreground">
                    {v}%
                  </span>
                  <Progress value={v} className="flex-1" />
                </div>
              ))}
            </div>
          </Sub>

          <Sub title="Skeleton">
            <div className="max-w-sm space-y-3 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          </Sub>

          <Sub title="Separator">
            <div className="space-y-3 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
              <p className="text-sm">Content above</p>
              <Separator />
              <p className="text-sm">Content below</p>
              <div className="flex h-10 items-center gap-4">
                <span className="text-sm">Left</span>
                <Separator orientation="vertical" />
                <span className="text-sm">Right</span>
              </div>
            </div>
          </Sub>
        </Section>

        {/* ── 9. Feedback ─────────────────────────────────────────────────────── */}
        <Section id="feedback" title="Feedback">
          <Sub title="Alerts">
            <div className="space-y-3">
              <Alert>
                <IconInfoCircle />
                <AlertTitle>Info</AlertTitle>
                <AlertDescription>
                  This is an informational message about the current state.
                </AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <IconAlertTriangle />
                <AlertTitle>Destructive</AlertTitle>
                <AlertDescription>
                  Something went wrong. Please review and try again.
                </AlertDescription>
              </Alert>
            </div>
          </Sub>

          <Sub title="Spinners">
            <div className="flex flex-wrap items-center gap-6 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
              <Spinner className="size-3" />
              <Spinner className="size-4" />
              <Spinner className="size-5" />
              <Spinner className="size-6" />
              <Spinner className="size-8" />
            </div>
          </Sub>
        </Section>

        {/* ── 10. Navigation ──────────────────────────────────────────────────── */}
        <Section id="navigation" title="Navigation">
          <Sub title="Tabs — default">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="settings" disabled>
                  Settings
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="overview"
                className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
              >
                <p className="text-sm text-muted-foreground">
                  Overview content.
                </p>
              </TabsContent>
              <TabsContent
                value="analytics"
                className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
              >
                <p className="text-sm text-muted-foreground">
                  Analytics content.
                </p>
              </TabsContent>
              <TabsContent
                value="reports"
                className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
              >
                <p className="text-sm text-muted-foreground">
                  Reports content.
                </p>
              </TabsContent>
            </Tabs>
          </Sub>

          <Sub title="Tabs — line variant">
            <Tabs defaultValue="month">
              <TabsList variant="line">
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
              <TabsContent
                value="month"
                className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
              >
                <p className="text-sm text-muted-foreground">Monthly view.</p>
              </TabsContent>
              <TabsContent
                value="day"
                className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
              >
                <p className="text-sm text-muted-foreground">Daily view.</p>
              </TabsContent>
              <TabsContent
                value="week"
                className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
              >
                <p className="text-sm text-muted-foreground">Weekly view.</p>
              </TabsContent>
              <TabsContent
                value="year"
                className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
              >
                <p className="text-sm text-muted-foreground">Yearly view.</p>
              </TabsContent>
            </Tabs>
          </Sub>

          <Sub title="Breadcrumb">
            <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Products</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Diamonds</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Round 1.5ct D VS1</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </Sub>

          <Sub title="Pagination">
            <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>
                      2
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">12</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </Sub>
        </Section>

        {/* ── 11. Disclosure ──────────────────────────────────────────────────── */}
        <Section id="disclosure" title="Disclosure">
          <Sub title="Accordion">
            <div className="max-w-2xl rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <Accordion type="single" collapsible defaultValue="item-1">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is a digital twin?</AccordionTrigger>
                  <AccordionContent>
                    A digital twin is a virtual representation of a physical
                    object, process, or system that mirrors its real-world
                    counterpart in real time.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    How are diamond grades verified?
                  </AccordionTrigger>
                  <AccordionContent>
                    Diamond grades are verified by certified gemological
                    laboratories such as GIA and IGI, which assess the 4Cs: cut,
                    colour, clarity, and carat weight.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    Can I integrate this with my ERP?
                  </AccordionTrigger>
                  <AccordionContent>
                    Yes. The platform exposes REST and GraphQL APIs that can be
                    connected to most modern ERP and inventory management
                    systems.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </Sub>
        </Section>

        {/* ── 12. Overlays ────────────────────────────────────────────────────── */}
        <Section id="overlays" title="Overlays">
          <Sub title="Dialog, AlertDialog & Sheet">
            <div className="flex flex-wrap gap-3">
              {/* Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here. Click save when
                      you&apos;re done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="d-name">Name</Label>
                      <Input id="d-name" defaultValue="Jordan Lee" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="d-email">Email</Label>
                      <Input id="d-email" defaultValue="jordan@example.com" />
                    </div>
                  </div>
                  <DialogFooter showCloseButton>
                    <Button>Save changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* AlertDialog */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete item</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The item will be permanently
                      deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Open Sheet</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter results</SheetTitle>
                    <SheetDescription>
                      Narrow down the inventory using the filters below.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-4 p-4">
                    <div className="space-y-1.5">
                      <Label>Shape</Label>
                      <Select>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Any shape" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="round">Round</SelectItem>
                          <SelectItem value="princess">Princess</SelectItem>
                          <SelectItem value="oval">Oval</SelectItem>
                          <SelectItem value="cushion">Cushion</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>
                        Carat weight:{" "}
                        <span className="font-mono text-xs text-muted-foreground">
                          0–5ct
                        </span>
                      </Label>
                      <Slider defaultValue={[2]} min={0} max={5} step={0.1} />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </Sub>

          <Sub title="Tooltip">
            <div className="flex flex-wrap gap-3 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
              {(
                [
                  ["top", "Tooltip top"],
                  ["right", "Tooltip right"],
                  ["bottom", "Tooltip bottom"],
                  ["left", "Tooltip left"],
                ] as const
              ).map(([side, label]) => (
                <Tooltip key={side}>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm">
                      {side}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={side}>{label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </Sub>

          <Sub title="Popover">
            <div className="flex gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <IconUser data-icon="inline-start" />
                    Open popover
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start">
                  <PopoverHeader>
                    <PopoverTitle>Account settings</PopoverTitle>
                    <PopoverDescription>
                      Update your display name and preferences.
                    </PopoverDescription>
                  </PopoverHeader>
                  <div className="space-y-1.5">
                    <Label htmlFor="pop-name">Display name</Label>
                    <Input id="pop-name" placeholder="Enter name…" />
                  </div>
                  <Button size="sm" className="w-full">
                    Save
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          </Sub>
        </Section>
      </main>
    </TooltipProvider>
  );
}
