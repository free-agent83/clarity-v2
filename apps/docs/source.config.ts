import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { metaSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

/**
 * Remark plugin: convert `<StorybookEmbed story="..." />` raw HTML nodes
 * (produced when processing .md files, which don't get JSX support) into
 * proper MDX JSX flow elements so they compile as React components.
 *
 * Fumadocs-mdx hard-codes format based on file extension (.md → "md"),
 * so JSX is never enabled for COMPONENT.md files. This plugin bridges the gap.
 * No external imports — walks the tree with plain recursion.
 */
function remarkStorybookEmbed() {
  const HTML_RE = /<StorybookEmbed\s+story="([^"]+)"\s*\/>/;

  function walk(node: { type: string; children?: unknown[] }) {
    if (!node.children) return;
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i] as { type: string; value?: string; children?: unknown[] };
      if (child.type === 'html') {
        const match = HTML_RE.exec(child.value ?? '');
        if (match) {
          node.children[i] = {
            type: 'mdxJsxFlowElement',
            name: 'StorybookEmbed',
            attributes: [{ type: 'mdxJsxAttribute', name: 'story', value: match[1] }],
            children: [],
          };
        }
      } else {
        walk(child);
      }
    }
  }

  return (tree: { type: string; children?: unknown[] }) => walk(tree);
}

// Components collection: colocated COMPONENT.md files under packages/components/src/components
// Frontmatter uses `name` (not `title`) so we map it via transform.
export const components = defineDocs({
  dir: '../../packages/components/src/components',
  docs: {
    files: ['**/COMPONENT.md'],
    schema: z
      .object({
        name: z.string(),
        description: z.string().optional(),
        slug: z.string().optional(),
        version: z.string().optional(),
        status: z.string().optional(),
        lastUpdated: z.union([z.string(), z.date()]).optional(),
        full: z.boolean().optional(),
        story: z.string().optional(),
      })
      .passthrough()
      .transform((data) => ({
        ...data,
        title: data.name,
        lastUpdated:
          data.lastUpdated instanceof Date
            ? data.lastUpdated.toISOString().slice(0, 10)
            : data.lastUpdated,
      })),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

// In-tree IA collection: stub + landing pages authored under apps/docs/content/.
// Provides the 7-section sidebar shape (Get started / Foundations / Patterns /
// Content / Brand / Resources). The Components section is rendered separately
// by re-shaping the `components` collection in lib/source.ts.
export const ia = defineDocs({
  dir: 'content',
  docs: {
    files: ['**/*.{md,mdx}'],
    schema: z
      .object({
        title: z.string(),
        description: z.string().optional(),
        status: z.string().optional(),
        full: z.boolean().optional(),
      })
      .passthrough(),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkStorybookEmbed],
  },
});
