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
  openGraph: {
    title: "Lumpsum Calculator - Calculate One-time Investment Returns",
    description:
      "Calculate returns on your lump sum investments with compound interest calculations.",
    type: "website",
    images: [
      {
        url: "/lumpsum/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Lumpsum Calculator - Calculate One-time Investment Returns",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumpsum Calculator - Calculate One-time Investment Returns",
    description:
      "Calculate returns on your lump sum investments with compound interest calculations.",
    images: ["/lumpsum/opengraph-image"],
  },
};

export default function LumpsumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
