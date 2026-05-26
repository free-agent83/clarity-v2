import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { SidebarBrand } from '@/components/sidebar-brand';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <SidebarBrand />,
    },
  };
}
