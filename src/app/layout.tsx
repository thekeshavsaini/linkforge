import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LinkForge — Self-hosted URL Shortener",
  description: "A fast, self-hosted URL shortener with link analytics and QR codes."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
