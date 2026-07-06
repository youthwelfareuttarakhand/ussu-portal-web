import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "USSU Portal",
  description: "Uttarakhand State Sports University — student, staff & admin portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-surface text-body">{children}</body>
    </html>
  );
}
