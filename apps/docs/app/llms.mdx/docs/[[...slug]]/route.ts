import { getAllPages, getLLMText, getPageMarkdownUrl, resolveSource } from '@/lib/source';
import { notFound } from 'next/navigation';

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/llms.mdx/docs/[[...slug]]'>) {
  const { slug } = await params;
  const trimmed = slug?.slice(0, -1);
  const { source, slug: innerSlug } = resolveSource(trimmed);
  const page = source.getPage(innerSlug);
  if (!page) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Response(await getLLMText(page as any), {
    headers: {
      'Content-Type': 'text/markdown',
    },
  });
}

export function generateStaticParams() {
  return getAllPages().map((page) => ({
    lang: page.locale,
    slug: getPageMarkdownUrl(page).segments,
  }));
}
