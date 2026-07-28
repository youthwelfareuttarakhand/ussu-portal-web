import type { Metadata } from "next";
import { Anton, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// ponytail: mirrors ussu-web/apps/web/app/layout.tsx's font setup exactly
// (same var names, same weights) — see tailwind.config.ts's note.
const display = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "USSU Portal",
  description: "Uttarakhand State Sports University — student, staff & admin portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="bg-surface text-body font-sans antialiased">{children}</body>
    </html>
  );
}
