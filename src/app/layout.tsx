import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finance Calculator - SIP, Lumpsum, CAGR & Inflation Calculators",
  description:
    "Calculate your investment returns with our comprehensive financial calculators. SIP Calculator, Lumpsum Calculator, Inflation Calculator and CAGR Calculator for smart investment planning.",
  keywords: [
    "finance calculator",
    "SIP calculator",
    "lumpsum calculator",
    "CAGR calculator",
    "investment returns",
    "financial planning",
    "inflation calculator",
  ],
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4de8e8" },
    { media: "(prefers-color-scheme: dark)", color: "#4de8e8" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="flex justify-end p-4">
            <ThemeToggle />
          </header>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
