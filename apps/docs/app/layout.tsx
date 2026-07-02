import type { Metadata } from 'next';
import Script from 'next/script';
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

const siteUrl = 'https://clarityai.design';
const ogDescription =
  'Code-first and agent-readable. Tokens, components, and docs live in one repo, so whoever builds UI ships design-correct output by construction.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: { icon: '/favicon.svg' },
  title: 'Clarity by Nivoda',
  description: "Nivoda's design system — tokens, components, patterns.",
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'ClarityAI',
    title: 'ClarityAI — an AI-first design system',
    description: ogDescription,
    // og:image is supplied automatically by app/opengraph-image.tsx
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClarityAI — an AI-first design system',
    description: ogDescription,
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`antialiased ${inter.className} ${jetbrainsMono.variable} ${nanumMyeongjo.variable}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider
          theme={{
            defaultTheme: 'dark',
            enableSystem: false,
          }}
        >
          {children}
        </RootProvider>
        {/* Google Analytics (GA4) — clarityai.design */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KTEP1BWDZY"
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-KTEP1BWDZY');`}
        </Script>
      </body>
    </html>
  );
}
