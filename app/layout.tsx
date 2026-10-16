import type { Metadata } from "next";
import { Bodoni_Moda, DM_Sans } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/content";

// Bodoni Moda: high-contrast fashion-magazine serif. DM Sans: clean, friendly body text.
const serif = Bodoni_Moda({ subsets: ["latin"], style: ["normal", "italic"], weight: ["400", "500", "600"], variable: "--font-serif" });
const sans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: `${site.name} | Photographer & Studio`,
  description: site.intro,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}