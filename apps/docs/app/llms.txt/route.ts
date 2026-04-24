import { componentsSource, guidesSource } from '@/lib/source';
import { llms } from 'fumadocs-core/source';

export const revalidate = false;

export function GET() {
  return new Response(
    [llms(componentsSource).index(), llms(guidesSource).index()].join('\n\n'),
  );
}
