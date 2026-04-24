import { componentsSource, guidesSource } from '@/lib/source';
import { createSearchAPI } from 'fumadocs-core/search/server';

function indexesFor(source: typeof componentsSource | typeof guidesSource) {
  return source.getPages().map((page) => ({
    id: page.url,
    title: page.data.title as string,
    description: page.data.description as string | undefined,
    url: page.url,
    structuredData: page.data.structuredData,
  }));
}

export const { GET } = createSearchAPI('advanced', {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'english',
  indexes: [...indexesFor(componentsSource), ...indexesFor(guidesSource)],
});
