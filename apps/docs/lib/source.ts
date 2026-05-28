import { components, ia } from 'collections/server';
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  slugs: ((file: any) => {
    const segments = (file.path as string).replace(/\.md$/, '').split('/');
    if (segments[segments.length - 1] === 'COMPONENT') segments.pop();
    return segments;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any,
});

// In-tree IA pages live under apps/docs/content/<section>/<slug>.mdx and serve
// the URL space /docs/<section>/<slug>. The first path segment IS the section
// (get-started, principles, foundations, patterns, content, brand).
export const iaSource = loader({
  baseUrl: docsRoute,
  source: ia.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

export type DocsSource = typeof componentsSource | typeof iaSource;

// Top-level URL segments routed to the in-tree IA collection.
const IA_SECTIONS = new Set([
  'get-started',
  'principles',
  'foundations',
  'patterns',
  'content',
  'brand',
]);

/**
 * Resolve which content collection to use for a given `[[...slug]]` segments array.
 * Returns the source + the remaining slug segments within that collection.
 */
export function resolveSource(slug: string[] | undefined): {
  source: DocsSource;
  slug: string[];
  section: 'components' | 'ia';
} {
  const segs = slug ?? [];
  // /docs/components itself (no sub-path) renders the in-tree landing at
  // apps/docs/content/components/index.mdx. Nested paths below it fall through
  // to componentsSource (the external COMPONENT.md collection).
  if (segs.length === 1 && segs[0] === 'components') {
    return { source: iaSource, slug: segs, section: 'ia' };
  }
  if (segs[0] === 'components') {
    return { source: componentsSource, slug: segs.slice(1), section: 'components' };
  }
  if (segs[0] && IA_SECTIONS.has(segs[0])) {
    // iaSource already has baseUrl /docs, so we pass the full segment array.
    return { source: iaSource, slug: segs, section: 'ia' };
  }
  return { source: componentsSource, slug: segs, section: 'components' };
}

// ---------------------------------------------------------------------------
// Functional component grouping
// ---------------------------------------------------------------------------
// On disk, components live under atoms/molecules/organisms/templates. Consumers
// don't search atomically — they search by job (Forms, Overlays, etc.). We
// re-shape the components tree at sidebar-build time to present them
// functionally without touching the package's filesystem layout.
//
// Key = section label shown in the sidebar.
// Value = ordered list of slug paths (relative to /docs/components/).

const COMPONENT_GROUPS: Record<string, string[]> = {
  Actions: ['atoms/button', 'atoms/button-group'],
  Forms: [
    'atoms/input',
    'atoms/textarea',
    'molecules/select',
    'atoms/checkbox',
    'atoms/radio-group',
    'atoms/switch',
    'atoms/slider',
    'atoms/toggle',
    'atoms/toggle-group',
    'atoms/segmented-control',
    'atoms/input-otp',
    'atoms/input-group',
    'atoms/field',
    'atoms/label',
    'molecules/combobox',
  ],
  Display: [
    'atoms/avatar',
    'atoms/badge',
    'molecules/card',
    'molecules/carousel',
    'atoms/separator',
    'atoms/skeleton',
    'atoms/spinner',
    'atoms/progress',
    'atoms/typography',
    'atoms/brand',
    'atoms/brand-express',
    'atoms/kbd',
    'atoms/item',
    'atoms/empty',
    'atoms/direction',
    'atoms/filter-button',
  ],
  Feedback: [
    'atoms/alert',
    'atoms/inline-banner',
    'atoms/page-banner',
    'atoms/sonner',
    'atoms/tooltip',
    'atoms/hover-card',
  ],
  Overlays: [
    'molecules/dialog',
    'molecules/sheet',
    'molecules/drawer',
    'molecules/lightbox',
    'atoms/popover',
    'molecules/alert-dialog',
    'molecules/dropdown-menu',
  ],
  Navigation: [
    'molecules/breadcrumb',
    'molecules/pagination',
    'molecules/tabs',
    'molecules/stepper',
    'organisms/navigation-menu',
    'organisms/sidebar',
    'molecules/command',
  ],
  Data: ['organisms/table', 'organisms/chart'],
  Filtering: [
    'atoms/filter-button',
    'organisms/filter-toolbar',
    'molecules/range-filter',
  ],
  Layout: [
    'organisms/app-shell',
    'atoms/aspect-ratio',
    'atoms/scroll-area',
    'molecules/collapsible',
    'molecules/accordion',
  ],
  'PLP Kit': ['templates/plp'],
  'PDP Kit': ['templates/pdp'],
};

type SidebarNode =
  | { type: 'page'; name: string; url: string }
  | {
      type: 'folder';
      name: string;
      root?: boolean;
      children: SidebarNode[];
      index?: { type: 'page'; name: string; url: string };
    };

function buildFunctionalComponentsChildren(): SidebarNode[] {
  const pages = componentsSource.getPages();
  // Map slug-path (e.g. "atoms/button") -> page object
  const pageBySlug = new Map<string, { url: string; data: { title: string } }>();
  for (const p of pages) {
    pageBySlug.set(p.slugs.join('/'), {
      url: p.url,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { title: (p.data as any).title ?? p.slugs[p.slugs.length - 1] },
    });
  }

  const seen = new Set<string>();
  const sections: SidebarNode[] = [];

  for (const [groupName, slugs] of Object.entries(COMPONENT_GROUPS)) {
    const children: SidebarNode[] = [];
    for (const slug of slugs) {
      const page = pageBySlug.get(slug);
      if (!page) continue; // silently skip components that don't exist yet
      seen.add(slug);
      children.push({ type: 'page', name: page.data.title, url: page.url });
    }
    if (children.length > 0) {
      sections.push({ type: 'folder', name: groupName, children });
    }
  }

  // Anything left becomes an "Other" bucket so nothing gets dropped on the floor.
  const otherChildren: SidebarNode[] = [];
  for (const [slug, page] of pageBySlug) {
    if (seen.has(slug)) continue;
    otherChildren.push({ type: 'page', name: page.data.title, url: page.url });
  }
  otherChildren.sort((a, b) => a.name.localeCompare(b.name));
  if (otherChildren.length > 0) {
    sections.push({ type: 'folder', name: 'Other', children: otherChildren });
  }

  return sections;
}

// Order in which IA top-level sections should appear in the sidebar.
const IA_SECTION_ORDER = [
  'get-started',
  'principles',
  'foundations',
  'patterns',
  'content',
  'brand',
];

const IA_SECTION_LABELS: Record<string, string> = {
  'get-started': 'Get started',
  principles: 'Principles',
  foundations: 'Foundations',
  patterns: 'Patterns',
  content: 'Content',
  brand: 'Brand',
};

// Section-specific explicit ordering overrides for IA children. Keys are the
// trailing slug segment (i.e. filename without extension). Pages listed here
// appear in the given order; anything not listed falls back to alphabetical
// after the explicit block.
const IA_SECTION_CHILD_ORDER: Record<string, string[]> = {
  'get-started': ['working-with-ai-agents'],
  brand: [
    'direction',
    'logo',
    'colour',
    'typography',
    'photography',
    'iconography',
    'application-rules',
    'illustration',
  ],
  principles: [
    'code-first',
    'two-delivery-paths',
    'built-for-agents',
  ],
};

function buildIaSectionChildren(section: string): SidebarNode[] {
  const pages = iaSource.getPages().filter((p) => p.slugs[0] === section);
  // Sort: index first, then explicit order (if any) then alphabetical by title.
  const indexPage = pages.find((p) => p.slugs.length === 1);
  const nonIndex = pages.filter((p) => p.slugs.length > 1);
  const explicit = IA_SECTION_CHILD_ORDER[section];
  let rest: typeof nonIndex;
  if (explicit) {
    const bySlug = new Map<string, (typeof nonIndex)[number]>();
    for (const p of nonIndex) bySlug.set(p.slugs[p.slugs.length - 1], p);
    const used = new Set<string>();
    const inOrder: typeof nonIndex = [];
    for (const slug of explicit) {
      const p = bySlug.get(slug);
      if (p) {
        inOrder.push(p);
        used.add(slug);
      }
    }
    const leftover = nonIndex
      .filter((p) => !used.has(p.slugs[p.slugs.length - 1]))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a, b) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((a.data as any).title as string).localeCompare((b.data as any).title as string),
      );
    rest = [...inOrder, ...leftover];
  } else {
    rest = nonIndex
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a, b) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((a.data as any).title as string).localeCompare((b.data as any).title as string),
      );
  }
  const ordered = [...(indexPage ? [indexPage] : []), ...rest];
  return ordered.map((p) => ({
    type: 'page',
    name:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p.data as any).title ?? p.slugs[p.slugs.length - 1],
    url: p.url,
  }));
}

