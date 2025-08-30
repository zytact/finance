import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CAGR Calculator - Calculate Compound Annual Growth Rate",
  description:
    "Calculate the Compound Annual Growth Rate of your investments over time. Analyze investment performance and annual returns with our CAGR calculator.",
  keywords: [
    "CAGR calculator",
    "compound annual growth rate",
    "investment performance",
    "annual returns",
    "growth rate analysis",
    "investment analysis",
  ],
  openGraph: {
    title: "CAGR Calculator - Calculate Compound Annual Growth Rate",
    description:
      "Calculate the Compound Annual Growth Rate of your investments over time.",
    type: "website",
    images: [
      {
        url: "/cagr/opengraph-image",
        width: 1200,
        height: 630,
        alt: "CAGR Calculator - Calculate Compound Annual Growth Rate",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CAGR Calculator - Calculate Compound Annual Growth Rate",
    description:
      "Calculate the Compound Annual Growth Rate of your investments over time.",
    images: ["/cagr/opengraph-image"],
  },
};

export default function CAGRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
