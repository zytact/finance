import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loan/EMI Calculator - Calculate EMI, Interest & Amortization",
  description:
    "Calculate your loan EMI, total interest payable, and view detailed amortization schedule. Analyze the impact of extra payments on your loan tenure and interest savings.",
  keywords: [
    "EMI calculator",
    "loan calculator",
    "home loan EMI",
    "amortization schedule",
    "extra payment calculator",
    "interest calculator",
  ],
};

export default function EMILayout({ children }: { children: React.ReactNode }) {
  return children;
}
