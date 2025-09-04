"use client";

import { useEffect, useMemo, useState } from "react";
import { Pie, PieChart } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

export default function MultiplierCalculator() {
  const [principal, setPrincipal] = useState<string>("");
  const [expectedReturn, setExpectedReturn] = useState<string>("");
  const [multiplier, setMultiplier] = useState<string>("");
  const [timeRequired, setTimeRequired] = useState<number | null>(null);

  useEffect(() => {
    const p = parseFloat(principal);
    const r = parseFloat(expectedReturn);
    const m = parseFloat(multiplier);

    if (p > 0 && r > 0 && m > 1) {
      const calculatedTime = Math.log(m) / Math.log(1 + r / 100);
      setTimeRequired(calculatedTime);
    } else {
      setTimeRequired(null);
    }
  }, [principal, expectedReturn, multiplier]);

  const futureValue = useMemo(() => {
    const p = parseFloat(principal);
    const m = parseFloat(multiplier);
    return p > 0 && m > 1 ? p * m : 0;
  }, [principal, multiplier]);

  const numbers = useMemo(() => {
    const p = parseFloat(principal);
    const fv = futureValue;
    if (!Number.isFinite(p) || p <= 0 || !Number.isFinite(fv) || fv <= 0) {
      return { principal: 0, final: 0, profit: 0 };
    }
    const profit = Math.max(fv - p, 0);
    return { principal: p, final: fv, profit };
  }, [principal, futureValue]);

  const chartData = useMemo(() => {
    if (numbers.principal <= 0 && numbers.final <= 0)
      return [] as Array<{ name: string; value: number; fill: string }>;
    const invested = numbers.principal;
    const profit = numbers.profit;
    return [
      { name: "Initial ", value: invested, fill: "var(--chart-1)" },
      { name: "Growth", value: profit, fill: "var(--chart-2)" },
    ];
  }, [numbers]);

  const chartConfig: ChartConfig = {
    initial: { label: "Initial Amount", color: "var(--chart-1)" },
    growth: { label: "Growth", color: "var(--chart-2)" },
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center w-full">
        <h1 className="text-4xl font-bold">Multiplier Calculator</h1>
        <p className="text-muted-foreground">
          Calculate how long it takes to multiply your investment
        </p>

        <div className="w-full max-w-4xl grid gap-12 md:grid-cols-2">
          <div className="w-full p-6 border rounded-lg shadow-sm bg-card">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="principal"
                  className="block text-sm font-medium mb-1"
                >
                  Initial Amount
                </label>
                <input
                  id="principal"
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  placeholder="10000"
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

              <div>
                <label
                  htmlFor="multiplier"
                  className="block text-sm font-medium mb-1"
                >
                  Multiplier (e.g., 2 for double, 3 for triple)
                </label>
                <input
                  id="multiplier"
                  type="number"
                  value={multiplier}
                  onChange={(e) => setMultiplier(e.target.value)}
                  placeholder="2"
                  min="1.1"
                  step="0.1"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Time Required:</span>
                  <span
                    className={cn(
                      "text-lg font-bold",
                      timeRequired !== null
                        ? "text-green-600"
                        : "text-muted-foreground",
                    )}
                  >
                    {timeRequired !== null
                      ? `${timeRequired.toFixed(2)} years`
                      : "Enter values above"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Future Value:</span>
                  <span
                    className={cn(
                      "text-lg font-bold",
                      futureValue > 0
                        ? "text-blue-600"
                        : "text-muted-foreground",
                    )}
                  >
                    {futureValue > 0
                      ? `₹${futureValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                      : "Enter values above"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="items-center pb-0">
              <h3 className="text-lg font-semibold">Growth Breakdown</h3>
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
