import type { Metadata, Viewport } from "next";

import "@nivoda/components/styles.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@nivoda/components";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.minivoda.com"),
  description:
    "The global marketplace for diamonds, gemstones, and jewelry. Source ethically, buy competitively.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Minivoda",
  },
  robots: {
    index: true,
    follow: true,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <body>
        <ThemeProvider>
          {children}
          <Toaster position="bottom-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
