import { components, guides } from 'collections/server';
import { loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { docsContentRoute, docsImageRoute, docsRoute } from './shared';

// See https://fumadocs.dev/docs/headless/source-api for more info
export const componentsSource = loader({
  baseUrl: `${docsRoute}/components`,
  source: components.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
  // Source files are named `COMPONENT.md` colocated with the code. Strip the
  // filename so URLs read `/docs/components/atoms/button`, not
  // `/docs/components/atoms/button/COMPONENT`.
  slugs: (file) => {
    const segments = file.path.replace(/\.md$/, '').split('/');
    if (segments[segments.length - 1] === 'COMPONENT') segments.pop();
    return segments;
  },
});

export const guidesSource = loader({
  baseUrl: `${docsRoute}/guides`,
  source: guides.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

export type DocsSource = typeof componentsSource | typeof guidesSource;

/**
 * Resolve which content collection to use for a given `[[...slug]]` segments array.
 * Returns the source + the remaining slug segments within that collection.
 */
export function resolveSource(slug: string[] | undefined): {
  source: DocsSource;
  slug: string[];
  section: 'components' | 'guides';
} {
  const segs = slug ?? [];
  if (segs[0] === 'guides') {
    return { source: guidesSource, slug: segs.slice(1), section: 'guides' };
  }
  // Default: components (also when first segment is "components")
  if (segs[0] === 'components') {
    return { source: componentsSource, slug: segs.slice(1), section: 'components' };
  }
  return { source: componentsSource, slug: segs, section: 'components' };
}

/**
 * Combined tree used by the docs layout sidebar. Concatenates both collections'
 * top-level page trees so both sections appear in the nav.
 */
export function getCombinedPageTree() {
  const componentsTree = componentsSource.getPageTree();
  const guidesTree = guidesSource.getPageTree();
  return {
    name: 'Docs',
    children: [
      {
        type: 'folder' as const,
        name: 'Components',
        root: false,
        children: componentsTree.children,
      },
      {
        type: 'folder' as const,
        name: 'Guides',
        root: false,
        children: guidesTree.children,
      },
    ],
  };
}

// Structural type covering pages from either collection — avoids the union
// narrowing problem where TS demands both collections' frontmatter.
type AnyPage = {
  slugs: string[];
  url: string;
  data: {
    title: string;
    description?: string;
    getText: (variant: 'processed' | 'raw') => Promise<string>;
  };
};

export function getPageImage(page: AnyPage) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `${docsImageRoute}/${segments.join('/')}`,
  };
}

export function getPageMarkdownUrl(page: AnyPage) {
  const segments = [...page.slugs, 'content.md'];

  return {
    segments,
    url: `${docsContentRoute}/${segments.join('/')}`,
  };
}

export async function getLLMText(page: AnyPage) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title} (${page.url})

${processed}`;
}

export function getAllPages() {
  return [...componentsSource.getPages(), ...guidesSource.getPages()];
}
