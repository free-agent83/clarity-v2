import Link from "next/link";

import { CancelButton } from "./cancel-button";

const LOGOMARK =
  "https://www.figma.com/api/mcp/asset/aa4f9fea-b8d9-4f1d-ac25-7f94b9b6b788";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="flex items-center justify-between px-4 py-3.5">
          {/* Left: logo + title */}
          <div className="flex items-center gap-3">
            <Link href="/buyer" aria-label="Minivoda Home">
              <img
                src={LOGOMARK}
                alt=""
                className="h-6 w-auto"
                style={{ width: 50.853 }}
              />
            </Link>
            <span className="text-base font-medium text-foreground">
              Minivoda Checkout
            </span>
          </div>

          {/* Right: help + cancel */}
          <div className="flex items-center gap-3">
            <Link
              href="/help"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Help
            </Link>
            <CancelButton />
          </div>
        </div>
      </header>
      <main className="flex flex-1 justify-center bg-background">
        <div className="w-full max-w-7xl px-5 pb-8 pt-5">{children}</div>
      </main>
    </div>
  );
}
