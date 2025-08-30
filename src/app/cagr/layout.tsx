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
};

export default function CAGRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
