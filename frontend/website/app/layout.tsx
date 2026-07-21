import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ThemeStyle from "@/components/Common/ThemeStyle";
import { generateMetadata as generateSeoMetadata } from "@/utility/generateMetadata";
import { getBaseSeoItem } from "@/utility/getSeoSettings";
import { getSiteSettings } from "@/utility/getSettings";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const space = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const [seo, settings] = await Promise.all([
    getBaseSeoItem(),
    getSiteSettings(),
  ]);
  const metadata = generateSeoMetadata(seo);

  if (settings.faviconUrl) {
    metadata.icons = {
      icon: [{ url: settings.faviconUrl }],
      shortcut: settings.faviconUrl,
      apple: [{ url: settings.faviconUrl }],
    };
  }

  return metadata;
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${space.variable} ${jetbrains.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeStyle palette={settings.palette} />
        {children}
        <Toaster position="bottom-right" theme="dark" />
      </body>
    </html>
  );
}
