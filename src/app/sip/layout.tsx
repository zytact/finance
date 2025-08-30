import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SIP Calculator - Calculate Systematic Investment Plan Returns",
  description:
    "Calculate your SIP investment returns with step-up options, different frequencies, and comprehensive return projections. Plan your systematic investments effectively.",
  keywords: [
    "SIP calculator",
    "systematic investment plan",
    "investment returns",
    "step-up SIP",
    "monthly SIP",
    "investment frequency",
  ],
};

export default function SIPLayout({ children }: { children: React.ReactNode }) {
  return children;
}
