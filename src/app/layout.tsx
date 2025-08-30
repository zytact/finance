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
  title: "Finance Calculator - SIP, Lumpsum & CAGR Calculators",
  description:
    "Calculate your investment returns with our comprehensive financial calculators. SIP Calculator, Lumpsum Calculator, and CAGR Calculator for smart investment planning.",
  keywords: [
    "finance calculator",
    "SIP calculator",
    "lumpsum calculator",
    "CAGR calculator",
    "investment returns",
    "financial planning",
  ],
  authors: [{ name: "Finance Calculator" }],
  creator: "Finance Calculator",
  publisher: "Finance Calculator",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://finance-calculator.vercel.app",
    title: "Finance Calculator - SIP, Lumpsum & CAGR Calculators",
    description:
      "Calculate your investment returns with our comprehensive financial calculators. SIP Calculator, Lumpsum Calculator, and CAGR Calculator for smart investment planning.",
    siteName: "Finance Calculator",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Finance Calculator - SIP, Lumpsum & CAGR Calculators",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Finance Calculator - SIP, Lumpsum & CAGR Calculators",
    description:
      "Calculate your investment returns with our comprehensive financial calculators.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
