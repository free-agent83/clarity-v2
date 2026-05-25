import { componentsSource, guidesSource } from '@/lib/source';
import { createSearchAPI } from 'fumadocs-core/search/server';
import type { StructuredData } from 'fumadocs-core/mdx-plugins';

const EMPTY_STRUCTURED_DATA: StructuredData = { headings: [], contents: [] };

function indexesFor(source: typeof componentsSource | typeof guidesSource) {
  return source.getPages().map((page) => {
    const data = page.data as { title: string; description?: string; structuredData?: StructuredData };
    return {
      id: page.url,
      title: data.title,
      description: data.description,
      url: page.url,
      structuredData: data.structuredData ?? EMPTY_STRUCTURED_DATA,
    };
  });
}

export const { GET } = createSearchAPI('advanced', {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'english',
  indexes: [...indexesFor(componentsSource), ...indexesFor(guidesSource)],
});
