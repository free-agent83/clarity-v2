import { getPageImage, resolveSource, componentsSource, iaSource } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { AgentSpecActions } from '@/components/agent-spec-actions';
import { getMDXComponents } from '@/components/mdx';
import { readRepoMarkdown } from '@/lib/repo-markdown';
import { StorybookEmbed } from '@/components/storybook-embed';
import { docsBreadcrumb, docsFooter, docsPageSlots, docsTableOfContent } from '@/lib/docs-page.shared';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  if (params.slug?.[0] === 'guides') notFound();

  const { source, slug, section } = resolveSource(params.slug);
  const page = source.getPage(slug);
  if (!page) notFound();

  // Union-narrowed `page.data` loses the MDX-injected fields (body, toc, full).
  // They're added at build time by fumadocs-mdx for every page; safe to widen.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = page.data as any;
  const MDX = data.body;
  const slugPath = slug.join('/');
  const isComponentsIndexPage =
    section === 'ia' && slugPath === 'components';

  const agentSpecMarkdown = isComponentsIndexPage
    ? await readRepoMarkdown('packages/components/COMPONENTS.md')
    : section === 'components'
      ? await data.getText('raw')
      : null;

  const agentSpecDownloadFilename = isComponentsIndexPage
    ? 'COMPONENTS.md'
    : 'COMPONENT.md';

  return (
    <DocsPage
      toc={data.toc}
      full={data.full}
      tableOfContent={docsTableOfContent}
      breadcrumb={docsBreadcrumb}
      slots={docsPageSlots}
      footer={docsFooter}
    >
      <div className="docs-page-content flex min-w-0 flex-col">
        <header className="docs-page-header flex flex-col gap-6 border-b border-fd-border pb-6">
          <div className="flex flex-col gap-4">
            <DocsTitle className="mb-0 text-[64px] font-normal leading-none">
              {data.title}
            </DocsTitle>
            <DocsDescription className="mb-0">{data.description}</DocsDescription>
          </div>
          {agentSpecMarkdown ? (
            <AgentSpecActions
              markdown={agentSpecMarkdown}
              downloadFilename={agentSpecDownloadFilename}
            />
          ) : null}
        </header>
        {data.story && <StorybookEmbed story={data.story} className="my-0 mt-12" />}
        <DocsBody className="mt-6">
          <MDX
            components={getMDXComponents({
              // this allows you to link to other pages with relative file paths
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              a: createRelativeLink(source as any, page as any),
            })}
          />
        </DocsBody>
      </div>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  const componentsParams = componentsSource.generateParams().map((p) => ({
    ...p,
    slug: ['components', ...(p.slug ?? [])],
  }));
  // iaSource pages already include their section as the first slug segment
  // (e.g. ['foundations', 'typography']), so use them as-is.
  const iaParams = iaSource.generateParams();
  return [...componentsParams, ...iaParams];
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
