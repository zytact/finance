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

function LumpsumCalculatorContent() {
  const searchParams = useSearchParams();

  const [investedAmount, setInvestedAmount] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [expectedReturn, setExpectedReturn] = useState<string>("");
  const [futureValue, setFutureValue] = useState<number | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    const amount = searchParams.get("amount");
    const dur = searchParams.get("duration");
    const ret = searchParams.get("return");

    if (amount && !Number.isNaN(Number(amount)) && Number(amount) > 0) {
      setInvestedAmount(amount);
    }
    if (dur && !Number.isNaN(Number(dur)) && Number(dur) > 0) {
      setDuration(dur);
    }
    if (ret && !Number.isNaN(Number(ret)) && Number(ret) >= 0) {
      setExpectedReturn(ret);
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
    const principal = parseFloat(investedAmount);
    const time = parseFloat(duration);
    const rate = parseFloat(expectedReturn);

    if (principal > 0 && time > 0 && rate >= 0) {
      const calculatedValue = principal * (1 + rate / 100) ** time;
      setFutureValue(calculatedValue);
    } else {
      setFutureValue(null);
    }
  }, [investedAmount, duration, expectedReturn]);

  useEffect(() => {
    if (!initialized) return;
    updateSearchParams({
      amount: investedAmount,
      duration: duration,
      return: expectedReturn,
    });
  }, [
    investedAmount,
    duration,
    expectedReturn,
    updateSearchParams,
    initialized,
  ]);

  const numbers = useMemo(() => {
    const principal = parseFloat(investedAmount);
    const final = futureValue || 0;
    if (
      !Number.isFinite(principal) ||
      principal <= 0 ||
      !Number.isFinite(final) ||
      final <= 0
    ) {
      return { principal: 0, final: 0, profit: 0 };
    }
    const profit = Math.max(final - principal, 0);
    return { principal, final, profit };
  }, [investedAmount, futureValue]);

  const chartData = useMemo(() => {
    if (numbers.principal <= 0 && numbers.final <= 0)
      return [] as Array<{ name: string; value: number; fill: string }>;
    const invested = numbers.principal;
    const profit = numbers.profit;
    return [
      { name: "Invested ", value: invested, fill: "var(--chart-1)" },
      { name: "Profit", value: profit, fill: "var(--chart-2)" },
    ];
  }, [numbers]);

  const chartConfig: ChartConfig = {
    invested: { label: "Invested", color: "var(--chart-1)" },
    profit: { label: "Profit", color: "var(--chart-2)" },
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center w-full">
        <h1 className="text-4xl font-bold">Lumpsum Calculator</h1>
        <p className="text-muted-foreground">
          Calculate your lumpsum investment returns
        </p>

        <div className="w-full max-w-4xl grid gap-12 md:grid-cols-2">
          <div className="w-full p-6 border rounded-lg shadow-sm bg-card">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="invested"
                  className="block text-sm font-medium mb-1"
                >
                  Invested Amount
                </label>
                <input
                  id="invested"
                  type="number"
                  value={investedAmount}
                  onChange={(e) => setInvestedAmount(e.target.value)}
                  placeholder="10000"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium mb-1"
                >
                  Duration of Investment (Years)
                </label>
                <input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="5"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="return"
                  className="block text-sm font-medium mb-1"
                >
                  Expected Annual Return (%)
                </label>
                <input
                  id="return"
                  type="number"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(e.target.value)}
                  placeholder="10"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Future Value:</span>
                  <span
                    className={cn(
                      "text-lg font-bold",
                      futureValue !== null
                        ? "text-green-600"
                        : "text-muted-foreground",
                    )}
                  >
                    {futureValue !== null
                      ? `₹${futureValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                      : "Enter values above"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="items-center pb-0">
              <h3 className="text-lg font-semibold">Investment Breakdown</h3>
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

export default function LumpsumCalculator() {
  return (
    <Suspense
      fallback={
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
          <main className="flex flex-col gap-[32px] row-start-2 items-center w-full">
            <h1 className="text-4xl font-bold">Lumpsum Calculator</h1>
            <p className="text-muted-foreground">Loading...</p>
          </main>
        </div>
      }
    >
      <LumpsumCalculatorContent />
    </Suspense>
  );
}
