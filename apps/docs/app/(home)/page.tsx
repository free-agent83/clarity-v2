import Link from 'next/link';
import { Button } from '@nivoda/components';
import { ThemeWordmark } from '@/components/theme-wordmark';

export default function HomePage() {
  return (
    <main className="home-page min-h-screen flex flex-col items-center px-6 py-24">
      <div className="home-hero max-w-4xl w-full text-center">
        <ThemeWordmark className="h-8 mx-auto mb-10 opacity-90" />
        <h1 className="home-hero-title">
          Clarity is an <em>agentic design system.</em>
        </h1>
        <p className="home-lede w-full mx-auto">
          Code-first and agent-readable. Tokens, components, and docs live in
          one repo, so whoever builds UI ships design-correct output by
          construction.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/docs/get-started">Get started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/docs/components">Browse components</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
