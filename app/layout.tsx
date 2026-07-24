import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "1909 Cunda | Menü",
  description: "1909 Cunda güncel menüsü",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
