"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export default function CAGRCalculator() {
  const [investedAmount, setInvestedAmount] = useState<string>("");
  const [currentAmount, setCurrentAmount] = useState<string>("");
  const [years, setYears] = useState<string>("");
  const [cagr, setCagr] = useState<number | null>(null);

  useEffect(() => {
    const initial = parseFloat(investedAmount);
    const final = parseFloat(currentAmount);
    const time = parseFloat(years);

    if (initial > 0 && final > 0 && time > 0) {
      const growthRate = (final / initial) ** (1 / time) - 1;
      setCagr(growthRate * 100);
    } else {
      setCagr(null);
    }
  }, [investedAmount, currentAmount, years]);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <h1 className="text-4xl font-bold">CAGR Calculator</h1>
        <p className="text-muted-foreground">
          Calculate your Compound Annual Growth Rate
        </p>

        <div className="w-full max-w-md p-6 border rounded-lg shadow-sm bg-card">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="initial"
                className="block text-sm font-medium mb-1"
              >
                Invested Amount
              </label>
              <input
                id="initial"
                type="number"
                value={investedAmount}
                onChange={(e) => setInvestedAmount(e.target.value)}
                placeholder="10000"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="final" className="block text-sm font-medium mb-1">
                Current Amount
              </label>
              <input
                id="final"
                type="number"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="15000"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="years" className="block text-sm font-medium mb-1">
                Time Period (Years)
              </label>
              <input
                id="years"
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                placeholder="5"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CAGR:</span>
                <span
                  className={cn(
                    "text-lg font-bold",
                    cagr !== null ? "text-green-600" : "text-muted-foreground",
                  )}
                >
                  {cagr !== null ? `${cagr.toFixed(2)}%` : "Enter values above"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
