import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lumpsum Calculator - Calculate One-time Investment Returns",
  description:
    "Calculate returns on your lump sum investments with compound interest calculations. Plan your one-time investments and see future value projections.",
  keywords: [
    "lumpsum calculator",
    "one-time investment",
    "compound interest",
    "investment returns",
    "principal amount",
    "future value",
  ],
};

export default function LumpsumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
