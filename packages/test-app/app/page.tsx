import Link from "next/link";
import { Button } from "@/components/ui/button";

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
  );
}
