"use client";

import { useEffect, useMemo, useState } from "react";
import { Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

export default function LumpsumCalculator() {
  const [investedAmount, setInvestedAmount] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [expectedReturn, setExpectedReturn] = useState<string>("");
  const [futureValue, setFutureValue] = useState<number | null>(null);

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
      { name: "Invested ", value: invested, fill: "var(--color-invested)" },
      { name: "Profit", value: profit, fill: "var(--color-profit)" },
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

        <div className="w-full max-w-4xl grid gap-6 md:grid-cols-2">
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

          <Card className="w-full">
            <CardHeader className="items-center pb-0">
              <CardTitle>Investment Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-6">
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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
