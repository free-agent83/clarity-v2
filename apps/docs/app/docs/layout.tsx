import { getCombinedPageTree } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { docsSidebar } from '@/lib/docs-page.shared';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout tree={getCombinedPageTree()} {...baseOptions()} sidebar={docsSidebar}>
      {children}
    </DocsLayout>
  );
}
