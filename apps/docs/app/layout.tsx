import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter, JetBrains_Mono, Nanum_Myeongjo } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const nanumMyeongjo = Nanum_Myeongjo({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-nanum',
});

export const metadata: Metadata = {
  icons: { icon: '/favicon.svg' },
  title: 'Clarity by Nivoda',
  description: "Nivoda's design system — tokens, components, patterns.",
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${inter.className} ${jetbrainsMono.variable} ${nanumMyeongjo.variable}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider
          theme={{
            defaultTheme: 'dark',
            enableSystem: false,
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
