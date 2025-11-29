import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Goal Calculator - Calculate Required SIP for Your Financial Goals",
  description:
    "Calculate the SIP amount needed to achieve your financial goals. Factor in inflation, investment frequency, expected returns, and time horizon to plan your investments.",
  keywords: [
    "goal calculator",
    "SIP goal planning",
    "financial goal calculator",
    "investment planning",
    "inflation adjusted goals",
    "retirement planning",
  ],
};

export default function GoalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
