import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import '../styles/home-page.css';

export default function Layout({ children }: LayoutProps<'/'>) {
  return <HomeLayout {...baseOptions()}>{children}</HomeLayout>;
}
