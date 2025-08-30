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

export default function InflationCalculator() {
  const [presentAmount, setPresentAmount] = useState<string>("");
  const [inflationRate, setInflationRate] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [futurePurchasingPower, setFuturePurchasingPower] = useState<
    number | null
  >(null);

  useEffect(() => {
    const principal = parseFloat(presentAmount);
    const rate = parseFloat(inflationRate);
    const time = parseFloat(duration);

    if (principal > 0 && time > 0 && rate >= 0) {
      const calculatedValue = principal / (1 + rate / 100) ** time;
      setFuturePurchasingPower(calculatedValue);
    } else {
      setFuturePurchasingPower(null);
    }
  }, [presentAmount, inflationRate, duration]);

  const numbers = useMemo(() => {
    const principal = parseFloat(presentAmount);
    const future = futurePurchasingPower || 0;
    if (
      !Number.isFinite(principal) ||
      principal <= 0 ||
      !Number.isFinite(future) ||
      future <= 0
    ) {
      return { principal: 0, future: 0, loss: 0 };
    }
    const loss = Math.max(principal - future, 0);
    return { principal, future, loss };
  }, [presentAmount, futurePurchasingPower]);

  const chartData = useMemo(() => {
    if (numbers.principal <= 0 && numbers.future <= 0)
      return [] as Array<{ name: string; value: number; fill: string }>;
    const remaining = numbers.future;
    const loss = numbers.loss;
    return [
      {
        name: "Remaining Purchasing Power",
        value: remaining,
        fill: "var(--chart-1)",
      },
      { name: "Lost to Inflation", value: loss, fill: "var(--chart-2)" },
    ];
  }, [numbers]);

  const chartConfig: ChartConfig = {
    remaining: { label: "Remaining Purchasing Power", color: "var(--chart-1)" },
    loss: { label: "Lost to Inflation", color: "var(--chart-2)" },
  };

  const purchasingPowerLoss = useMemo(() => {
    const principal = parseFloat(presentAmount);
    const future = futurePurchasingPower || 0;
    if (principal > 0 && future > 0) {
      return ((principal - future) / principal) * 100;
    }
    return 0;
  }, [presentAmount, futurePurchasingPower]);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center w-full">
        <h1 className="text-4xl font-bold">Inflation Calculator</h1>
        <p className="text-muted-foreground">
          Calculate how inflation affects your money's purchasing power
        </p>

        <div className="w-full max-w-4xl grid gap-12 md:grid-cols-2">
          <div className="w-full p-6 border rounded-lg shadow-sm bg-card">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium mb-1"
                >
                  Present Amount
                </label>
                <input
                  id="amount"
                  type="number"
                  value={presentAmount}
                  onChange={(e) => setPresentAmount(e.target.value)}
                  placeholder="10000"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="inflation"
                  className="block text-sm font-medium mb-1"
                >
                  Expected Inflation Rate (%)
                </label>
                <input
                  id="inflation"
                  type="number"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(e.target.value)}
                  placeholder="5"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium mb-1"
                >
                  Duration (Years)
                </label>
                <input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="10"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Future Purchasing Power:
                  </span>
                  <span
                    className={cn(
                      "text-lg font-bold",
                      futurePurchasingPower !== null
                        ? "text-red-600"
                        : "text-muted-foreground",
                    )}
                  >
                    {futurePurchasingPower !== null
                      ? `₹${futurePurchasingPower.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                      : "Enter values above"}
                  </span>
                </div>

                {futurePurchasingPower !== null && purchasingPowerLoss > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Purchasing Power Loss:
                    </span>
                    <span className="text-sm font-bold text-red-600">
                      {purchasingPowerLoss.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="items-center pb-0">
              <h3 className="text-lg font-semibold">
                Purchasing Power Breakdown
              </h3>
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
                        <span className="text-sm font-medium">{item.name}</span>
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
