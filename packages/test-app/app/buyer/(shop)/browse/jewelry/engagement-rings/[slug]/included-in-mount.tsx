type IncludedInMountProps = {
  stones: Record<string, unknown>[];
  mounts: { metalWeight: number; metalKarat: string }[];
  metalTypeValue: string;
};

export function IncludedInMount({
  stones,
  mounts,
  metalTypeValue,
}: IncludedInMountProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl font-medium text-foreground">Included in mount</h2>
      <div className="flex flex-col">
        {stones.length > 0
          ? stones.map((stone: Record<string, unknown>, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-border py-4"
              >
                <span className="text-base text-muted-foreground">
                  Stone {i + 1}
                </span>
                <span className="text-base text-foreground">
                  {String(stone)}
                </span>
              </div>
            ))
          : mounts.length > 0 && (
              <div className="flex items-center justify-between border-b border-border py-4">
                <span className="text-base text-muted-foreground">Mount</span>
                <div className="flex flex-col items-end">
                  <span className="text-base text-foreground">
                    {mounts[0].metalKarat.replace("KT_", "")} &middot;{" "}
                    {mounts[0].metalWeight}g
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {metalTypeValue}
                  </span>
                </div>
              </div>
            )}
      </div>
      <p className="text-xs text-muted-foreground">
        Center stone not included. Proceed to stone selection to complete your
        ring.
      </p>
    </div>
  );
}
