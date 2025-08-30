import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inflation Calculator - Calculate Purchasing Power Loss",
  description:
    "Calculate how inflation affects your money's purchasing power over time. See how much your current amount will be worth in the future.",
  keywords: [
    "inflation calculator",
    "purchasing power",
    "inflation rate",
    "future value",
    "money worth",
    "inflation impact",
  ],
};

export default function InflationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
