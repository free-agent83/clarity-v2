import Link from "next/link";
import { IconX } from "@tabler/icons-react";

const LOGOMARK =
  "https://www.figma.com/api/mcp/asset/aa4f9fea-b8d9-4f1d-ac25-7f94b9b6b788";

type LayoutConfiguratorProps = {
  heading: string;
  cancelHref: string;
  children: React.ReactNode;
};

export function LayoutConfigurator({
  heading,
  cancelHref,
  children,
}: LayoutConfiguratorProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="flex items-center justify-between px-4 py-3.5">
          <Link href="/buyer" aria-label="Minivoda Home">
            <img
              src={LOGOMARK}
              alt=""
              className="h-6 w-auto"
              style={{ width: 50.853 }}
            />
          </Link>
          <h1 className="text-base font-medium text-foreground">{heading}</h1>
          <Link
            href={cancelHref}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Cancel
            <IconX size={20} />
          </Link>
        </div>
      </header>
      <main className="flex flex-1 justify-center bg-background">
        <div className="w-full max-w-7xl px-5 pb-8 pt-5">{children}</div>
      </main>
    </div>
  );
}
