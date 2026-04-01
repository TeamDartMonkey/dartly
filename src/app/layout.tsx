import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/ui/sidebar";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dartly",
  description: "Your personal job search command center.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistMono.variable} font-mono bg-zinc-950 text-zinc-50 antialiased`}
      >
        {/*
          The outer shell is a flex row:
          - Left: Sidebar (fixed width, full height)
          - Right: Main content area (fills remaining space, scrollable)
        */}
        <div className="flex min-h-screen">
          <Sidebar />

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-8 pt-8 pb-16">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}