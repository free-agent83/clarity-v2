import "./styles/globals.css";

export { cn } from "./lib/utils";

// ---------------------------------------------------------------------------
// Commented-out barrel for unstable components.
//
// Every component shipped in this package has a commented-out export line
// below. To publish a component as part of the public surface:
//   1. Uncomment the line(s) for that component.
//   2. Bump the component's status in its COMPONENT.md from `unstable` to
//      `stable` and set an appropriate version.
//   3. Land the change in its own PR alongside whatever work promoted it.
//
// See packages/components/CONTRIBUTING.md §Exports.
// ---------------------------------------------------------------------------

// ────────────────────── Atoms (32) ──────────────────────

// export { Alert, AlertTitle, AlertDescription, AlertAction } from "./components/atoms/alert/alert";
// export { AspectRatio } from "./components/atoms/aspect-ratio/aspect-ratio";
// export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarBadge } from "./components/atoms/avatar/avatar";
export { Badge, badgeVariants } from "./components/atoms/badge/badge";
export type { BadgeProps } from "./components/atoms/badge/badge";
export { Button, buttonVariants } from "./components/atoms/button/button";
export type { ButtonProps } from "./components/atoms/button/button";
// export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants } from "./components/atoms/button-group/button-group";
// export { Checkbox } from "./components/atoms/checkbox/checkbox";
// export { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./components/atoms/collapsible/collapsible";
// export { DirectionProvider, useDirection } from "./components/atoms/direction/direction";
// export { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from "./components/atoms/empty/empty";
// export { Field, FieldLabel, FieldDescription, FieldError, FieldGroup, FieldLegend, FieldSeparator, FieldSet, FieldContent, FieldTitle } from "./components/atoms/field/field";
// export { HoverCard, HoverCardTrigger, HoverCardContent } from "./components/atoms/hover-card/hover-card";
export { Input } from "./components/atoms/input/input";
export type { InputProps } from "./components/atoms/input/input";
// export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput, InputGroupTextarea } from "./components/atoms/input-group/input-group";
// export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "./components/atoms/input-otp/input-otp";
// export { Item, ItemMedia, ItemContent, ItemActions, ItemGroup, ItemSeparator, ItemTitle, ItemDescription, ItemHeader, ItemFooter } from "./components/atoms/item/item";
// export { Kbd, KbdGroup } from "./components/atoms/kbd/kbd";
export { Label } from "./components/atoms/label/label";
export type { LabelProps } from "./components/atoms/label/label";
export { Popover, PopoverAnchor, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "./components/atoms/popover/popover";
export type { PopoverProps, PopoverContentProps } from "./components/atoms/popover/popover";
// export { Progress } from "./components/atoms/progress/progress";
// export { RadioGroup, RadioGroupItem } from "./components/atoms/radio-group/radio-group";
// export { ScrollArea, ScrollBar } from "./components/atoms/scroll-area/scroll-area";
export { Separator } from "./components/atoms/separator/separator";
export type { SeparatorProps } from "./components/atoms/separator/separator";
export { Skeleton } from "./components/atoms/skeleton/skeleton";
export type { SkeletonProps } from "./components/atoms/skeleton/skeleton";
// export { Slider } from "./components/atoms/slider/slider";
// export { Toaster } from "./components/atoms/sonner/sonner";
// export { Spinner } from "./components/atoms/spinner/spinner";
// export { Switch } from "./components/atoms/switch/switch";
// export { Textarea } from "./components/atoms/textarea/textarea";
// export { Toggle, toggleVariants } from "./components/atoms/toggle/toggle";
export { ToggleGroup, ToggleGroupItem } from "./components/atoms/toggle-group/toggle-group";
export type { ToggleGroupProps, ToggleGroupItemProps } from "./components/atoms/toggle-group/toggle-group";
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/atoms/tooltip/tooltip";
export type { TooltipProps, TooltipContentProps } from "./components/atoms/tooltip/tooltip";

// ────────────────────── Molecules (14) ──────────────────────

// export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./components/molecules/accordion/accordion";
// export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger } from "./components/molecules/alert-dialog/alert-dialog";
export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "./components/molecules/breadcrumb/breadcrumb";
export type { BreadcrumbProps } from "./components/molecules/breadcrumb/breadcrumb";
// export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent } from "./components/molecules/card/card";
// export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, useCarousel } from "./components/molecules/carousel/carousel";
// export type { CarouselApi } from "./components/molecules/carousel/carousel";
// export { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxGroup, ComboboxLabel, ComboboxCollection, ComboboxEmpty, ComboboxSeparator, ComboboxChips, ComboboxChip, ComboboxChipsInput, ComboboxTrigger, ComboboxValue, useComboboxAnchor } from "./components/molecules/combobox/combobox";
// export { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator } from "./components/molecules/command/command";
export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from "./components/molecules/dialog/dialog";
export type { DialogProps, DialogContentProps, DialogFooterProps } from "./components/molecules/dialog/dialog";
// export { Drawer, DrawerPortal, DrawerOverlay, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription } from "./components/molecules/drawer/drawer";
export { DropdownMenu, DropdownMenuPortal, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "./components/molecules/dropdown-menu/dropdown-menu";
export type { DropdownMenuProps, DropdownMenuContentProps } from "./components/molecules/dropdown-menu/dropdown-menu";
// export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./components/molecules/pagination/pagination";
export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue } from "./components/molecules/select/select";
export type { SelectProps, SelectTriggerProps, SelectContentProps } from "./components/molecules/select/select";
export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from "./components/molecules/sheet/sheet";
export type { SheetProps, SheetContentProps } from "./components/molecules/sheet/sheet";
// export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants } from "./components/molecules/tabs/tabs";

// ────────────────────── Organisms (4) ──────────────────────

// export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle } from "./components/organisms/chart/chart";
// export type { ChartConfig } from "./components/organisms/chart/chart";
// export { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuContent, NavigationMenuTrigger, NavigationMenuLink, NavigationMenuIndicator, NavigationMenuViewport, navigationMenuTriggerStyle } from "./components/organisms/navigation-menu/navigation-menu";
// export { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger, useSidebar } from "./components/organisms/sidebar/sidebar";
// export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "./components/organisms/table/table";

// organisms — data-table
export { DataTable } from "./components/organisms/data-table/data-table";
export { DataTableHeader, DataTableCell } from "./components/organisms/data-table/data-table-cells";
export { getSelectColumn } from "./components/organisms/data-table/data-table-helpers";
export type {
  DataTableProps,
  DataTableConfig,
  DataTablePaginationConfig,
  DataTableToolbarConfig,
  DataTableServerSideConfig,
  SortOption,
  QuickFilter,
  DataTableHeaderProps,
  DataTableCellProps,
} from "./components/organisms/data-table/data-table-types";
