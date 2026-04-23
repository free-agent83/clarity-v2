import Link from "next/link";

const LOGOMARK =
  "https://www.figma.com/api/mcp/asset/aa4f9fea-b8d9-4f1d-ac25-7f94b9b6b788";

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="flex items-center justify-between px-6 py-3.5">
          <Link href="/buyer" aria-label="Minivoda Home">
            <img
              src={LOGOMARK}
              alt="Minivoda"
              className="h-6 w-auto"
              style={{ width: 50.853 }}
            />
          </Link>
          <Link
            href="/buyer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to Minivoda ↗
          </Link>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted">
        <div className="px-6 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Minivoda · All rights reserved
        </div>
      </footer>
    </div>
  );
}
