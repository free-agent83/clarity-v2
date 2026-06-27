import Link from 'next/link';
import { Button } from '@nivoda/components';
import { ThemeWordmark } from '@/components/theme-wordmark';

const principles = [
  {
    href: '/docs/principles/code-first',
    kicker: 'Code-first',
    title: 'One pipeline. Code is the source of truth.',
    body: 'Tokens, components, and docs are authored in-repo and shipped from one pipeline. Figma is downstream output for communication, not a separate authority.',
  },
  {
    href: '/docs/principles/two-delivery-paths',
    kicker: 'Two delivery paths',
    title: 'Agents and engineers, same library underneath',
    body: 'Engineers ship UI without design gates. Design and product use AI agents to build real working UI. Same library underneath.',
  },
  {
    href: '/docs/principles/built-for-agents',
    kicker: 'Built for agents',
    title: 'The repo is the interface',
    body: 'Every component ships with a COMPONENT.md next to its code. The repo is the interface — no MCP server, no sync, no stale copy.',
  },
] as const;

export default function HomePage() {
  return (
    <main className="home-page min-h-screen flex flex-col items-center px-6 py-24">
      <div className="home-hero max-w-4xl w-full text-center">
        <ThemeWordmark className="h-8 mx-auto mb-10 opacity-90" />
        <h1 className="home-hero-title">
          Clarity is an <em>AI-first design system</em>
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

      <section className="home-grid-3 mt-24 w-full max-w-[1200px]">
        {principles.map(({ href, kicker, title, body }) => (
          <Link key={href} href={href} className="home-card">
            <p className="home-card-kicker">{kicker}</p>
            <h3>{title}</h3>
            <p>{body}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
