"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Pie, PieChart } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

function CAGRCalculatorContent() {
  const searchParams = useSearchParams();

  const [investedAmount, setInvestedAmount] = useState<string>("");
  const [currentAmount, setCurrentAmount] = useState<string>("");
  const [years, setYears] = useState<string>("");
  const [cagr, setCagr] = useState<number | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    const initial = searchParams.get("initial");
    const final = searchParams.get("final");
    const yrs = searchParams.get("years");

    if (initial && !Number.isNaN(Number(initial)) && Number(initial) > 0) {
      setInvestedAmount(initial);
    }
    if (final && !Number.isNaN(Number(final)) && Number(final) > 0) {
      setCurrentAmount(final);
    }
    if (yrs && !Number.isNaN(Number(yrs)) && Number(yrs) > 0) {
      setYears(yrs);
    }
    setInitialized(true);
  }, [searchParams]);

  const updateSearchParams = useCallback(
    (params: Record<string, string>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value && value !== "") {
          newSearchParams.set(key, value);
        } else {
          newSearchParams.delete(key);
        }
      });

      const newSearchString = newSearchParams.toString();
      const currentSearchString = searchParams.toString();

      if (newSearchString !== currentSearchString) {
        const newUrl = `${window.location.pathname}${newSearchString ? `?${newSearchString}` : ""}`;
        window.history.replaceState(null, "", newUrl);
      }
    },
    [searchParams],
  );

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

  useEffect(() => {
    if (!initialized) return;
    updateSearchParams({
      initial: investedAmount,
      final: currentAmount,
      years: years,
    });
  }, [investedAmount, currentAmount, years, updateSearchParams, initialized]);

  const numbers = useMemo(() => {
    const initial = parseFloat(investedAmount);
    const final = parseFloat(currentAmount);
    if (
      !Number.isFinite(initial) ||
      initial <= 0 ||
      !Number.isFinite(final) ||
      final <= 0
    ) {
      return { initial: 0, final: 0, gain: 0 };
    }
    const gain = Math.max(final - initial, 0);
    return { initial, final, gain };
  }, [investedAmount, currentAmount]);

  const chartData = useMemo(() => {
    if (numbers.initial <= 0 && numbers.final <= 0)
      return [] as Array<{ name: string; value: number; fill: string }>;
    const invested = Math.min(numbers.initial, numbers.final);
    const gain = Math.max(numbers.final - invested, 0);
    return [
      { name: "Invested ", value: invested, fill: "var(--chart-1)" },
      { name: "Profit", value: gain, fill: "var(--chart-2)" },
    ];
  }, [numbers]);

  const chartConfig: ChartConfig = {
    invested: { label: "Invested", color: "var(--chart-1)" },
    current: { label: "Profit", color: "var(--chart-2)" },
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center w-full">
        <h1 className="text-4xl font-bold">CAGR Calculator</h1>
        <p className="text-muted-foreground">
          Calculate your Compound Annual Growth Rate
        </p>

        <div className="w-full max-w-4xl grid gap-12 md:grid-cols-2">
          <div className="w-full p-6 border rounded-lg shadow-sm bg-card">
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
                <label
                  htmlFor="final"
                  className="block text-sm font-medium mb-1"
                >
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
                <label
                  htmlFor="years"
                  className="block text-sm font-medium mb-1"
                >
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
                      cagr !== null
                        ? cagr < 0
                          ? "text-red-600"
                          : "text-green-600"
                        : "text-muted-foreground",
                    )}
                  >
                    {cagr !== null
                      ? `${cagr.toFixed(2)}%`
                      : "Enter values above"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="items-center pb-0">
              <h3 className="text-lg font-semibold">Portfolio Breakdown</h3>
            </div>
            <div className="flex-1 pb-6">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[280px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    stroke="0"
                  />
                </PieChart>
              </ChartContainer>

              {chartData.length > 0 && (
                <div className="flex flex-col gap-2 mt-4">
                  {chartData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-sm"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="text-sm font-medium">
                          {item.name.trim()}
                        </span>
                      </div>
                      <span className="text-sm font-bold">
                        ₹
                        {item.value.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CAGRCalculator() {
  return (
    <Suspense
      fallback={
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
          <main className="flex flex-col gap-[32px] row-start-2 items-center w-full">
            <h1 className="text-4xl font-bold">CAGR Calculator</h1>
            <p className="text-muted-foreground">Loading...</p>
          </main>
        </div>
      }
    >
      <CAGRCalculatorContent />
    </Suspense>
  );
}
