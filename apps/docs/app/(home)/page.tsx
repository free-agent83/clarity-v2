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
        <h1 className="text-6xl font-semibold tracking-tight">
          Clarity is an agentic design system.
        </h1>
        <p className="text-xl text-fd-muted-foreground max-w-2xl mx-auto">
          Code-first and agent-readable. Tokens, components, and docs live in
          one repo, so whoever builds UI ships design-correct output by
          construction.
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
        <Link
          href="/docs/principles/code-first"
          className="block rounded-md p-4 -m-4 hover:bg-white/5 transition-colors"
        >
          <h3 className="font-semibold mb-2">Code-first</h3>
          <p className="text-sm text-fd-muted-foreground">
            Tokens as JSON, components as React, docs as markdown. One
            pipeline, no separate design source of truth to drift away from
            the code.
          </p>
        </Link>
        <Link
          href="/docs/principles/two-delivery-paths"
          className="block rounded-md p-4 -m-4 hover:bg-white/5 transition-colors"
        >
          <h3 className="font-semibold mb-2">Two delivery paths</h3>
          <p className="text-sm text-fd-muted-foreground">
            Engineers ship UI without design gates. Design and product use AI
            agents to build real working UI. Same library underneath.
          </p>
        </Link>
        <Link
          href="/docs/principles/built-for-agents"
          className="block rounded-md p-4 -m-4 hover:bg-white/5 transition-colors"
        >
          <h3 className="font-semibold mb-2">Built for agents</h3>
          <p className="text-sm text-fd-muted-foreground">
            Every component ships with a COMPONENT.md next to its code. The
            repo is the interface — no MCP server, no sync, no stale copy.
          </p>
        </Link>
      </section>
    </main>
  );
}