/**
 * Combined tree used by the docs layout sidebar. Renders the public IA:
 * Get started / Principles / Foundations / Components / Patterns / Content /
 * Brand. Components are regrouped functionally (not atomically).
 * Repo `docs/` plans and specs are not listed here — they stay in Git only.
 */
export function getCombinedPageTree() {
  const componentsChildren = buildFunctionalComponentsChildren();

  const sections: SidebarNode[] = [];

  for (const sectionKey of IA_SECTION_ORDER) {
    const children = buildIaSectionChildren(sectionKey);
    // For `get-started` (single page), inline as a top-level page if there's
    // only an index page.
    if (sectionKey === 'get-started') {
      const idx = children[0];
      if (idx && idx.type === 'page' && children.length === 1) {
        sections.push({ type: 'page', name: idx.name, url: idx.url });
        continue;
      }
    }
    sections.push({
      type: 'folder',
      name: IA_SECTION_LABELS[sectionKey] ?? sectionKey,
      root: false,
      children,
    });
    // Insert Components folder right after Foundations.
    if (sectionKey === 'foundations') {
      sections.push({
        type: 'folder',
        name: 'Components',
        root: false,
        children: componentsChildren,
      });
    }
  }

  return {
    name: 'Docs',
    children: sections,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

// Structural type covering pages from either collection — avoids the union
// narrowing problem where TS demands both collections' frontmatter.
type AnyPage = {
  slugs: string[];
  url: string;
  locale?: string;
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

export function getAllPages(): AnyPage[] {
  return [
    ...componentsSource.getPages(),
    ...iaSource.getPages(),
  ] as unknown as AnyPage[];
}
