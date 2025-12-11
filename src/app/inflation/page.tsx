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

function InflationCalculatorContent() {
  const searchParams = useSearchParams();

  const [presentAmount, setPresentAmount] = useState<string>("");
  const [inflationRate, setInflationRate] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [futurePurchasingPower, setFuturePurchasingPower] = useState<
    number | null
  >(null);
  const [futureAmount, setFutureAmount] = useState<number | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    const amount = searchParams.get("amount");
    const inflation = searchParams.get("inflation");
    const dur = searchParams.get("duration");

    if (amount && !Number.isNaN(Number(amount)) && Number(amount) > 0) {
      setPresentAmount(amount);
    }
    if (
      inflation &&
      !Number.isNaN(Number(inflation)) &&
      Number(inflation) >= 0
    ) {
      setInflationRate(inflation);
    }
    if (dur && !Number.isNaN(Number(dur)) && Number(dur) > 0) {
      setDuration(dur);
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
        const newUrl = `${window.location.pathname}${
          newSearchString ? `?${newSearchString}` : ""
        }`;
        window.history.replaceState(null, "", newUrl);
      }
    },
    [searchParams],
  );

  useEffect(() => {
    const principal = parseFloat(presentAmount);
    const rate = parseFloat(inflationRate);
    const time = parseFloat(duration);

    if (principal > 0 && time > 0 && rate >= 0) {
      const calculatedValue = principal / (1 + rate / 100) ** time;
      setFuturePurchasingPower(calculatedValue);
      const futureValue = principal * (1 + rate / 100) ** time;
      setFutureAmount(futureValue);
    } else {
      setFuturePurchasingPower(null);
      setFutureAmount(null);
    }
  }, [presentAmount, inflationRate, duration]);

  useEffect(() => {
    if (!initialized) return;
    updateSearchParams({
      amount: presentAmount,
      inflation: inflationRate,
      duration: duration,
    });
  }, [presentAmount, inflationRate, duration, updateSearchParams, initialized]);

  const numbers = useMemo(() => {
    const principal = parseFloat(presentAmount);
    const future = futurePurchasingPower || 0;
    const futureAmt = futureAmount || 0;
    if (
      !Number.isFinite(principal) ||
      principal <= 0 ||
      !Number.isFinite(future) ||
      future <= 0
    ) {
      return { principal: 0, future: 0, loss: 0, futureAmount: 0 };
    }
    const loss = Math.max(principal - future, 0);
    return { principal, future, loss, futureAmount: futureAmt };
  }, [presentAmount, futurePurchasingPower, futureAmount]);

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
    remaining: {
      label: "Remaining Purchasing Power",
      color: "var(--chart-1)",
    },
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
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-sans sm:p-20">
      <main className="row-start-2 flex w-full flex-col items-center gap-[32px]">
        <h1 className="font-bold text-4xl">Inflation Calculator</h1>
        <p className="text-muted-foreground">
          Calculate how inflation affects your money's purchasing power
        </p>

        <div className="grid w-full max-w-4xl gap-12 md:grid-cols-2">
          <div className="w-full rounded-lg border bg-card p-6 shadow-xs">
            <div className="flex flex-col gap-y-4">
              <div>
                <label
                  htmlFor="amount"
                  className="mb-1 block font-medium text-sm"
                >
                  Present Amount
                </label>
                <input
                  id="amount"
                  type="number"
                  value={presentAmount}
                  onChange={(e) => setPresentAmount(e.target.value)}
                  placeholder="10000"
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="inflation"
                  className="mb-1 block font-medium text-sm"
                >
                  Expected Inflation Rate (%)
                </label>
                <input
                  id="inflation"
                  type="number"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(e.target.value)}
                  placeholder="5"
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="mb-1 block font-medium text-sm"
                >
                  Duration (Years)
                </label>
                <input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="10"
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex flex-col gap-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    Future Purchasing Power:
                  </span>
                  <span
                    className={cn(
                      "font-bold text-lg",
                      futurePurchasingPower !== null
                        ? "text-red-600"
                        : "text-muted-foreground",
                    )}
                  >
                    {futurePurchasingPower !== null
                      ? `₹${futurePurchasingPower.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}`
                      : "Enter values above"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    Amount Required in{" "}
                    {new Date().getFullYear() + parseFloat(duration || "0")}:
                  </span>
                  <span
                    className={cn(
                      "font-bold text-lg",
                      futureAmount !== null ? "" : "text-muted-foreground",
                    )}
                  >
                    {futureAmount !== null
                      ? `₹${futureAmount.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}`
                      : "Enter values above"}
                  </span>
                </div>

                {futurePurchasingPower !== null && purchasingPowerLoss > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      Purchasing Power Loss:
                    </span>
                    <span className="font-bold text-red-600 text-sm">
                      {purchasingPowerLoss.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="items-center pb-0">
              <h3 className="font-semibold text-lg">
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
                <div className="mt-4 flex flex-col gap-2">
                  {chartData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded-xs"
                          style={{
                            backgroundColor: item.fill,
                          }}
                        />
                        <span className="font-medium text-sm">{item.name}</span>
                      </div>
                      <span className="font-bold text-sm">
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

export default function InflationCalculator() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-sans sm:p-20">
          <main className="row-start-2 flex w-full flex-col items-center gap-[32px]">
            <h1 className="font-bold text-4xl">Inflation Calculator</h1>
            <p className="text-muted-foreground">Loading...</p>
          </main>
        </div>
      }
    >
      <InflationCalculatorContent />
    </Suspense>
  );
}
