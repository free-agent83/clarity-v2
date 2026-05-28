import { componentsSource, iaSource } from '@/lib/source';
import { llms } from 'fumadocs-core/source';

export const revalidate = false;

export function GET() {
  return new Response(
    [llms(componentsSource).index(), llms(iaSource).index()].join('\n\n'),
  );
}
