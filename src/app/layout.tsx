import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Dartly",
    template: "%s | Dartly",
  },
  description: "Your personal job search command center.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistMono.variable} font-mono bg-zinc-950 text-zinc-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}
