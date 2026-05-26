import { getPageImage, getPageMarkdownUrl, resolveSource, componentsSource, guidesSource, iaSource } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { DocsActions } from '@/components/docs-actions';
import { getMDXComponents } from '@/components/mdx';
import { docsBreadcrumb, docsFooter, docsTableOfContent } from '@/lib/docs-page.shared';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const { source, slug } = resolveSource(params.slug);
  const page = source.getPage(slug);
  if (!page) notFound();

  // Union-narrowed `page.data` loses the MDX-injected fields (body, toc, full).
  // They're added at build time by fumadocs-mdx for every page; safe to widen.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = page.data as any;
  const MDX = data.body;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markdownUrl = getPageMarkdownUrl(page as any).url;

  return (
    <DocsPage
      toc={data.toc}
      full={data.full}
      tableOfContent={docsTableOfContent}
      breadcrumb={docsBreadcrumb}
      footer={docsFooter}
    >
      <DocsTitle className="text-[64px] font-normal">{data.title}</DocsTitle>
      <DocsDescription className="mb-0">{data.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <DocsActions markdownUrl={markdownUrl} />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            a: createRelativeLink(source as any, page as any),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  const componentsParams = componentsSource.generateParams().map((p) => ({
    ...p,
    slug: ['components', ...(p.slug ?? [])],
  }));
  const guidesParams = guidesSource.generateParams().map((p) => ({
    ...p,
    slug: ['guides', ...(p.slug ?? [])],
  }));
  // iaSource pages already include their section as the first slug segment
  // (e.g. ['foundations', 'typography']), so use them as-is.
  const iaParams = iaSource.generateParams();
  return [...componentsParams, ...guidesParams, ...iaParams];
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  const { source, slug } = resolveSource(params.slug);
  const page = source.getPage(slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      images: getPageImage(page as any).url,
    },
  };
}
