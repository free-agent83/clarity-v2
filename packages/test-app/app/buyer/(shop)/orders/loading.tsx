import { Skeleton } from "@nivoda/components";

export default function OrdersListLoading() {
  return (
    <div className="flex flex-col gap-8 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-14 w-48" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>

      {/* Grid tabs */}
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-11 flex-1 max-w-sm rounded-lg" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-md" />
        ))}
      </div>

      {/* Table rows */}
      <div className="flex flex-col gap-0">
        <Skeleton className="h-10 w-full rounded-md" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="mt-1 h-20 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}
