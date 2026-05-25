import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { metaSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

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

// Guides collection: repo-level docs/
export const guides = defineDocs({
  dir: '../../docs',
  docs: {
    files: ['**/*.md'],
    schema: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        full: z.boolean().optional(),
      })
      .passthrough()
      .transform((data) => ({
        ...data,
        // Fallback title if frontmatter missing — loader will be unhappy otherwise.
        title: data.title ?? 'Untitled',
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
    // MDX options
  },
});
