import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-24">
      <div className="max-w-4xl w-full text-center space-y-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/wordmark-white.svg"
          alt="Nivoda"
          className="h-8 w-auto mx-auto mb-10 opacity-90"
        />
        <h1 className="text-6xl font-semibold tracking-tight">Clarity V2</h1>
        <p className="text-xl text-fd-muted-foreground max-w-2xl mx-auto">
          Nivoda&apos;s design system. Tokens, components, patterns, and
          guidance — one browsable source, authored alongside the code.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/docs/get-started"
            className="px-6 py-3 rounded-md bg-fd-primary text-fd-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Get started
          </Link>
          <Link
            href="/docs/components"
            className="px-6 py-3 rounded-md border border-white/20 hover:bg-white/5 transition-colors"
          >
            Browse components
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-24 w-full max-w-5xl">
        <div>
          <h3 className="font-semibold mb-2">Tokens first</h3>
          <p className="text-sm text-fd-muted-foreground">
            OKLCH color, 4px spacing, 12 type roles. Every visual decision is
            a token — nothing is hardcoded.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Components, documented</h3>
          <p className="text-sm text-fd-muted-foreground">
            62 components built on shadcn/ui + Radix, each with usage
            guidelines, props, and do/don&apos;ts authored alongside the code.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Self-publishing</h3>
          <p className="text-sm text-fd-muted-foreground">
            Markdown in the repo is the source. Every push rebuilds the site.
            No sync, no drift, no separate CMS.
          </p>
        </div>
      </section>
    </main>
  );
}
