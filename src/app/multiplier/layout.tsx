import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Multiplier Calculator - Calculate Time to Double/Triple Your Money",
  description:
    "Calculate how long it takes to double, triple, or multiply your investment by any factor using compound interest. Plan your investment growth timeline.",
  keywords: [
    "multiplier calculator",
    "doubling time",
    "investment growth",
    "compound interest",
    "money multiplier",
    "investment timeline",
    "future value",
  ],
};

export default function MultiplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
